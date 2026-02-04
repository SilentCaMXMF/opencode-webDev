import { Pool, PoolClient } from 'pg';
import pino from 'pino';
import {
  AgentMetrics,
  AppMetrics,
  CoreWebVitalsData,
  AgentStatus,
  MetricType,
  AgentType,
  AggregatedMetrics
} from '@types/monitoring';

const logger = pino({ transport: { target: 'pino-pretty' } });

export interface MetricsQueryOptions {
  metricType?: MetricType;
  agentType?: AgentType;
  startTime?: Date;
  endTime?: Date;
  aggregation?: string;
}

export class MetricsStorage {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'frontend_design_monitoring',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error({ error: err }, 'Unexpected error on idle client');
    });
  }

  async storeAgentMetrics(metrics: AgentMetrics): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Store agent metrics
      await client.query(
        `INSERT INTO agent_metrics (
          agent_type, agent_id, timestamp, status, response_time,
          task_completion_rate, error_rate, active_tasks, completed_tasks, failed_tasks,
          context7_queries_count, context7_queries_avg_time, context7_queries_success_rate,
          tool_usage_json, handoffs_received, handoffs_sent, avg_handoff_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          metrics.agentType,
          metrics.agentId,
          metrics.timestamp,
          metrics.status,
          metrics.metrics.responseTime,
          metrics.metrics.taskCompletionRate,
          metrics.metrics.errorRate,
          metrics.metrics.activeTasks,
          metrics.metrics.completedTasks,
          metrics.metrics.failedTasks,
          metrics.metrics.context7Queries.count,
          metrics.metrics.context7Queries.avgResponseTime,
          metrics.metrics.context7Queries.successRate,
          JSON.stringify(metrics.metrics.toolUsage),
          metrics.metrics.coordinationMetrics.handoffsReceived,
          metrics.metrics.coordinationMetrics.handoffsSent,
          metrics.metrics.coordinationMetrics.avgHandoffTime
        ]
      );

      // Store tool usage individually
      for (const [tool, count] of Object.entries(metrics.metrics.toolUsage)) {
        await client.query(
          `INSERT INTO agent_tool_usage (agent_type, agent_id, timestamp, tool_name, count)
           VALUES ($1, $2, $3, $4, $5)`,
          [metrics.agentType, metrics.agentId, metrics.timestamp, tool, count]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async storeAppMetrics(metrics: AppMetrics): Promise<void> {
    await this.pool.query(
      `INSERT INTO app_metrics (
        timestamp, session_id, url,
        js_execution_time, js_parsing_time, js_compilation_time, js_main_thread_blocking,
        bundle_total_size, bundle_gzipped_size, bundle_chunk_count, bundle_largest_chunk,
        render_first_paint, render_dom_content_loaded, render_load_complete, render_fps,
        mem_used, mem_limit, mem_js_heap_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        metrics.timestamp,
        metrics.sessionId,
        metrics.url,
        metrics.metrics.javascript.executionTime,
        metrics.metrics.javascript.parsingTime,
        metrics.metrics.javascript.compilationTime,
        metrics.metrics.javascript.mainThreadBlocking,
        metrics.metrics.bundle.totalSize,
        metrics.metrics.bundle.gzippedSize,
        metrics.metrics.bundle.chunkCount,
        metrics.metrics.bundle.largestChunk,
        metrics.metrics.rendering.firstPaint,
        metrics.metrics.rendering.domContentLoaded,
        metrics.metrics.rendering.loadComplete,
        metrics.metrics.rendering.fps,
        metrics.metrics.memory.used,
        metrics.metrics.memory.limit,
        metrics.metrics.memory.jsHeapSize
      ]
    );
  }

  async storeCoreWebVitals(metrics: CoreWebVitalsData): Promise<void> {
    await this.pool.query(
      `INSERT INTO core_web_vitals (
        timestamp, url, session_id, lcp, fid, cls, fcp, tti, performance_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        metrics.timestamp,
        metrics.url,
        metrics.sessionId,
        metrics.metrics.lcp,
        metrics.metrics.fid,
        metrics.metrics.cls,
        metrics.metrics.fcp,
        metrics.metrics.tti,
        metrics.performanceScore
      ]
    );
  }

  async queryMetrics(options: MetricsQueryOptions): Promise<any[]> {
    let query = 'SELECT * FROM ';
    let params: any[] = [];
    let conditions: string[] = [];

    if (options.metricType === MetricType.AGENT_RESPONSE_TIME ||
        options.metricType === MetricType.AGENT_TASK_COMPLETION) {
      query += 'agent_metrics';

      if (options.agentType) {
        conditions.push('agent_type = $' + (params.length + 1));
        params.push(options.agentType);
      }

      if (options.startTime) {
        conditions.push('timestamp >= $' + (params.length + 1));
        params.push(options.startTime);
      }

      if (options.endTime) {
        conditions.push('timestamp <= $' + (params.length + 1));
        params.push(options.endTime);
      }
    } else if (options.metricType === MetricType.CORE_WEB_VITALS) {
      query += 'core_web_vitals';

      if (options.startTime) {
        conditions.push('timestamp >= $' + (params.length + 1));
        params.push(options.startTime);
      }

      if (options.endTime) {
        conditions.push('timestamp <= $' + (params.length + 1));
        params.push(options.endTime);
      }
    } else {
      query += 'app_metrics';

      if (options.startTime) {
        conditions.push('timestamp >= $' + (params.length + 1));
        params.push(options.startTime);
      }

      if (options.endTime) {
        conditions.push('timestamp <= $' + (params.length + 1));
        params.push(options.endTime);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT 1000';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getRecentAgentMetrics(limit: number = 100): Promise<AgentMetrics[]> {
    const result = await this.pool.query(
      `SELECT * FROM agent_metrics ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      agentType: row.agent_type,
      agentId: row.agent_id,
      timestamp: row.timestamp,
      status: row.status,
      metrics: {
        responseTime: row.response_time,
        taskCompletionRate: row.task_completion_rate,
        errorRate: row.error_rate,
        activeTasks: row.active_tasks,
        completedTasks: row.completed_tasks,
        failedTasks: row.failed_tasks,
        context7Queries: {
          count: row.context7_queries_count,
          avgResponseTime: row.context7_queries_avg_time,
          successRate: row.context7_queries_success_rate
        },
        toolUsage: JSON.parse(row.tool_usage_json || '{}'),
        coordinationMetrics: {
          handoffsReceived: row.handoffs_received,
          handoffsSent: row.handoffs_sent,
          avgHandoffTime: row.avg_handoff_time
        }
      }
    }));
  }

  async getRecentAppMetrics(limit: number = 100): Promise<AppMetrics[]> {
    const result = await this.pool.query(
      `SELECT * FROM app_metrics ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      timestamp: row.timestamp,
      sessionId: row.session_id,
      url: row.url,
      metrics: {
        javascript: {
          executionTime: row.js_execution_time,
          parsingTime: row.js_parsing_time,
          compilationTime: row.js_compilation_time,
          mainThreadBlocking: row.js_main_thread_blocking
        },
        bundle: {
          totalSize: row.bundle_total_size,
          gzippedSize: row.bundle_gzipped_size,
          chunkCount: row.bundle_chunk_count,
          largestChunk: row.bundle_largest_chunk
        },
        rendering: {
          firstPaint: row.render_first_paint,
          domContentLoaded: row.render_dom_content_loaded,
          loadComplete: row.render_load_complete,
          fps: row.render_fps
        },
        memory: {
          used: row.mem_used,
          limit: row.mem_limit,
          jsHeapSize: row.mem_js_heap_size
        }
      }
    }));
  }

  async getRecentCoreWebVitals(limit: number = 100): Promise<CoreWebVitalsData[]> {
    const result = await this.pool.query(
      `SELECT * FROM core_web_vitals ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      timestamp: row.timestamp,
      url: row.url,
      sessionId: row.session_id,
      metrics: {
        lcp: row.lcp,
        fid: row.fid,
        cls: row.cls,
        fcp: row.fcp,
        tti: row.tti
      },
      performanceScore: row.performance_score
    }));
  }

  async getAgentStatus(): Promise<Array<{
    agentType: AgentType;
    status: AgentStatus;
    lastSeen: Date;
    avgResponseTime: number;
  }>> {
    const result = await this.pool.query(
      `SELECT
        agent_type,
        status,
        MAX(timestamp) as last_seen,
        AVG(response_time) as avg_response_time
       FROM agent_metrics
       WHERE timestamp > NOW() - INTERVAL '5 minutes'
       GROUP BY agent_type, status
       ORDER BY agent_type`
    );

    return result.rows.map(row => ({
      agentType: row.agent_type,
      status: row.status,
      lastSeen: row.last_seen,
      avgResponseTime: parseFloat(row.avg_response_time)
    }));
  }

  async getDatabaseStats(): Promise<{
    responseTime: number;
    connections: number;
    metricsStored: number;
  }> {
    const startTime = Date.now();
    await this.pool.query('SELECT 1');
    const responseTime = Date.now() - startTime;

    const [connections, metrics] = await Promise.all([
      this.pool.query('SELECT count(*) FROM pg_stat_activity'),
      this.pool.query(`
        SELECT
          (SELECT COUNT(*) FROM agent_metrics) +
          (SELECT COUNT(*) FROM app_metrics) +
          (SELECT COUNT(*) FROM core_web_vitals) as count
      `)
    ]);

    return {
      responseTime,
      connections: parseInt(connections.rows[0].count),
      metricsStored: parseInt(metrics.rows[0].count)
    };
  }

  async getAggregatedMetrics(
    agentType: AgentType,
    metricType: string,
    startTime: Date,
    endTime: Date,
    aggregation: string = '1h'
  ): Promise<AggregatedMetrics> {
    const query = `
      SELECT
        time_bucket($1, timestamp) as bucket,
        AVG(response_time) as avg,
        MIN(response_time) as min,
        MAX(response_time) as max,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time) as p50,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99
      FROM agent_metrics
      WHERE agent_type = $2
        AND timestamp >= $3
        AND timestamp <= $4
      GROUP BY bucket
      ORDER BY bucket
    `;

    const result = await this.pool.query(query, [
      aggregation,
      agentType,
      startTime,
      endTime
    ]);

    return {
      period: aggregation as any,
      metricType: metricType as MetricType,
      agentType,
      startTime,
      endTime,
      data: {
        timestamps: result.rows.map(r => r.bucket),
        values: result.rows.map(r => parseFloat(r.avg)),
        min: Math.min(...result.rows.map(r => parseFloat(r.min))),
        max: Math.max(...result.rows.map(r => parseFloat(r.max))),
        avg: result.rows.reduce((sum, r) => sum + parseFloat(r.avg), 0) / result.rows.length,
        p50: parseFloat(result.rows[0]?.p50 || 0),
        p95: parseFloat(result.rows[0]?.p95 || 0),
        p99: parseFloat(result.rows[0]?.p99 || 0)
      }
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
