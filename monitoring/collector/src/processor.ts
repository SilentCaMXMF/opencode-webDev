import pino from 'pino';
import { AgentMetrics, AppMetrics } from '@types/monitoring';
import { MetricsStorage } from './storage';

const logger = pino({ transport: { target: 'pino-pretty' } });

export class MetricsProcessor {
  private storage: MetricsStorage;
  private movingAverages: Map<string, number[]> = new Map();

  constructor(storage: MetricsStorage) {
    this.storage = storage;
  }

  async processAgentMetrics(metrics: AgentMetrics): Promise<void> {
    const key = `${metrics.agentType}_response_time`;
    const values = this.movingAverages.get(key) || [];

    values.push(metrics.metrics.responseTime);
    if (values.length > 100) {
      values.shift();
    }
    this.movingAverages.set(key, values);

    // Anomaly detection
    const avg = this.calculateAverage(values);
    const stdDev = this.calculateStandardDeviation(values, avg);

    if (stdDev > 0 && metrics.metrics.responseTime > avg + 2 * stdDev) {
      logger.warn({
        agentType: metrics.agentType,
        responseTime: metrics.metrics.responseTime,
        avg,
        stdDev
      }, 'Potential anomaly detected in agent response time');
    }

    // Check for agent health issues
    if (metrics.metrics.errorRate > 10) {
      logger.error({
        agentType: metrics.agentType,
        errorRate: metrics.metrics.errorRate
      }, 'High error rate detected');
    }

    if (metrics.metrics.taskCompletionRate < 80) {
      logger.warn({
        agentType: metrics.agentType,
        completionRate: metrics.metrics.taskCompletionRate
      }, 'Low task completion rate detected');
    }
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateAverage(squaredDiffs));
  }

  async calculatePerformanceScore(metrics: AgentMetrics): Promise<number> {
    let score = 100;

    // Response time impact (up to -30 points)
    if (metrics.metrics.responseTime > 5000) {
      score -= 30;
    } else if (metrics.metrics.responseTime > 3000) {
      score -= 20;
    } else if (metrics.metrics.responseTime > 1000) {
      score -= 10;
    }

    // Error rate impact (up to -40 points)
    if (metrics.metrics.errorRate > 20) {
      score -= 40;
    } else if (metrics.metrics.errorRate > 10) {
      score -= 30;
    } else if (metrics.metrics.errorRate > 5) {
      score -= 20;
    } else if (metrics.metrics.errorRate > 1) {
      score -= 10;
    }

    // Task completion rate impact (up to -30 points)
    if (metrics.metrics.taskCompletionRate < 50) {
      score -= 30;
    } else if (metrics.metrics.taskCompletionRate < 70) {
      score -= 20;
    } else if (metrics.metrics.taskCompletionRate < 90) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  async getAgentTrends(agentType: string, hours: number = 24): Promise<any> {
    // Implementation for trend analysis
    return {};
  }
}
