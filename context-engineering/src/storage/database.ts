import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { ContextEntry, ContextStats, SearchQuery } from '../types';

export class ContextStorage {
  private db: Database;
  private initialized = false;

  constructor(dbPath: string = './context-engineering/context.db') {
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const run = (sql: string, params?: any[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    // Create main context table
    await run(`
      CREATE TABLE IF NOT EXISTS context_entries (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL,
        relationships TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await run('CREATE INDEX IF NOT EXISTS idx_type ON context_entries(type)');
    await run('CREATE INDEX IF NOT EXISTS idx_title ON context_entries(title)');
    await run('CREATE INDEX IF NOT EXISTS idx_created_at ON context_entries(created_at)');
    await run('CREATE INDEX IF NOT EXISTS idx_updated_at ON context_entries(updated_at)');

    // Create full-text search table
    await run(`
      CREATE VIRTUAL TABLE IF NOT EXISTS context_fts USING fts5(
        id UNINDEXED,
        title,
        content,
        metadata,
        content='context_entries',
        content_rowid='rowid'
      )
    `);

    // Create triggers for FTS synchronization
    await run(`
      CREATE TRIGGER IF NOT EXISTS context_ai AFTER INSERT ON context_entries
      BEGIN
        INSERT INTO context_fts(id, title, content, metadata)
        VALUES (new.id, new.title, new.content, new.metadata);
      END
    `);

    await run(`
      CREATE TRIGGER IF NOT EXISTS context_ad AFTER DELETE ON context_entries
      BEGIN
        INSERT INTO context_fts(context_fts, id, title, content, metadata)
        VALUES('delete', old.id, old.title, old.content, old.metadata);
      END
    `);

    await run(`
      CREATE TRIGGER IF NOT EXISTS context_au AFTER UPDATE ON context_entries
      BEGIN
        INSERT INTO context_fts(context_fts, id, title, content, metadata)
        VALUES('delete', old.id, old.title, old.content, old.metadata);
        INSERT INTO context_fts(id, title, content, metadata)
        VALUES (new.id, new.title, new.content, new.metadata);
      END
    `);

    this.initialized = true;
  }

  async store(entry: ContextEntry): Promise<void> {
    await this.initialize();
    
    const run = (sql: string, params?: any[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    };
    
    await run(
      `INSERT OR REPLACE INTO context_entries 
       (id, type, title, content, metadata, relationships)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.type,
        entry.title,
        entry.content,
        JSON.stringify(entry.metadata),
        JSON.stringify(entry.relationships)
      ]
    );
  }

  async retrieve(id: string): Promise<ContextEntry | null> {
    await this.initialize();
    
    const get = (sql: string, params?: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, function(err, row) {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };
    
    const row = await get(
      'SELECT * FROM context_entries WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return this.parseRowToEntry(row);
  }

  async query(searchQuery: SearchQuery): Promise<{ entries: ContextEntry[], total: number }> {
    await this.initialize();
    
    let sql = 'SELECT * FROM context_entries WHERE 1=1';
    const params: any[] = [];

    // Add type filters
    if (searchQuery.types && searchQuery.types.length > 0) {
      sql += ` AND type IN (${searchQuery.types.map(() => '?').join(',')})`;
      params.push(...searchQuery.types);
    }

    // Add agent filters (search in metadata)
    if (searchQuery.agents && searchQuery.agents.length > 0) {
      const agentConditions = searchQuery.agents.map(() => 'metadata LIKE ?').join(' OR ');
      sql += ` AND (${agentConditions})`;
      params.push(...searchQuery.agents.map(agent => `%"${agent}"%`));
    }

    // Add tag filters (search in metadata)
    if (searchQuery.tags && searchQuery.tags.length > 0) {
      const tagConditions = searchQuery.tags.map(() => 'metadata LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      params.push(...searchQuery.tags.map(tag => `%"${tag}"%`));
    }

    // Add date range filters
    if (searchQuery.dateRange?.from) {
      sql += ' AND created_at >= ?';
      params.push(searchQuery.dateRange.from.toISOString());
    }

    if (searchQuery.dateRange?.to) {
      sql += ' AND created_at <= ?';
      params.push(searchQuery.dateRange.to.toISOString());
    }

    // Add full-text search if query provided
    if (searchQuery.query) {
      sql = `SELECT * FROM context_entries 
             WHERE id IN (
               SELECT id FROM context_fts 
               WHERE context_fts MATCH ?
             )`;
      params.unshift(searchQuery.query);
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const get = (sql: string, params?: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, function(err, row) {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };
    const countResult = await get(countSql, params);
    const total = countResult.total;

    // Add pagination
    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(searchQuery.limit, searchQuery.offset);

    const all = (sql: string, params?: any[]): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, function(err, rows) {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    const rows = await all(sql, params);

    const entries = rows.map((row: any) => this.parseRowToEntry(row));

    return { entries, total };
  }

  async getStatistics(): Promise<ContextStats> {
    await this.initialize();
    
    const all = (sql: string, params?: any[]): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, function(err, rows) {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    // Get total entries
    const totalResult = await all('SELECT COUNT(*) as total FROM context_entries');
    const totalEntries = totalResult[0].total;

    // Get entries by type
    const typeResults = await all(`
      SELECT type, COUNT(*) as count 
      FROM context_entries 
      GROUP BY type
    `);
    const entriesByType = typeResults.reduce((acc: any, row: any) => {
      acc[row.type] = row.count;
      return acc;
    }, {});

    // Get entries by agent (from metadata)
    const agentRows = await all('SELECT metadata FROM context_entries');
    const entriesByAgent: Record<string, number> = {};
    
    agentRows.forEach((row: any) => {
      try {
        const metadata = JSON.parse(row.metadata);
        metadata.agents?.forEach((agent: string) => {
          entriesByAgent[agent] = (entriesByAgent[agent] || 0) + 1;
        });
      } catch (e) {
        // Ignore parsing errors
      }
    });

    // Get average confidence
    const confidenceRows = await all('SELECT metadata FROM context_entries');
    let totalConfidence = 0;
    let confidenceCount = 0;

    confidenceRows.forEach((row: any) => {
      try {
        const metadata = JSON.parse(row.metadata);
        if (typeof metadata.confidence === 'number') {
          totalConfidence += metadata.confidence;
          confidenceCount++;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    return {
      totalEntries,
      entriesByType,
      entriesByAgent,
      averageConfidence,
      lastUpdated: new Date()
    };
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize();
    
    const run = (sql: string, params?: any[]): Promise<{ changes: number }> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
    };
    
    const result = await run('DELETE FROM context_entries WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async update(entry: ContextEntry): Promise<void> {
    await this.initialize();
    
    const run = (sql: string, params?: any[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    };
    
    // Update metadata timestamp
    entry.metadata.updatedAt = new Date();
    
    await run(
      `UPDATE context_entries 
       SET type = ?, title = ?, content = ?, metadata = ?, relationships = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        entry.type,
        entry.title,
        entry.content,
        JSON.stringify(entry.metadata),
        JSON.stringify(entry.relationships),
        entry.id
      ]
    );
  }

  private parseRowToEntry(row: any): ContextEntry {
    try {
      const metadata = JSON.parse(row.metadata);
      // Convert date strings back to Date objects
      metadata.createdAt = new Date(metadata.createdAt);
      metadata.updatedAt = new Date(metadata.updatedAt);
      
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        metadata,
        relationships: JSON.parse(row.relationships)
      };
    } catch (error) {
      throw new Error(`Failed to parse context entry: ${error}`);
    }
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}