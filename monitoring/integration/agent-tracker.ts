/**
 * Agent Performance Tracking Hook
 * Integrates with any agent in the Frontend Design Agent System
 */

import { AgentType, AgentStatus, AgentMetrics, MetricType } from '../types/monitoring';

export class AgentTracker {
  private agentType: AgentType;
  private agentId: string;
  private collectorUrl: string;
  private taskStartTime: Date | null = null;
  private context7QueryStart: Date | null = null;

  constructor(agentType: AgentType, agentId: string, collectorUrl: string = 'http://localhost:3000') {
    this.agentType = agentType;
    this.agentId = agentId;
    this.collectorUrl = collectorUrl;
  }

  /**
   * Start tracking a new task
   */
  startTask(taskType: string): void {
    this.taskStartTime = new Date();
  }

  /**
   * End tracking the current task
   */
  endTask(taskType: string, status: 'completed' | 'failed', error?: string): number {
    if (!this.taskStartTime) {
      throw new Error('No active task to end');
    }

    const duration = Date.now() - this.taskStartTime.getTime();
    this.taskStartTime = null;

    return duration;
  }

  /**
   * Track Context7 query
   */
  trackContext7Query(library: string, query: string, responseTime: number, success: boolean): void {
    // This would be sent to the metrics collector
    this.sendMetric('context7_query', {
      library,
      query,
      responseTime,
      success
    });
  }

  /**
   * Track tool usage
   */
  trackToolUsage(toolName: string, executionTime: number, success: boolean): void {
    this.sendMetric('tool_usage', {
      toolName,
      executionTime,
      success
    });
  }

  /**
   * Report agent metrics
   */
  async reportMetrics(metrics: {
    responseTime: number;
    taskCompletionRate: number;
    errorRate: number;
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    context7Queries?: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
    toolUsage?: Record<string, number>;
    coordinationMetrics?: {
      handoffsReceived: number;
      handoffsSent: number;
      avgHandoffTime: number;
    };
  }): Promise<void> {
    const agentMetrics: AgentMetrics = {
      agentType: this.agentType,
      agentId: this.agentId,
      timestamp: new Date(),
      status: AgentStatus.ACTIVE,
      metrics: {
        responseTime: metrics.responseTime,
        taskCompletionRate: metrics.taskCompletionRate,
        errorRate: metrics.errorRate,
        activeTasks: metrics.activeTasks,
        completedTasks: metrics.completedTasks,
        failedTasks: metrics.failedTasks,
        context7Queries: metrics.context7Queries || {
          count: 0,
          avgResponseTime: 0,
          successRate: 100
        },
        toolUsage: metrics.toolUsage || {},
        coordinationMetrics: metrics.coordinationMetrics || {
          handoffsReceived: 0,
          handoffsSent: 0,
          avgHandoffTime: 0
        }
      }
    };

    await this.sendMetric('agent_metrics', agentMetrics);
  }

  /**
   * Send metrics to collector
   */
  private async sendMetric(type: string, data: any): Promise<void> {
    try {
      const endpoint = this.getEndpoint(type);
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // Don't throw - we don't want to interrupt agent operations
    }
  }

  private getEndpoint(type: string): string {
    const endpoints: Record<string, string> = {
      'agent_metrics': `${this.collectorUrl}/api/v1/metrics/agent`,
      'context7_query': `${this.collectorUrl}/api/v1/metrics/context7`,
      'tool_usage': `${this.collectorUrl}/api/v1/metrics/tool`
    };

    return endpoints[type] || `${this.collectorUrl}/api/v1/metrics/${type}`;
  }
}

/**
 * Decorator to automatically track agent method execution
 */
export function TrackAgentTask(taskType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracker = (this as any).tracker as AgentTracker;
      tracker?.startTask(taskType);

      try {
        const result = await originalMethod.apply(this, args);
        tracker?.endTask(taskType, 'completed');
        return result;
      } catch (error) {
        tracker?.endTask(taskType, 'failed', (error as Error).message);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator to track Context7 queries
 */
export function TrackContext7Query(library: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracker = (this as any).tracker as AgentTracker;
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const responseTime = Date.now() - startTime;

        tracker?.trackContext7Query(library, args[0] || '', responseTime, true);

        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        tracker?.trackContext7Query(library, args[0] || '', responseTime, false);

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function to wrap agent implementation with tracking
 */
export function withTracking<T extends { new (...args: any[]): {} }>(
  agentClass: T,
  agentType: AgentType,
  agentId: string,
  collectorUrl?: string
) {
  return class extends agentClass {
    tracker: AgentTracker;

    constructor(...args: any[]) {
      super(...args);
      this.tracker = new AgentTracker(agentType, agentId, collectorUrl);
    }
  };
}
