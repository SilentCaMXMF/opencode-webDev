import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import pino from 'pino';
import { AgentMetrics, AppMetrics, CoreWebVitalsData, SystemHealth, AgentType, AgentStatus, MetricType } from '@types/monitoring';
import { MetricsStorage } from './storage';
import { MetricsProcessor } from './processor';
import { AlertManager } from '../alerting/src/alert-manager';

const logger = pino({ transport: { target: 'pino-pretty' } });

export class MetricsCollector {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private storage: MetricsStorage;
  private processor: MetricsProcessor;
  private alertManager: AlertManager;
  private clients: Set<WebSocket> = new Set();
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.storage = new MetricsStorage();
    this.processor = new MetricsProcessor(this.storage);
    this.alertManager = new AlertManager(this.storage);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      logger.info({ method: req.method, path: req.path }, 'Incoming request');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Agent metrics endpoint
    this.app.post('/api/v1/metrics/agent', async (req, res) => {
      try {
        const metrics: AgentMetrics = req.body;
        await this.storage.storeAgentMetrics(metrics);
        this.processor.processAgentMetrics(metrics);
        this.broadcastAgentMetrics(metrics);
        await this.alertManager.checkAgentMetrics(metrics);
        res.json({ success: true, message: 'Agent metrics received' });
      } catch (error) {
        logger.error({ error }, 'Error processing agent metrics');
        res.status(500).json({ error: 'Failed to process agent metrics' });
      }
    });

    // Application metrics endpoint
    this.app.post('/api/v1/metrics/app', async (req, res) => {
      try {
        const metrics: AppMetrics = req.body;
        await this.storage.storeAppMetrics(metrics);
        this.broadcastAppMetrics(metrics);
        await this.alertManager.checkAppMetrics(metrics);
        res.json({ success: true, message: 'App metrics received' });
      } catch (error) {
        logger.error({ error }, 'Error processing app metrics');
        res.status(500).json({ error: 'Failed to process app metrics' });
      }
    });

    // Core Web Vitals endpoint
    this.app.post('/api/v1/metrics/core-web-vitals', async (req, res) => {
      try {
        const metrics: CoreWebVitalsData = req.body;
        await this.storage.storeCoreWebVitals(metrics);
        this.broadcastCoreWebVitals(metrics);
        await this.alertManager.checkCoreWebVitals(metrics);
        res.json({ success: true, message: 'Core Web Vitals received' });
      } catch (error) {
        logger.error({ error }, 'Error processing Core Web Vitals');
        res.status(500).json({ error: 'Failed to process Core Web Vitals' });
      }
    });

    // Query metrics endpoint
    this.app.get('/api/v1/metrics', async (req, res) => {
      try {
        const { metricType, agentType, startTime, endTime, aggregation } = req.query;
        const metrics = await this.storage.queryMetrics({
          metricType: metricType as MetricType,
          agentType: agentType as AgentType,
          startTime: startTime ? new Date(startTime as string) : undefined,
          endTime: endTime ? new Date(endTime as string) : undefined,
          aggregation: aggregation as any
        });
        res.json(metrics);
      } catch (error) {
        logger.error({ error }, 'Error querying metrics');
        res.status(500).json({ error: 'Failed to query metrics' });
      }
    });

    // System health endpoint
    this.app.get('/api/v1/system/health', async (req, res) => {
      try {
        const health = await this.getSystemHealth();
        res.json(health);
      } catch (error) {
        logger.error({ error }, 'Error getting system health');
        res.status(500).json({ error: 'Failed to get system health' });
      }
    });

    // Agent status endpoint
    this.app.get('/api/v1/agents/status', async (req, res) => {
      try {
        const status = await this.storage.getAgentStatus();
        res.json(status);
      } catch (error) {
        logger.error({ error }, 'Error getting agent status');
        res.status(500).json({ error: 'Failed to get agent status' });
      }
    });

    // Alert rules management
    this.app.get('/api/v1/alerts/rules', async (req, res) => {
      try {
        const rules = await this.alertManager.getAlertRules();
        res.json(rules);
      } catch (error) {
        logger.error({ error }, 'Error getting alert rules');
        res.status(500).json({ error: 'Failed to get alert rules' });
      }
    });

    this.app.post('/api/v1/alerts/rules', async (req, res) => {
      try {
        const rule = req.body;
        await this.alertManager.createAlertRule(rule);
        res.json({ success: true, message: 'Alert rule created' });
      } catch (error) {
        logger.error({ error }, 'Error creating alert rule');
        res.status(500).json({ error: 'Failed to create alert rule' });
      }
    });

    // Active alerts
    this.app.get('/api/v1/alerts/active', async (req, res) => {
      try {
        const alerts = await this.alertManager.getActiveAlerts();
        res.json(alerts);
      } catch (error) {
        logger.error({ error }, 'Error getting active alerts');
        res.status(500).json({ error: 'Failed to get active alerts' });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket connection');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.info('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error({ error }, 'WebSocket error');
        this.clients.delete(ws);
      });

      // Send initial data
      this.sendInitialData(ws);
    });
  }

  private async sendInitialData(ws: WebSocket): Promise<void> {
    try {
      const [agentMetrics, appMetrics, coreWebVitals, alerts] = await Promise.all([
        this.storage.getRecentAgentMetrics(100),
        this.storage.getRecentAppMetrics(100),
        this.storage.getRecentCoreWebVitals(100),
        this.alertManager.getActiveAlerts()
      ]);

      ws.send(JSON.stringify({
        type: 'initial_data',
        data: {
          agentMetrics,
          appMetrics,
          coreWebVitals,
          alerts
        }
      }));
    } catch (error) {
      logger.error({ error }, 'Error sending initial data');
    }
  }

  private broadcastAgentMetrics(metrics: AgentMetrics): void {
    const message = JSON.stringify({ type: 'agent_metrics', data: metrics });
    this.broadcast(message);
  }

  private broadcastAppMetrics(metrics: AppMetrics): void {
    const message = JSON.stringify({ type: 'app_metrics', data: metrics });
    this.broadcast(message);
  }

  private broadcastCoreWebVitals(metrics: CoreWebVitalsData): void {
    const message = JSON.stringify({ type: 'core_web_vitals', data: metrics });
    this.broadcast(message);
  }

  private broadcastAlert(alert: any): void {
    const message = JSON.stringify({ type: 'alert', data: alert });
    this.broadcast(message);
  }

  private broadcast(message: string): void {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    const agentStatus = await this.storage.getAgentStatus();
    const dbStats = await this.storage.getDatabaseStats();
    const uptime = process.uptime();

    const activeAgents = agentStatus.filter(a => a.status === AgentStatus.ACTIVE || a.status === AgentStatus.PROCESSING).length;
    const totalAgents = agentStatus.length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (activeAgents < totalAgents * 0.8) {
      status = 'degraded';
    }
    if (activeAgents < totalAgents * 0.5) {
      status = 'unhealthy';
    }

    return {
      timestamp: new Date(),
      status,
      components: {
        database: {
          status: dbStats.responseTime < 1000 ? 'healthy' : 'degraded',
          responseTime: dbStats.responseTime,
          connections: dbStats.connections
        },
        cache: {
          status: 'healthy', // TODO: Implement cache health check
          hitRate: 0,
          memoryUsage: 0
        },
        collector: {
          status: 'healthy',
          uptime,
          metricsReceived: dbStats.metricsStored
        },
        dashboard: {
          status: 'healthy',
          uptime,
          activeConnections: this.clients.size
        }
      },
      agents: agentStatus.map(a => ({
        type: a.agentType,
        status: a.status,
        lastSeen: a.lastSeen,
        responseTime: a.avgResponseTime || 0
      }))
    };
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`Metrics collector started on port ${this.port}`);
    });
  }

  public stop(): void {
    this.wss.close();
    this.server.close();
    logger.info('Metrics collector stopped');
  }
}
