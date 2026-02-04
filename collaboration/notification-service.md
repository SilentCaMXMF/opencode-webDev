# Notification Service
**Component:** Collaboration Integration System
**Version:** 1.0.0
**Last Updated:** 2026-01-03

## Overview

The Notification Service manages team communication and alerting across multiple platforms including Slack, Microsoft Teams, and email. It provides activity feeds, summary reports, and intelligent alert routing for the Frontend Design Agent System.

## Features

### Platform Integration
- **Slack**: Channels, DMs, webhooks, interactive messages
- **Microsoft Teams**: Channels, adaptive cards, notifications
- **Email**: SMTP integration, HTML templates, attachments
- **Webhooks**: Custom webhook support for any platform

### Activity Feeds
- Real-time agent activity tracking
- Agent-specific feeds
- Filterable activity streams
- Activity aggregation
- Historical activity queries

### Alerting
- Configurable alert rules
- Multi-channel alert routing
- Alert acknowledgment
- Alert escalation
- Alert deduplication

### Summary Reports
- Daily/weekly activity summaries
- Performance reports
- Team summaries
- Custom report scheduling
- Multiple output formats

### Notifications
- Agent completion notifications
- Error and failure alerts
- PR and issue updates
- Deployment notifications
- Quality gate failures
- Security alerts

## API Reference

### Platform Integration

```typescript
interface NotificationService {
  // Slack Integration
  sendSlack(channel: string, message: SlackMessage): Promise<void>;
  sendSlackDM(userId: string, message: SlackMessage): Promise<void>;
  updateSlackMessage(channel: string, ts: string, message: SlackMessage): Promise<void>;

  // Teams Integration
  sendTeams(channel: string, message: TeamsMessage): Promise<void>;
  sendTeamsAdaptiveCard(channel: string, card: AdaptiveCard): Promise<void>;

  // Email Integration
  sendEmail(recipients: string[], email: Email): Promise<void>;
  sendEmailWithAttachments(recipients: string[], email: Email): Promise<void>;

  // Webhooks
  sendWebhook(url: string, payload: WebhookPayload): Promise<void>;
}

interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  username?: string;
  icon_emoji?: string;
  thread_ts?: string;
  reply_broadcast?: boolean;
}

interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'actions' | 'context' | 'image' | 'file';
  text?: TextObject;
  fields?: TextObject[];
  accessory?: BlockElement;
  elements?: BlockElement[];
}

interface TeamsMessage {
  text?: string;
  attachments?: TeamsAttachment[];
  type?: 'message';
}

interface AdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body: AdaptiveCardElement[];
  actions?: AdaptiveAction[];
  $schema?: string;
}

interface Email {
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}
```

### Activity Feed

```typescript
interface ActivityFeedService {
  /**
   * Log agent activity
   */
  logActivity(agentId: string, activity: AgentActivity): Promise<void>;

  /**
   * Get activity feed with filters
   */
  getFeed(filters: FeedFilters): Promise<ActivityEntry[]>;

  /**
   * Get agent-specific feed
   */
  getAgentFeed(agentId: string, limit?: number): Promise<ActivityEntry[]>;

  /**
   * Get realtime activity stream
   */
  streamActivity(agentId?: string): AsyncIterator<ActivityEntry>;

  /**
   * Search activity
   */
  searchActivity(query: string, filters?: FeedFilters): Promise<ActivityEntry[]>;

  /**
   * Get activity statistics
   */
  getStatistics(period: Period): Promise<ActivityStatistics>;
}

interface AgentActivity {
  type: ActivityType;
  taskId?: string;
  title: string;
  description?: string;
  status: 'started' | 'completed' | 'failed' | 'in-progress';
  metadata?: Record<string, any>;
  timestamp?: Date;
}

type ActivityType =
  | 'task-start'
  | 'task-complete'
  | 'task-fail'
  | 'code-change'
  | 'review-request'
  | 'deployment'
  | 'issue-create'
  | 'pr-create'
  | 'alert-trigger';

interface ActivityEntry {
  id: string;
  agentId: string;
  activity: AgentActivity;
  timestamp: Date;
  processed: boolean;
  notificationsSent: NotificationSummary[];
}

interface FeedFilters {
  agentId?: string;
  type?: ActivityType[];
  status?: string[];
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'agentId' | 'type';
  sortOrder?: 'asc' | 'desc';
}

interface ActivityStatistics {
  totalActivities: number;
  byAgent: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageProcessingTime: number;
  errorRate: number;
  topActivities: ActivityEntry[];
}
```

### Alerting

```typescript
interface AlertingService {
  /**
   * Create an alert
   */
  createAlert(alert: Alert): Promise<string>;

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Promise<Alert>;

  /**
   * Update alert
   */
  updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert>;

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, userId: string, note?: string): Promise<void>;

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, userId: string, resolution: string): Promise<void>;

  /**
   * Route alert based on rules
   */
  routeAlert(alert: Alert): Promise<AlertRoutingResult>;

  /**
   * Get active alerts
   */
  getActiveAlerts(filters?: AlertFilters): Promise<Alert[]>;

  /**
   * Get alert history
   */
  getAlertHistory(alertId: string): Promise<AlertEvent[]>;
}

interface Alert {
  id?: string;
  type: AlertType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  tags?: string[];
  triggeredAt?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

type AlertType =
  | 'agent-failure'
  | 'performance'
  | 'security'
  | 'quality-gate'
  | 'deployment'
  | 'resource-limit'
  | 'custom';

interface AlertRoutingResult {
  alert: Alert;
  channels: string[];
  users: string[];
  escalationLevel: number;
  estimatedResponseTime: number;
  notificationsSent: NotificationResult[];
}

interface AlertEvent {
  id: string;
  alertId: string;
  type: 'created' | 'acknowledged' | 'resolved' | 'escalated';
  timestamp: Date;
  userId?: string;
  note?: string;
  metadata?: Record<string, any>;
}
```

### Summary Reports

```typescript
interface SummaryReportService {
  /**
   * Generate daily summary
   */
  generateDailySummary(date?: Date): Promise<SummaryReport>;

  /**
   * Generate weekly summary
   */
  generateWeeklySummary(startOfWeek?: Date): Promise<SummaryReport>;

  /**
   * Generate custom summary
   */
  generateSummary(period: SummaryPeriod, filters?: SummaryFilters): Promise<SummaryReport>;

  /**
   * Schedule summary report
   */
  scheduleSummary(schedule: ScheduleConfig): Promise<string>;

  /**
   * Cancel scheduled summary
   */
  cancelSummary(scheduleId: string): Promise<void>;

  /**
   * Get summary report
   */
  getSummary(reportId: string): Promise<SummaryReport>;

  /**
   * List summary reports
   */
  listSummaries(limit?: number): Promise<SummaryReport[]>;
}

interface SummaryReport {
  id: string;
  period: SummaryPeriod;
  generatedAt: Date;
  summary: ReportSummary;
  agentActivities: AgentActivitySummary[];
  performanceMetrics: PerformanceMetrics;
  alerts: AlertSummary;
  achievements: Achievement[];
  recommendations: string[];
}

interface SummaryPeriod {
  start: Date;
  end: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
}

interface ReportSummary {
  totalActivities: number;
  completedTasks: number;
  failedTasks: number;
  totalAgentsActive: number;
  averageResponseTime: number;
  overallEfficiency: number;
}

interface AgentActivitySummary {
  agentId: string;
  agentName: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  topActivities: string[];
}

interface PerformanceMetrics {
  agentResponseTime: number;
  workflowCompletionTime: number;
  errorRate: number;
  uptime: number;
  qualityScore: number;
}

interface AlertSummary {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  averageResolutionTime: number;
}
```

### Notification Rules

```typescript
interface NotificationRuleService {
  /**
   * Create notification rule
   */
  createRule(rule: NotificationRule): Promise<string>;

  /**
   * Update rule
   */
  updateRule(ruleId: string, rule: NotificationRule): Promise<void>;

  /**
   * Delete rule
   */
  deleteRule(ruleId: string): Promise<void>;

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): Promise<NotificationRule>;

  /**
   * List rules
   */
  listRules(filters?: RuleFilters): Promise<NotificationRule[]>;

  /**
   * Evaluate rule against event
   */
  evaluateRule(rule: NotificationRule, event: Event): Promise<boolean>;

  /**
   * Enable/disable rule
   */
  toggleRule(ruleId: string, enabled: boolean): Promise<void>;
}

interface NotificationRule {
  id?: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  schedule?: ScheduleConfig;
  throttle?: ThrottleConfig;
}

interface RuleCondition {
  type: 'agent' | 'activity' | 'alert' | 'metric' | 'custom';
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'matches';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'slack' | 'teams' | 'email' | 'webhook' | 'alert';
  config: ActionConfig;
}

interface ThrottleConfig {
  enabled: boolean;
  maxNotifications: number;
  period: number; // in seconds
  cooldown: number; // in seconds
}
```

## Agent Integration

### Agent Activity Notifications

```typescript
class AgentActivityNotifier {
  constructor(
    private notificationService: NotificationService,
    private activityFeed: ActivityFeedService
  ) {}

  /**
   * Notify on agent task start
   */
  async onTaskStart(agentId: string, task: AgentTask): Promise<void> {
    // Log activity
    await this.activityFeed.logActivity(agentId, {
      type: 'task-start',
      taskId: task.id,
      title: `Started: ${task.title}`,
      description: task.description,
      status: 'started',
      metadata: { task }
    });

    // Send notification if important
    if (task.priority === 'high' || task.priority === 'critical') {
      await this.notificationService.sendSlack('#agent-activity', {
        text: `Task started: ${task.title}`,
        blocks: this.formatTaskStartMessage(agentId, task)
      });
    }
  }

  /**
   * Notify on agent task completion
   */
  async onTaskComplete(agentId: string, task: AgentTask, result: TaskResult): Promise<void> {
    // Log activity
    await this.activityFeed.logActivity(agentId, {
      type: 'task-complete',
      taskId: task.id,
      title: `Completed: ${task.title}`,
      description: result.summary,
      status: 'completed',
      metadata: { task, result }
    });

    // Send completion notification
    await this.notificationService.sendSlack('#agent-activity', {
      text: `Task completed: ${task.title}`,
      blocks: this.formatTaskCompleteMessage(agentId, task, result)
    });

    // Send summary for important tasks
    if (task.priority === 'high' || task.priority === 'critical') {
      await this.sendTaskSummary(agentId, task, result);
    }
  }

  /**
   * Notify on agent task failure
   */
  async onTaskFailure(agentId: string, task: AgentTask, error: Error): Promise<void> {
    // Log activity
    await this.activityFeed.logActivity(agentId, {
      type: 'task-fail',
      taskId: task.id,
      title: `Failed: ${task.title}`,
      description: error.message,
      status: 'failed',
      metadata: { task, error: error.stack }
    });

    // Create alert
    await this.notificationService.createAlert({
      type: 'agent-failure',
      severity: task.priority === 'critical' ? 'critical' : 'high',
      source: agentId,
      title: `Agent Task Failed: ${task.title}`,
      message: error.message,
      metadata: { task, error: error.stack },
      tags: ['agent', 'error', agentId]
    });

    // Send failure notification
    await this.notificationService.sendSlack('#alerts', {
      text: `❌ Agent Task Failed: ${task.title}`,
      blocks: this.formatTaskFailureMessage(agentId, task, error),
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Agent', value: agentId, short: true },
            { title: 'Task', value: task.id, short: true },
            { title: 'Error', value: error.message, short: false }
          ]
        }
      ]
    });
  }

  /**
   * Format task start message
   */
  private formatTaskStartMessage(agentId: string, task: AgentTask): SlackBlock[] {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚀 Task Started`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agent:* ${agentId}\n*Task:* ${task.title}\n*Priority:* ${task.priority}\n*Description:* ${task.description || 'N/A'}`
        }
      },
      {
        type: 'divider'
      }
    ];
  }

  /**
   * Format task complete message
   */
  private formatTaskCompleteMessage(agentId: string, task: AgentTask, result: TaskResult): SlackBlock[] {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `✅ Task Completed`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agent:* ${agentId}\n*Task:* ${task.title}\n*Duration:* ${result.duration}ms\n*Success:* ${result.success}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${result.summary}`
        }
      },
      {
        type: 'divider'
      }
    ];
  }

  /**
   * Format task failure message
   */
  private formatTaskFailureMessage(agentId: string, task: AgentTask, error: Error): SlackBlock[] {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `❌ Task Failed`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agent:* ${agentId}\n*Task:* ${task.title}\n*Priority:* ${task.priority}\n\n*Error:* ${error.message}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`\n${error.stack?.substring(0, 500)}\n\`\`\``
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Details' },
            url: `${this.getTaskURL(task.id)}`
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Retry' },
            action_id: `retry_task_${task.id}`
          }
        ]
      }
    ];
  }
}
```

### Code Review Notifications

```typescript
class CodeReviewNotifier {
  constructor(private notificationService: NotificationService) {}

  /**
   * Notify on review request
   */
  async onReviewRequest(pr: PullRequest, reviewers: string[]): Promise<void> {
    await this.notificationService.sendSlack('#code-review', {
      text: `📋 Review Request: ${pr.title}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Review Request' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*PR:* ${pr.html_url}\n*Title:* ${pr.title}\n*Author:* ${pr.author.login}\n\n*Reviewers:* ${reviewers.join(', ')}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View PR' },
              url: pr.html_url
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Start Review' },
              action_id: `start_review_${pr.number}`
            }
          ]
        }
      ]
    });

    // Send DM to each reviewer
    for (const reviewer of reviewers) {
      await this.sendReviewerDM(reviewer, pr);
    }
  }

  /**
   * Notify on review comments
   */
  async onReviewComment(pr: PullRequest, review: Review): Promise<void> {
    const channel = review.state === 'approved'
      ? '#code-review-approved'
      : review.state === 'changes_requested'
        ? '#code-review-changes'
        : '#code-review-comments';

    await this.notificationService.sendSlack(channel, {
      text: `Review ${review.state}: ${pr.title}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `Review ${review.state}` }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*PR:* ${pr.html_url}\n*Reviewer:* ${review.user.login}\n*Comments:* ${review.comments?.length || 0}`
          }
        }
      ],
      attachments: [
        {
          color: review.state === 'approved' ? 'good' : review.state === 'changes_requested' ? 'warning' : '#36a64f',
          text: review.body || ''
        }
      ]
    });
  }

  /**
   * Notify on automated review
   */
  async onAutomatedReview(pr: PullRequest, reviewResult: ReviewResult): Promise<void> {
    const passed = reviewResult.gateStatus.passed;
    const score = reviewResult.score.overall;

    await this.notificationService.sendSlack('#code-review', {
      text: `Automated Review: ${passed ? '✅ Passed' : '❌ Failed'}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Automated Review: ${passed ? 'Passed' : 'Failed'}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*PR:* ${pr.html_url}\n*Score:* ${score}/100\n*Status:* ${passed ? 'Passed' : 'Failed'}`
          }
        }
      ],
      attachments: [
        {
          color: passed ? 'good' : 'danger',
          fields: [
            { title: 'Code Quality', value: `${reviewResult.score.dimensions.codeQuality}`, short: true },
            { title: 'Performance', value: `${reviewResult.score.dimensions.performance}`, short: true },
            { title: 'Security', value: `${reviewResult.score.dimensions.security}`, short: true },
            { title: 'Accessibility', value: `${reviewResult.score.dimensions.accessibility}`, short: true }
          ]
        }
      ]
    });
  }

  /**
   * Send DM to reviewer
   */
  private async sendReviewerDM(reviewer: string, pr: PullRequest): Promise<void> {
    // Get reviewer's Slack user ID (implement mapping)
    const slackUserId = await this.getSlackUserId(reviewer);

    if (slackUserId) {
      await this.notificationService.sendSlackDM(slackUserId, {
        text: `You've been assigned to review: ${pr.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `You've been asked to review a pull request:\n\n*${pr.title}*\n${pr.html_url}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'View PR' },
                url: pr.html_url
              }
            ]
          }
        ]
      });
    }
  }
}
```

### Deployment Notifications

```typescript
class DeploymentNotifier {
  constructor(private notificationService: NotificationService) {}

  /**
   * Notify on deployment start
   */
  async onDeploymentStart(deployment: Deployment): Promise<void> {
    await this.notificationService.sendSlack('#deployments', {
      text: `🚀 Deployment Started: ${deployment.environment}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Deployment Started' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Environment:* ${deployment.environment}\n*Commit:* ${deployment.sha}\n*Branch:* ${deployment.ref}\n*Started By:* ${deployment.actor}`
          }
        }
      ]
    });
  }

  /**
   * Notify on deployment success
   */
  async onDeploymentSuccess(deployment: Deployment, duration: number): Promise<void> {
    await this.notificationService.sendSlack('#deployments', {
      text: `✅ Deployment Successful: ${deployment.environment}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Deployment Successful' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Environment:* ${deployment.environment}\n*Duration:* ${duration}s\n*URL:* ${deployment.url}`
          }
        }
      ],
      attachments: [
        {
          color: 'good',
          text: 'Deployment completed successfully!'
        }
      ]
    });
  }

  /**
   * Notify on deployment failure
   */
  async onDeploymentFailure(deployment: Deployment, error: string): Promise<void> {
    await this.notificationService.sendSlack('#alerts', {
      text: `❌ Deployment Failed: ${deployment.environment}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Deployment Failed' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Environment:* ${deployment.environment}\n*Commit:* ${deployment.sha}\n*Branch:* ${deployment.ref}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:*\n\`\`\`\n${error}\n\`\`\``
          }
        }
      ],
      attachments: [
        {
          color: 'danger',
          text: 'Deployment failed. Please check logs.'
        }
      ]
    });

    // Create alert
    await this.notificationService.createAlert({
      type: 'deployment',
      severity: 'critical',
      source: 'deployment',
      title: `Deployment Failed: ${deployment.environment}`,
      message: error,
      metadata: { deployment },
      tags: ['deployment', 'error', deployment.environment]
    });
  }

  /**
   * Notify on rollback
   */
  async onRollback(deployment: Deployment, reason: string): Promise<void> {
    await this.notificationService.sendSlack('#alerts', {
      text: `⚠️ Rollback: ${deployment.environment}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Rollback Initiated' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Environment:* ${deployment.environment}\n*To Version:* ${deployment.previousVersion}\n*Reason:* ${reason}`
          }
        }
      ],
      attachments: [
        {
          color: 'warning',
          text: 'Rollback initiated due to issues'
        }
      ]
    });
  }
}
```

### Summary Report Generation

```typescript
class SummaryReportGenerator {
  constructor(
    private summaryService: SummaryReportService,
    private notificationService: NotificationService
  ) {}

  /**
   * Generate and send daily summary
   */
  async sendDailySummary(date?: Date): Promise<void> {
    const summary = await this.summaryService.generateDailySummary(date);
    const message = this.formatSummaryMessage(summary, 'Daily');

    await this.notificationService.sendSlack('#daily-summary', {
      text: `Daily Summary: ${summary.period.start.toDateString()}`,
      blocks: message
    });

    // Send email summary
    await this.sendEmailSummary(summary, 'Daily');
  }

  /**
   * Generate and send weekly summary
   */
  async sendWeeklySummary(startOfWeek?: Date): Promise<void> {
    const summary = await this.summaryService.generateWeeklySummary(startOfWeek);
    const message = this.formatSummaryMessage(summary, 'Weekly');

    await this.notificationService.sendSlack('#weekly-summary', {
      text: `Weekly Summary: ${formatDate(summary.period.start)} - ${formatDate(summary.period.end)}`,
      blocks: message
    });

    // Send email summary
    await this.sendEmailSummary(summary, 'Weekly');
  }

  /**
   * Format summary message for Slack
   */
  private formatSummaryMessage(summary: SummaryReport, periodType: string): SlackBlock[] {
    return [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${periodType} Summary` }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Period:* ${formatDate(summary.period.start)} - ${formatDate(summary.period.end)}\n*Generated:* ${formatDate(summary.generatedAt)}`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n• Total Activities: ${summary.summary.totalActivities}\n• Completed Tasks: ${summary.summary.completedTasks}\n• Failed Tasks: ${summary.summary.failedTasks}\n• Active Agents: ${summary.summary.totalAgentsActive}\n• Avg Response Time: ${summary.summary.averageResponseTime}ms\n• Efficiency: ${Math.round(summary.summary.overallEfficiency * 100)}%`
        }
      },
      {
        type: 'divider'
      },
      ...this.formatAgentActivities(summary.agentActivities),
      {
        type: 'divider'
      },
      ...this.formatPerformanceMetrics(summary.performanceMetrics),
      {
        type: 'divider'
      },
      ...this.formatAlertSummary(summary.alerts),
      {
        type: 'divider'
      },
      ...this.formatAchievements(summary.achievements),
      {
        type: 'divider'
      },
      ...this.formatRecommendations(summary.recommendations)
    ];
  }

  /**
   * Format agent activities
   */
  private formatAgentActivities(activities: AgentActivitySummary[]): SlackBlock[] {
    const blocks: SlackBlock[] = [];

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: '*🤖 Agent Activities*' }
    });

    for (const activity of activities) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• ${activity.agentName} (${activity.agentId})\n  Tasks: ${activity.completedTasks}/${activity.totalTasks} | Avg Time: ${Math.round(activity.averageProcessingTime)}ms`
        }
      });
    }

    return blocks;
  }

  /**
   * Format performance metrics
   */
  private formatPerformanceMetrics(metrics: PerformanceMetrics): SlackBlock[] {
    return [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*📊 Performance Metrics*' }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• Agent Response Time: ${Math.round(metrics.agentResponseTime)}ms\n• Workflow Completion: ${Math.round(metrics.workflowCompletionTime)}ms\n• Error Rate: ${Math.round(metrics.errorRate * 100)}%\n• Uptime: ${Math.round(metrics.uptime * 100)}%\n• Quality Score: ${metrics.qualityScore}/100`
        }
      }
    ];
  }

  /**
   * Format alert summary
   */
  private formatAlertSummary(alerts: AlertSummary): SlackBlock[] {
    return [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*🚨 Alert Summary*' }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• Total: ${alerts.totalAlerts}\n• Critical: ${alerts.criticalAlerts}\n• High: ${alerts.highAlerts}\n• Acknowledged: ${alerts.acknowledgedAlerts}\n• Resolved: ${alerts.resolvedAlerts}\n• Avg Resolution: ${Math.round(alerts.averageResolutionTime)}min`
        }
      }
    ];
  }

  /**
   * Format achievements
   */
  private formatAchievements(achievements: Achievement[]): SlackBlock[] {
    if (achievements.length === 0) {
      return [{
        type: 'section',
        text: { type: 'mrkdwn', text: '*🏆 Achievements*\nNo achievements this period.' }
      }];
    }

    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*🏆 Achievements*' }
      }
    ];

    for (const achievement of achievements) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• ${achievement.icon} ${achievement.title}\n  ${achievement.description}`
        }
      });
    }

    return blocks;
  }

  /**
   * Format recommendations
   */
  private formatRecommendations(recommendations: string[]): SlackBlock[] {
    if (recommendations.length === 0) {
      return [];
    }

    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*💡 Recommendations*' }
      }
    ];

    for (const recommendation of recommendations) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• ${recommendation}`
        }
      });
    }

    return blocks;
  }

  /**
   * Send email summary
   */
  private async sendEmailSummary(summary: SummaryReport, periodType: string): Promise<void> {
    const html = this.generateEmailHTML(summary, periodType);

    await this.notificationService.sendEmail(['team@example.com'], {
      subject: `${periodType} Summary - ${formatDate(summary.period.start)}`,
      html,
      text: this.generateEmailText(summary, periodType)
    });
  }
}
```

## Configuration

```typescript
interface NotificationConfig {
  slack: {
    enabled: boolean;
    token: string;
    defaultChannel: string;
    agentActivityChannel: string;
    alertChannel: string;
    codeReviewChannel: string;
    deploymentChannel: string;
    summaryChannels: {
      daily: string;
      weekly: string;
    };
  };
  teams: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    tenantId: string;
    defaultChannel: string;
  };
  email: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
    replyTo?: string;
  };
  activityFeed: {
    enabled: boolean;
    retentionDays: number;
    maxSize: number;
  };
  alerting: {
    enabled: boolean;
    defaultSeverity: 'medium';
    autoEscalate: boolean;
    escalationRules: EscalationRule[];
  };
  summaries: {
    enabled: boolean;
    daily: {
      enabled: boolean;
      schedule: string; // Cron expression
      channels: string[];
    };
    weekly: {
      enabled: boolean;
      schedule: string;
      channels: string[];
    };
  };
  rules: {
    enabled: boolean;
    autoLoad: boolean;
    directory: string;
  };
}
```

## Best Practices

1. **Use appropriate channels** for different notification types
2. **Rate limit notifications** to prevent spam
3. **Aggregate related notifications** to reduce noise
4. **Use interactive components** in Slack for better UX
5. **Provide context** in all notifications
6. **Make notifications actionable** with clear next steps
7. **Include relevant links** for quick access
8. **Use consistent formatting** across notifications
9. **Allow users to customize** notification preferences
10. **Track notification metrics** to optimize delivery

---

## Next Steps

- [ ] Review [GitHub Integration Service](./github-integration-service.md)
- [ ] Check [Code Review Automation](./code-review-automation.md)
- [ ] Explore [Knowledge Management System](./knowledge-management.md)
