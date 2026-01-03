import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err || '')
};

export class DatabaseMigrator {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  async createDatabase(): Promise<void> {
    try {
      const dbName = process.env.DB_NAME || 'frontend_design_monitoring';

      // Check if database exists
      const result = await this.pool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (result.rows.length === 0) {
        logger.info(`Creating database: ${dbName}`);
        await this.pool.query(`CREATE DATABASE ${dbName}`);
        logger.info('Database created successfully');
      } else {
        logger.info(`Database ${dbName} already exists`);
      }
    } catch (error) {
      logger.error('Failed to create database', error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      // Connect to the target database
      const dbName = process.env.DB_NAME || 'frontend_design_monitoring';
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });

      // Read and execute schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf-8');

      logger.info('Running database migrations...');
      await pool.query(schema);
      logger.info('Migrations completed successfully');

      await pool.end();
    } catch (error) {
      logger.error('Failed to run migrations', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Run migrations if executed directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();

  migrator.createDatabase()
    .then(() => migrator.runMigrations())
    .then(() => migrator.close())
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed', error);
      process.exit(1);
    });
}
