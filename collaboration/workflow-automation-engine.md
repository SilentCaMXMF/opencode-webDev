# Workflow Automation Engine
**Component:** Collaboration Integration System
**Version:** 1.0.0
**Last Updated:** 2026-01-03

## Overview

The Workflow Automation Engine provides automated task creation, assignment, and workflow orchestration for the Frontend Design Agent System. It enables trigger-based automation, approval processes, status updates, and integration with agent handoff protocols.

## Features

### Automated Task Creation
- Create tasks from agent outputs
- Generate tasks from issues and PRs
- Template-based task generation
- Smart task assignment
- Task dependency management

### Workflow Triggers
- Event-based triggers (git events, agent events)
- Scheduled triggers (cron-based)
- Manual triggers
- Conditional triggers
- Chain triggers

### Approval Processes
- Multi-level approval workflows
- Required reviewers
- Approval conditions
- Approval routing
- Escalation rules

### Status Updates
- Automatic status tracking
- Status change notifications
- Progress reporting
- Dashboard integration
- Status history

### Workflow Orchestration
- Multi-step workflows
- Parallel execution
- Conditional branching
- Error handling and retry
- Workflow templates

### Integration
- GitHub Issues/PRs integration
- Agent handoff protocol integration
- CI/CD pipeline integration
- Notification integration
- Performance monitoring integration

## API Reference

### Workflow Definition

```typescript
interface WorkflowEngine {
  /**
   * Create a new workflow
   */
  createWorkflow(definition: WorkflowDefinition): Promise<string>;

  /**
   * Update workflow
   */
  updateWorkflow(id: string, definition: WorkflowDefinition): Promise<void>;

  /**
   * Delete workflow
   */
  deleteWorkflow(id: string): Promise<void>;

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): Promise<Workflow>;

  /**
   * List workflows
   */
  listWorkflows(filters?: WorkflowFilters): Promise<Workflow[]>;

  /**
   * Enable/disable workflow
   */
  toggleWorkflow(id: string, enabled: boolean): Promise<void>;

  /**
   * Duplicate workflow
   */
  duplicateWorkflow(id: string, newDefinition?: Partial<WorkflowDefinition>): Promise<string>;
}

interface WorkflowDefinition {
  name: string;
  description?: string;
  version: string;
  enabled: boolean;
  triggers: Trigger[];
  steps: WorkflowStep[];
  variables: Variable[];
  errorHandler?: ErrorHandler;
  timeout?: number;
  retries?: number;
}

interface Workflow {
  id: string;
  definition: WorkflowDefinition;
  status: 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionCount: number;
  successRate: number;
  averageDuration: number;
}
```

### Workflow Execution

```typescript
interface WorkflowExecutionService {
  /**
   * Execute workflow
   */
  executeWorkflow(id: string, input: WorkflowInput): Promise<WorkflowOutput>;

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): Promise<ExecutionStatus>;

  /**
   * List executions
   */
  listExecutions(workflowId?: string, filters?: ExecutionFilters): Promise<Execution[]>;

  /**
   * Cancel execution
   */
  cancelExecution(executionId: string): Promise<void>;

  /**
   * Retry execution
   */
  retryExecution(executionId: string): Promise<Execution>;

  /**
   * Get execution logs
   */
  getExecutionLogs(executionId: string): Promise<ExecutionLog[]>;
}

interface WorkflowInput {
  variables: Record<string, any>;
  context: Record<string, any>;
  metadata?: Record<string, any>;
}

interface WorkflowOutput {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'timeout';
  result: Record<string, any>;
  outputs: Record<string, any>;
  logs: ExecutionLog[];
  duration: number;
  startedAt: Date;
  completedAt?: Date;
}

interface ExecutionStatus {
  executionId: string;
  workflowId: string;
  status: ExecutionState;
  currentStep?: string;
  stepsCompleted: number;
  stepsTotal: number;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  error?: Error;
}

type ExecutionState =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

interface ExecutionLog {
  step: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}
```

### Triggers

```typescript
interface TriggerService {
  /**
   * Register a trigger
   */
  registerTrigger(trigger: Trigger): Promise<string>;

  /**
   * Update trigger
   */
  updateTrigger(triggerId: string, trigger: Trigger): Promise<void>;

  /**
   * Delete trigger
   */
  deleteTrigger(triggerId: string): Promise<void>;

  /**
   * Get trigger by ID
   */
  getTrigger(triggerId: string): Promise<Trigger>;

  /**
   * List triggers
   */
  listTriggers(workflowId?: string): Promise<Trigger[]>;

  /**
   * Enable/disable trigger
   */
  toggleTrigger(triggerId: string, enabled: boolean): Promise<void>;

  /**
   * Trigger event
   */
  triggerEvent(event: Event): Promise<TriggerResult[]>;

  /**
   * Test trigger
   */
  testTrigger(triggerId: string): Promise<TriggerTestResult>;
}

interface Trigger {
  id?: string;
  workflowId: string;
  name: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
  conditions?: TriggerCondition[];
  throttle?: ThrottleConfig;
}

type TriggerType =
  | 'github-event'
  | 'agent-event'
  | 'schedule'
  | 'manual'
  | 'webhook'
  | 'event-bus'
  | 'condition';

interface TriggerConfig {
  event?: string;
  schedule?: string; // Cron expression
  webhookUrl?: string;
  filter?: Record<string, any>;
}

interface TriggerCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'matches';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface ThrottleConfig {
  enabled: boolean;
  maxExecutions: number;
  period: number; // in seconds
}

interface TriggerResult {
  triggerId: string;
  workflowId: string;
  matched: boolean;
  executionId?: string;
  error?: Error;
}
```

### Approval Processes

```typescript
interface ApprovalService {
  /**
   * Create approval process
   */
  createApprovalProcess(process: ApprovalProcess): Promise<string>;

  /**
   * Get approval process
   */
  getApprovalProcess(processId: string): Promise<ApprovalProcess>;

  /**
   * Update approval process
   */
  updateApprovalProcess(processId: string, process: ApprovalProcess): Promise<ApprovalProcess>;

  /**
   * Delete approval process
   */
  deleteApprovalProcess(processId: string): Promise<void>;

  /**
   * Request approval
   */
  requestApproval(processId: string, context: ApprovalContext): Promise<string>;

  /**
   * Approve request
   */
  approve(requestId: string, approver: string, comment?: string): Promise<void>;

  /**
   * Reject request
   */
  reject(requestId: string, approver: string, reason: string): Promise<void>;

  /**
   * Get approval status
   */
  getApprovalStatus(requestId: string): Promise<ApprovalStatus>;

  /**
   * Escalate request
   */
  escalate(requestId: string, reason: string): Promise<void>;
}

interface ApprovalProcess {
  id?: string;
  name: string;
  description?: string;
  levels: ApprovalLevel[];
  rules: ApprovalRule[];
  escalation: EscalationConfig;
  timeout: number;
  notifications: NotificationConfig;
}

interface ApprovalLevel {
  id: string;
  name: string;
  approvers: string[];
  requiredApprovals: number;
  timeout: number;
  canDelegate: boolean;
}

interface ApprovalRule {
  type: 'unanimous' | 'majority' | 'any' | 'custom';
  conditions?: RuleCondition[];
}

interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
}

interface EscalationLevel {
  level: number;
  delay: number; // in seconds
  escalateTo: string[];
  notifyChannels: string[];
}

interface ApprovalStatus {
  requestId: string;
  processId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'timeout';
  currentLevel: number;
  levelsCompleted: number;
  approvals: Approval[];
  rejections: Rejection[];
  requestedAt: Date;
  completedAt?: Date;
  timeoutAt?: Date;
}

interface Approval {
  approver: string;
  level: number;
  approvedAt: Date;
  comment?: string;
}

interface Rejection {
  rejector: string;
  level: number;
  rejectedAt: Date;
  reason: string;
}
```

### Task Management

```typescript
interface TaskAutomationService {
  /**
   * Create task from template
   */
  createTask(template: TaskTemplate, variables: Record<string, any>): Promise<Task>;

  /**
   * Assign task
   */
  assignTask(taskId: string, assignee: string): Promise<void>;

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus, note?: string): Promise<void>;

  /**
   * Get task by ID
   */
  getTask(taskId: string): Promise<Task>;

  /**
   * List tasks
   */
  listTasks(filters?: TaskFilters): Promise<Task[]>;

  /**
   * Create task dependency
   */
  createDependency(parentId: string, childId: string): Promise<void>;

  /**
   * Get task dependencies
   */
  getDependencies(taskId: string): Promise<TaskDependency[]>;
}

interface TaskTemplate {
  name: string;
  description: string;
  type: 'issue' | 'pr' | 'agent-task' | 'custom';
  assignTo?: string;
  labels?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  milestones?: string[];
  variables: TemplateVariable[];
  steps: TaskStep[];
}

interface Task {
  id: string;
  templateId: string;
  name: string;
  description: string;
  type: string;
  status: TaskStatus;
  assignee?: string;
  labels: string[];
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  variables: Record<string, any>;
  steps: TaskExecution[];
  dependencies: TaskDependency[];
}

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled' | 'blocked';

interface TaskStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'agent';
  action: string;
  assignTo?: string;
  conditions?: RuleCondition[];
}

interface TaskExecution {
  stepId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  assignee?: string;
  result?: any;
  error?: Error;
}
```

### Reporting

```typescript
interface WorkflowReportingService {
  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowId: string, period?: Period): Promise<WorkflowMetrics>;

  /**
   * Generate report
   */
  generateReport(params: ReportParams): Promise<Report>;

  /**
   * Get execution statistics
   */
  getExecutionStats(period?: Period): Promise<ExecutionStats>;

  /**
   * Get task statistics
   */
  getTaskStats(period?: Period): Promise<TaskStats>;

  /**
   * Get approval statistics
   */
  getApprovalStats(period?: Period): Promise<ApprovalStats>;
}

interface WorkflowMetrics {
  workflowId: string;
  executions: {
    total: number;
    successful: number;
    failed: number;
    cancelled: number;
  };
  duration: {
    average: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  steps: StepMetrics[];
  errors: ErrorMetric[];
  performance: PerformanceMetric[];
}

interface Report {
  id: string;
  type: 'workflow' | 'execution' | 'task' | 'approval' | 'custom';
  title: string;
  generatedAt: Date;
  period: Period;
  data: ReportData;
  format: 'json' | 'csv' | 'pdf' | 'html';
}

interface ReportData {
  summary: ReportSummary;
  metrics: any;
  charts: Chart[];
  tables: Table[];
  insights: Insight[];
  recommendations: string[];
}

interface Chart {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  data: ChartData;
  options?: ChartOptions;
}

interface Table {
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
}
```

## Agent Integration

### Agent Handoff Workflow

```typescript
class AgentHandoffWorkflow {
  constructor(
    private workflowEngine: WorkflowEngine,
    private executionService: WorkflowExecutionService,
    private taskService: TaskAutomationService
  ) {}

  /**
   * Create agent handoff workflow
   */
  async createHandoffWorkflow(handoff: AgentHandoff): Promise<string> {
    const definition: WorkflowDefinition = {
      name: `Agent Handoff: ${handoff.fromAgent} → ${handoff.toAgent}`,
      description: `Handoff task from ${handoff.fromAgent} to ${handoff.toAgent}`,
      version: '1.0.0',
      enabled: true,
      triggers: [{
        type: 'agent-event',
        name: 'Handoff Trigger',
        config: {
          event: 'handoff-request',
          filter: {
            fromAgent: handoff.fromAgent,
            toAgent: handoff.toAgent
          }
        },
        enabled: true
      }],
      steps: [
        {
          id: 'validate-handoff',
          name: 'Validate Handoff',
          type: 'automated',
          action: 'validate-handoff',
          config: {
            handoffId: '{{handoff.id}}'
          }
        },
        {
          id: 'create-task',
          name: 'Create Task',
          type: 'automated',
          action: 'create-task',
          config: {
            template: 'agent-task',
            variables: {
              title: handoff.taskTitle,
              description: handoff.description,
              assignee: handoff.toAgent
            }
          }
        },
        {
          id: 'notify-recipient',
          name: 'Notify Recipient',
          type: 'automated',
          action: 'send-notification',
          config: {
            recipient: handoff.toAgent,
            message: `New task from ${handoff.fromAgent}: ${handoff.taskTitle}`
          }
        },
        {
          id: 'wait-acceptance',
          name: 'Wait for Acceptance',
          type: 'manual',
          action: 'accept-task',
          assignTo: handoff.toAgent,
          timeout: 86400 // 24 hours
        },
        {
          id: 'update-status',
          name: 'Update Status',
          type: 'automated',
          action: 'update-status',
          config: {
            status: 'in-progress'
          }
        }
      ],
      variables: [],
      errorHandler: {
        onTimeout: 'escalate',
        onFail: 'retry',
        maxRetries: 3
      },
      timeout: 86400,
      retries: 3
    };

    return await this.workflowEngine.createWorkflow(definition);
  }

  /**
   * Execute handoff
   */
  async executeHandoff(handoff: AgentHandoff): Promise<WorkflowOutput> {
    const input: WorkflowInput = {
      variables: {
        handoff,
        fromAgent: handoff.fromAgent,
        toAgent: handoff.toAgent
      },
      context: {
        source: 'agent-handoff',
        timestamp: new Date()
      }
    };

    return await this.executionService.executeWorkflow(handoff.workflowId, input);
  }

  /**
   * Monitor handoff progress
   */
  async monitorHandoff(handoffId: string): Promise<HandoffStatus> {
    const execution = await this.executionService.getExecutionStatus(handoffId);
    const task = await this.taskService.getTask(handoffId);

    return {
      handoffId,
      workflowStatus: execution.status,
      currentStep: execution.currentStep,
      taskStatus: task.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      duration: execution.duration
    };
  }
}
```

### Issue Creation Workflow

```typescript
class IssueCreationWorkflow {
  constructor(
    private workflowEngine: WorkflowEngine,
    private github: IssueService,
    private notifications: NotificationService
  ) {}

  /**
   * Create issue from agent output
   */
  async createIssueFromAgentOutput(output: AgentOutput): Promise<Issue> {
    // Create workflow execution
    const input: WorkflowInput = {
      variables: {
        agentOutput: output,
        title: this.extractTitle(output),
        description: this.formatDescription(output),
        labels: this.generateLabels(output),
        assignees: this.getAssignees(output)
      },
      context: {
        source: 'agent-output',
        agentId: output.agentId,
        timestamp: new Date()
      }
    };

    const result = await this.executionService.executeWorkflow('issue-creation', input);

    if (result.status === 'failed') {
      throw new Error(`Issue creation failed: ${result.result.error}`);
    }

    return result.result.issue;
  }

  /**
   * Create issue creation workflow
   */
  async createWorkflowDefinition(): Promise<string> {
    const definition: WorkflowDefinition = {
      name: 'Issue Creation from Agent Output',
      description: 'Automatically create GitHub issues from agent outputs',
      version: '1.0.0',
      enabled: true,
      triggers: [{
        type: 'agent-event',
        name: 'Agent Output Trigger',
        config: {
          event: 'task-complete'
        },
        conditions: [
          {
            field: 'output.createIssue',
            operator: '=',
            value: true
          }
        ],
        enabled: true
      }],
      steps: [
        {
          id: 'validate-input',
          name: 'Validate Input',
          type: 'automated',
          action: 'validate-issue-input',
          config: {
            required: ['title', 'description']
          }
        },
        {
          id: 'create-github-issue',
          name: 'Create GitHub Issue',
          type: 'automated',
          action: 'create-github-issue',
          config: {
            owner: '{{config.github.owner}}',
            repo: '{{config.github.repo}}',
            title: '{{variables.title}}',
            body: '{{variables.description}}',
            labels: '{{variables.labels}}',
            assignees: '{{variables.assignees}}'
          }
        },
        {
          id: 'add-to-project',
          name: 'Add to Project Board',
          type: 'automated',
          action: 'add-to-project',
          config: {
            projectId: '{{config.projects.default}}',
            column: 'To Do'
          }
        },
        {
          id: 'notify-team',
          name: 'Notify Team',
          type: 'automated',
          action: 'send-notification',
          config: {
            channel: '#issues',
            message: 'New issue created from agent output'
          }
        }
      ],
      variables: [],
      errorHandler: {
        onTimeout: 'notify',
        onFail: 'notify'
      }
    };

    return await this.workflowEngine.createWorkflow(definition);
  }

  /**
   * Extract title from agent output
   */
  private extractTitle(output: AgentOutput): string {
    return output.title || `Task from ${output.agentId}: ${output.taskId}`;
  }

  /**
   * Format description from agent output
   */
  private formatDescription(output: AgentOutput): string {
    return `## Agent Output

**Agent:** ${output.agentId}
**Task:** ${output.taskId}
**Timestamp:** ${output.timestamp}

## Description
${output.description || output.summary || 'No description provided.'}

## Context
\`\`\`json
${JSON.stringify(output.context || {}, null, 2)}
\`\`\`

## Recommendations
${output.recommendations?.map(r => `- ${r}`).join('\n') || 'None'}
`;
  }

  /**
   * Generate labels from agent output
   */
  private generateLabels(output: AgentOutput): string[] {
    const labels = ['frontend', 'automated', output.agentId];

    if (output.priority) {
      labels.push(`priority:${output.priority}`);
    }

    const typeLabels: Record<string, string> = {
      'FD-PO-04': 'performance',
      'FD-AX-05': 'accessibility',
      'FD-SC-08': 'security',
      'FD-TQ-07': 'testing'
    };

    if (typeLabels[output.agentId]) {
      labels.push(typeLabels[output.agentId]);
    }

    return labels;
  }

  /**
   * Get assignees for agent output
   */
  private getAssignees(output: AgentOutput): string[] {
    const assignees: Record<string, string[]> = {
      'FD-PO-04': ['@performance-team'],
      'FD-AX-05': ['@accessibility-team'],
      'FD-SC-08': ['@security-team'],
      'FD-TQ-07': ['@qa-team']
    };

    return assignees[output.agentId] || [];
  }
}
```

### Approval Workflow

```typescript
class ApprovalWorkflow {
  constructor(
    private approvalService: ApprovalService,
    private notifications: NotificationService,
    private github: PullRequestService
  ) {}

  /**
   * Create PR approval workflow
   */
  async createPRApprovalWorkflow(): Promise<string> {
    const process: ApprovalProcess = {
      name: 'PR Approval Workflow',
      description: 'Multi-level approval for pull requests',
      levels: [
        {
          id: 'code-review',
          name: 'Code Review',
          approvers: ['@code-reviewers'],
          requiredApprovals: 1,
          timeout: 86400, // 24 hours
          canDelegate: true
        },
        {
          id: 'tech-lead',
          name: 'Tech Lead Approval',
          approvers: ['@tech-lead'],
          requiredApprovals: 1,
          timeout: 43200, // 12 hours
          canDelegate: false
        },
        {
          id: 'final-approval',
          name: 'Final Approval',
          approvers: ['@maintainer'],
          requiredApprovals: 1,
          timeout: 21600, // 6 hours
          canDelegate: false
        }
      ],
      rules: [
        {
          type: 'unanimous',
          conditions: [
            {
              field: 'pr.labels',
              operator: 'contains',
              value: 'critical'
            }
          ]
        }
      ],
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 86400,
            escalateTo: ['@engineering-manager'],
            notifyChannels: ['#alerts']
          },
          {
            level: 2,
            delay: 172800,
            escalateTo: ['@vp-engineering'],
            notifyChannels: ['#alerts', '#engineering']
          }
        ]
      },
      timeout: 259200, // 72 hours
      notifications: {
        onRequested: ['#pr-approvals'],
        onApproved: ['#pr-approved'],
        onRejected: ['#pr-rejected'],
        onEscalated: ['#alerts']
      }
    };

    return await this.approvalService.createApprovalProcess(process);
  }

  /**
   * Request approval for PR
   */
  async requestApproval(pr: PullRequest): Promise<string> {
    const context: ApprovalContext = {
      type: 'pr-approval',
      prNumber: pr.number,
      prTitle: pr.title,
      prAuthor: pr.author.login,
      prUrl: pr.html_url,
      changedFiles: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
      labels: pr.labels.map(l => l.name)
    };

    const requestId = await this.approvalService.requestApproval(
      'pr-approval-workflow',
      context
    );

    // Send notification
    await this.notifications.sendSlack('#pr-approvals', {
      text: `Approval requested for PR #${pr.number}: ${pr.title}`,
      blocks: this.formatApprovalRequest(pr, requestId)
    });

    return requestId;
  }

  /**
   * Handle approval
   */
  async handleApproval(requestId: string, approver: string, approved: boolean, comment?: string): Promise<void> {
    if (approved) {
      await this.approvalService.approve(requestId, approver, comment);
    } else {
      await this.approvalService.reject(requestId, approver, comment || 'No reason provided');
    }

    const status = await this.approvalService.getApprovalStatus(requestId);

    // Send notification
    await this.notifications.sendSlack('#pr-approvals', {
      text: `PR ${approved ? 'approved' : 'rejected'} by ${approver}`,
      blocks: this.formatApprovalNotification(status, approver, approved, comment)
    });

    // If fully approved, merge PR
    if (status.status === 'approved') {
      const context = status.context as any;
      if (context.prNumber) {
        await this.github.mergePR(context.prNumber, {
          method: 'squash',
          commitTitle: `Merge PR #${context.prNumber}: ${context.prTitle}`,
          commitMessage: comment || ''
        });
      }
    }
  }

  /**
   * Format approval request
   */
  private formatApprovalRequest(pr: PullRequest, requestId: string): SlackBlock[] {
    return [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Approval Request' }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*PR:* ${pr.html_url}\n*Title:* ${pr.title}\n*Author:* ${pr.author.login}\n*Changes:* +${pr.additions} -${pr.deletions}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Approve' },
            action_id: `approve_${requestId}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Request Changes' },
            action_id: `reject_${requestId}`,
            style: 'danger'
          }
        ]
      }
    ];
  }

  /**
   * Format approval notification
   */
  private formatApprovalNotification(
    status: ApprovalStatus,
    approver: string,
    approved: boolean,
    comment?: string
  ): SlackBlock[] {
    return [
      {
        type: 'header',
        text: { type: 'plain_text', text: approved ? '✅ Approved' : '❌ Rejected' }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Approver:* ${approver}\n*Status:* ${status.status}\n*Progress:* ${status.levelsCompleted}/${status.levelsCompleted + 1}`
        }
      },
      comment ? {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Comment:*\n${comment}`
        }
      } : undefined,
      {
        type: 'divider'
      }
    ].filter(Boolean) as SlackBlock[];
  }
}
```

### Deployment Workflow

```typescript
class DeploymentWorkflow {
  constructor(
    private workflowEngine: WorkflowEngine,
    private executionService: WorkflowExecutionService,
    private notifications: NotificationService
  ) {}

  /**
   * Create deployment workflow
   */
  async createDeploymentWorkflow(): Promise<string> {
    const definition: WorkflowDefinition = {
      name: 'Deployment Workflow',
      description: 'Automated deployment pipeline with approval gates',
      version: '1.0.0',
      enabled: true,
      triggers: [{
        type: 'github-event',
        name: 'Push to Main',
        config: {
          event: 'push',
          filter: {
            branch: 'main'
          }
        },
        enabled: true
      }],
      steps: [
        {
          id: 'run-tests',
          name: 'Run Tests',
          type: 'automated',
          action: 'run-tests',
          timeout: 1800
        },
        {
          id: 'build',
          name: 'Build Application',
          type: 'automated',
          action: 'build',
          timeout: 1800
        },
        {
          id: 'request-approval',
          name: 'Request Deployment Approval',
          type: 'manual',
          action: 'approve-deployment',
          assignTo: '@tech-lead',
          timeout: 86400
        },
        {
          id: 'deploy-staging',
          name: 'Deploy to Staging',
          type: 'automated',
          action: 'deploy',
          config: {
            environment: 'staging'
          },
          timeout: 1800
        },
        {
          id: 'run-e2e-tests',
          name: 'Run E2E Tests',
          type: 'automated',
          action: 'run-e2e-tests',
          timeout: 3600
        },
        {
          id: 'approve-production',
          name: 'Approve Production Deployment',
          type: 'manual',
          action: 'approve-production',
          assignTo: '@maintainer',
          timeout: 86400
        },
        {
          id: 'deploy-production',
          name: 'Deploy to Production',
          type: 'automated',
          action: 'deploy',
          config: {
            environment: 'production'
          },
          timeout: 1800
        },
        {
          id: 'verify-deployment',
          name: 'Verify Deployment',
          type: 'automated',
          action: 'verify-deployment',
          timeout: 600
        },
        {
          id: 'notify-success',
          name: 'Notify Success',
          type: 'automated',
          action: 'send-notification',
          config: {
            channel: '#deployments',
            message: 'Deployment completed successfully'
          }
        }
      ],
      variables: [],
      errorHandler: {
        onTimeout: 'rollback',
        onFail: 'rollback'
      },
      timeout: 14400,
      retries: 1
    };

    return await this.workflowEngine.createWorkflow(definition);
  }

  /**
   * Execute deployment
   */
  async deploy(environment: 'staging' | 'production', sha: string): Promise<WorkflowOutput> {
    const input: WorkflowInput = {
      variables: {
        environment,
        sha,
        deployer: 'system'
      },
      context: {
        source: 'deployment',
        timestamp: new Date()
      }
    };

    const result = await this.executionService.executeWorkflow('deployment-workflow', input);

    if (result.status === 'failed') {
      await this.notifications.sendSlack('#alerts', {
        text: `❌ Deployment failed: ${environment}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Environment:* ${environment}\n*Commit:* ${sha}\n\nDeployment failed. Rollback initiated.`
            }
          }
        ]
      });
    }

    return result;
  }
}
```

## Configuration

```typescript
interface WorkflowConfig {
  engine: {
    enabled: boolean;
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    defaultRetries: number;
  };
  triggers: {
    enabled: boolean;
    eventBus: 'internal' | 'external';
    maxQueueSize: number;
  };
  approvals: {
    enabled: boolean;
    defaultTimeout: number;
    maxEscalationLevels: number;
    allowDelegation: boolean;
  };
  tasks: {
    enabled: boolean;
    autoCreate: boolean;
    autoAssign: boolean;
    defaultPriority: 'medium';
  };
  reporting: {
    enabled: boolean;
    retentionDays: number;
    aggregateInterval: string;
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    templates: Record<string, string>;
  };
  monitoring: {
    enabled: boolean;
    metricsEnabled: boolean;
    logsEnabled: boolean;
  };
}
```

## Best Practices

1. **Define clear workflow goals** and success criteria
2. **Use triggers appropriately** for workflow initiation
3. **Implement proper error handling** and retry logic
4. **Set reasonable timeouts** to prevent hanging workflows
5. **Use approval gates** for critical steps
6. **Monitor workflow performance** regularly
7. **Optimize workflow steps** based on metrics
8. **Document workflows** with clear descriptions
9. **Test workflows** thoroughly before production
10. **Use conditional logic** for complex decision trees

---

## Next Steps

- [ ] Review [Setup Guide](../SETUP.md)
- [ ] Check [Configuration Reference](../CONFIGURATION.md)
- [ ] Explore [GitHub Integration Service](./github-integration-service.md)
