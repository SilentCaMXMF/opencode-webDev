import { Pool } from 'pg';
import { AgentType, AgentStatus } from '@types/monitoring';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err || '')
};

export async function seedDatabase(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'frontend_design_monitoring',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    logger.info('Seeding database with sample data...');

    // Seed agent metrics for all 11 agents
    const agents = Object.values(AgentType);

    for (const agentType of agents) {
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - i * 60000); // One per minute
        const responseTime = Math.random() * 2000 + 500;
        const completionRate = Math.random() * 20 + 80;
        const errorRate = Math.random() * 5;

        await pool.query(
          `INSERT INTO agent_metrics (
            agent_type, agent_id, timestamp, status, response_time,
            task_completion_rate, error_rate, active_tasks, completed_tasks, failed_tasks,
            context7_queries_count, context7_queries_avg_time, context7_queries_success_rate,
            tool_usage_json, handoffs_received, handoffs_sent, avg_handoff_time, performance_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            agentType,
            `${agentType}-${i}`,
            timestamp,
            AgentStatus.ACTIVE,
            responseTime,
            completionRate,
            errorRate,
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 50) + 50,
            Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 10) + 1,
            Math.random() * 1000 + 200,
            95 + Math.random() * 5,
            JSON.stringify({
              read: Math.floor(Math.random() * 20),
              write: Math.floor(Math.random() * 10),
              context7_query_docs: Math.floor(Math.random() * 15)
            }),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.random() * 500 + 100,
            95
          ]
        );
      }
    }

    // Seed Core Web Vitals
    const urls = ['/dashboard', '/projects', '/settings', '/reports', '/agents'];
    for (let i = 0; i < 200; i++) {
      const timestamp = new Date(Date.now() - i * 30000);
      const lcp = Math.random() * 3000 + 1000;
      const fid = Math.random() * 150 + 50;
      const cls = Math.random() * 0.3;

      await pool.query(
        `INSERT INTO core_web_vitals (
          timestamp, url, session_id, lcp, fid, cls, fcp, tti, performance_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          timestamp,
          urls[Math.floor(Math.random() * urls.length)],
          `session-${i}`,
          lcp,
          fid,
          cls,
          lcp * 0.8,
          lcp * 1.2,
          lcp < 2500 && fid < 100 && cls < 0.1 ? 95 : lcp < 4000 && fid < 200 && cls < 0.25 ? 80 : 60
        ]
      );
    }

    // Seed alert rules
    await pool.query(
      `INSERT INTO alert_rules (id, name, enabled, metric_type, agent_type, condition, threshold, duration, severity, notification_channels)
      VALUES
        ('rule-1', 'High Response Time', true, 'agent_response_time', NULL, 'greater_than', 5000, 300, 'high', '[]'::jsonb),
        ('rule-2', 'High Error Rate', true, 'agent_error_rate', NULL, 'greater_than', 10, 300, 'critical', '[]'::jsonb),
        ('rule-3', 'Poor Core Web Vitals - LCP', true, 'core_web_vitals', NULL, 'greater_than', 4000, 300, 'high', '[]'::jsonb),
        ('rule-4', 'Poor Core Web Vitals - CLS', true, 'core_web_vitals', NULL, 'greater_than', 0.25, 300, 'high', '[]'::jsonb),
        ('rule-5', 'Low Task Completion Rate', true, 'agent_task_completion', NULL, 'less_than', 70, 600, 'medium', '[]'::jsonb)`
    );

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Failed to seed database', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed process failed', error);
      process.exit(1);
    });
}
