import pino from 'pino';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { Alert, AlertRule, AlertSeverity, AlertType, MetricType, AgentType, AgentMetrics, AppMetrics, CoreWebVitalsData } from '@types/monitoring';
import { MetricsStorage } from '../collector/src/storage';

const logger = pino({ transport: { target: 'pino-pretty' } });

interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook';
  config: any;
}

export class AlertManager {
  private storage: MetricsStorage;
  private emailTransporter: nodemailer.Transporter | null = null;
  private alertHistory: Map<string, { count: number; lastTriggered: Date }> = new Map();

  constructor(storage: MetricsStorage) {
    this.storage = storage;
    this.setupEmailTransporter();
  }

  private setupEmailTransporter(): void {
    if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_PORT) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT),
        secure: process.env.EMAIL_SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_SMTP_USER,
          pass: process.env.EMAIL_SMTP_PASSWORD,
        },
      });
    }
  }

  async checkAgentMetrics(metrics: AgentMetrics): Promise<void> {
    const rules = await this.getActiveAlertRulesForMetric(MetricType.AGENT_RESPONSE_TIME, metrics.agentType);

    for (const rule of rules) {
      await this.evaluateRule(rule, {
        agentType: metrics.agentType,
        agentId: metrics.agentId,
        metricValue: metrics.metrics.responseTime,
        timestamp: metrics.timestamp
      });
    }

    // Check error rate
    const errorRateRules = await this.getActiveAlertRulesForMetric(MetricType.AGENT_ERROR_RATE, metrics.agentType);
    for (const rule of errorRateRules) {
      await this.evaluateRule(rule, {
        agentType: metrics.agentType,
        agentId: metrics.agentId,
        metricValue: metrics.metrics.errorRate,
        timestamp: metrics.timestamp
      });
    }

    // Check task completion rate
    const completionRules = await this.getActiveAlertRulesForMetric(MetricType.AGENT_TASK_COMPLETION, metrics.agentType);
    for (const rule of completionRules) {
      await this.evaluateRule(rule, {
        agentType: metrics.agentType,
        agentId: metrics.agentId,
        metricValue: metrics.metrics.taskCompletionRate,
        timestamp: metrics.timestamp
      });
    }
  }

  async checkAppMetrics(metrics: AppMetrics): Promise<void> {
    // Check bundle size
    const bundleRules = await this.getActiveAlertRulesForMetric(MetricType.BUNDLE_SIZE);
    for (const rule of bundleRules) {
      await this.evaluateRule(rule, {
        metricValue: metrics.metrics.bundle.totalSize,
        timestamp: metrics.timestamp
      });
    }

    // Check memory usage
    const memoryRules = await this.getActiveAlertRulesForMetric(MetricType.MEMORY_USAGE);
    for (const rule of memoryRules) {
      await this.evaluateRule(rule, {
        metricValue: metrics.metrics.memory.used,
        timestamp: metrics.timestamp
      });
    }
  }

  async checkCoreWebVitals(metrics: CoreWebVitalsData): Promise<void> {
    // Check LCP
    if (metrics.metrics.lcp) {
      const lcpRules = await this.getActiveAlertRulesForMetric(MetricType.CORE_WEB_VITALS);
      for (const rule of lcpRules) {
        if (rule.metadata?.vital === 'lcp') {
          await this.evaluateRule(rule, {
            metricValue: metrics.metrics.lcp,
            timestamp: metrics.timestamp,
            url: metrics.url
          });
        }
      }
    }

    // Check CLS
    if (metrics.metrics.cls) {
      const clsRules = await this.getActiveAlertRulesForMetric(MetricType.CORE_WEB_VITALS);
      for (const rule of clsRules) {
        if (rule.metadata?.vital === 'cls') {
          await this.evaluateRule(rule, {
            metricValue: metrics.metrics.cls,
            timestamp: metrics.timestamp,
            url: metrics.url
          });
        }
      }
    }

    // Check FID
    if (metrics.metrics.fid) {
      const fidRules = await this.getActiveAlertRulesForMetric(MetricType.CORE_WEB_VITALS);
      for (const rule of fidRules) {
        if (rule.metadata?.vital === 'fid') {
          await this.evaluateRule(rule, {
            metricValue: metrics.metrics.fid,
            timestamp: metrics.timestamp,
            url: metrics.url
          });
        }
      }
    }
  }

  private async evaluateRule(rule: AlertRule, context: {
    agentType?: AgentType;
    agentId?: string;
    metricValue: number;
    timestamp: Date;
    url?: string;
  }): Promise<void> {
    const triggered = this.checkCondition(rule.condition, context.metricValue, rule.threshold);

    if (!triggered) return;

    // Check if we should trigger alert (based on duration)
    const alertKey = `${rule.id}_${context.agentType || 'system'}`;
    const history = this.alertHistory.get(alertKey);

    const now = new Date();
    const timeSinceLastTrigger = history ? now.getTime() - history.lastTriggered.getTime() : Infinity;

    if (!history || timeSinceLastTrigger >= rule.duration * 1000) {
      await this.createAlert(rule, context);

      this.alertHistory.set(alertKey, {
        count: (history?.count || 0) + 1,
        lastTriggered: now
      });
    }
  }

  private checkCondition(condition: string, value: number, threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  private async createAlert(rule: AlertRule, context: any): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapMetricToAlertType(rule.metricType),
      severity: rule.severity,
      title: rule.name,
      message: this.generateAlertMessage(rule, context),
      timestamp: new Date(),
      agentType: context.agentType,
      metricType: rule.metricType,
      currentValue: context.metricValue,
      threshold: rule.threshold,
      acknowledged: false,
      resolved: false
    };

    await this.storage.storeAlert(alert);
    await this.sendNotifications(alert, rule.notificationChannels);
  }

  private mapMetricToAlertType(metricType: MetricType): AlertType {
    switch (metricType) {
      case MetricType.AGENT_RESPONSE_TIME:
      case MetricType.AGENT_TASK_COMPLETION:
      case MetricType.AGENT_ERROR_RATE:
        return AlertType.AGENT_ANOMALY;
      case MetricType.CORE_WEB_VITALS:
        return AlertType.CORE_WEB_VITALS;
      case MetricType.SYSTEM_HEALTH:
        return AlertType.SYSTEM_HEALTH;
      default:
        return AlertType.PERFORMANCE_THRESHOLD;
    }
  }

  private generateAlertMessage(rule: AlertRule, context: any): string {
    const agentStr = context.agentType ? `Agent: ${context.agentType}` : '';
    const urlStr = context.url ? `URL: ${context.url}` : '';
    const parts = [
      agentStr,
      urlStr,
      `Current: ${context.metricValue}`,
      `Threshold: ${rule.threshold}`
    ].filter(Boolean);

    return parts.join(' | ');
  }

  private async sendNotifications(alert: Alert, channels: string[]): Promise<void> {
    for (const channel of channels) {
      try {
        if (channel === 'email' && this.emailTransporter) {
          await this.sendEmailNotification(alert);
        } else if (channel === 'slack' && process.env.SLACK_WEBHOOK_URL) {
          await this.sendSlackNotification(alert);
        }
      } catch (error) {
        logger.error({ error, channel }, 'Failed to send notification');
      }
    }
  }

  private async sendEmailNotification(alert: Alert): Promise<void> {
    if (!this.emailTransporter || !process.env.EMAIL_TO) return;

    const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
    const html = `
      <h2>${alert.title}</h2>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Timestamp:</strong> ${alert.timestamp.toISOString()}</p>
      <p><strong>Metric Type:</strong> ${alert.metricType}</p>
      ${alert.agentType ? `<p><strong>Agent:</strong> ${alert.agentType}</p>` : ''}
      <p><strong>Current Value:</strong> ${alert.currentValue}</p>
      <p><strong>Threshold:</strong> ${alert.threshold}</p>
    `;

    await this.emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'monitoring@opencode.ai',
      to: process.env.EMAIL_TO,
      subject,
      html
    });

    logger.info({ alertId: alert.id }, 'Email notification sent');
  }

  private async sendSlackNotification(alert: Alert): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const colorMap: Record<AlertSeverity, string> = {
      critical: '#ff0000',
      high: '#ff6600',
      medium: '#ffcc00',
      low: '#00cc00',
      info: '#0099ff'
    };

    const message = {
      attachments: [
        {
          color: colorMap[alert.severity],
          title: alert.title,
          text: alert.message,
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Metric Type', value: alert.metricType, short: true },
            { title: 'Current Value', value: alert.currentValue.toString(), short: true },
            { title: 'Threshold', value: alert.threshold.toString(), short: true },
            { title: 'Timestamp', value: alert.timestamp.toISOString(), short: false }
          ]
        }
      ]
    };

    await axios.post(webhookUrl, message);
    logger.info({ alertId: alert.id }, 'Slack notification sent');
  }

  async getActiveAlertRules(): Promise<AlertRule[]> {
    // In a real implementation, this would query the database
    return [];
  }

  async getActiveAlertRulesForMetric(metricType: MetricType, agentType?: AgentType): Promise<AlertRule[]> {
    // In a real implementation, this would query the database
    // For now, return default rules
    if (metricType === MetricType.AGENT_RESPONSE_TIME) {
      return [{
        id: 'default-response-time',
        name: 'High Response Time',
        enabled: true,
        metricType,
        agentType,
        condition: 'greater_than',
        threshold: 5000,
        duration: 300,
        severity: AlertSeverity.HIGH,
        notificationChannels: []
      }];
    }

    if (metricType === MetricType.AGENT_ERROR_RATE) {
      return [{
        id: 'default-error-rate',
        name: 'High Error Rate',
        enabled: true,
        metricType,
        agentType,
        condition: 'greater_than',
        threshold: 10,
        duration: 300,
        severity: AlertSeverity.CRITICAL,
        notificationChannels: []
      }];
    }

    return [];
  }

  async createAlertRule(rule: Partial<AlertRule>): Promise<void> {
    // Store in database
    logger.info({ rule }, 'Alert rule created');
  }

  async getActiveAlerts(): Promise<Alert[]> {
    // Query database for active alerts
    return [];
  }
}
