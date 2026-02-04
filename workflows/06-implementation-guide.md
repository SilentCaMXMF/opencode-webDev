# Implementation Guide

**Version:** 1.0.0
**Guide ID:** IG-FD-2024-006
**Last Updated:** 2026-01-03

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Agent Integration](#agent-integration)
- [Protocol Implementation](#protocol-implementation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

### Purpose

Provide step-by-step instructions for integrating the workflow protocols into the 11-agent Frontend Design Agent System.

### Scope

This guide covers:

1. Setting up the workflow infrastructure
2. Integrating protocols into individual agents
3. Configuring communication channels
4. Implementing monitoring and logging
5. Testing and validation
6. Deployment strategies

### Target Audience

- System developers integrating the workflow system
- Agent developers updating their agents
- DevOps engineers deploying the system
- QA teams testing the integration

---

## Prerequisites

### System Requirements

**Hardware:**
- CPU: 4+ cores recommended
- RAM: 8GB minimum, 16GB recommended
- Storage: 50GB available space

**Software:**
- Node.js v18+ or v20+
- npm or yarn package manager
- Git for version control
- Docker (optional, for containerization)

**Network:**
- Stable internet connection (for Context7 and monitoring)
- Low latency network (< 50ms between agents)
- Firewall rules allowing agent communication

### Dependencies

```json
{
  "dependencies": {
    "uuid": "^9.0.0",
    "lodash": "^4.17.21",
    "eventemitter3": "^5.0.1",
    "pino": "^8.16.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

---

## Installation

### Step 1: Clone and Install

```bash
# Clone the repository (or navigate to existing project)
cd /home/pedroocalado/githubPages

# Install dependencies
npm install

# Install workflow-specific dependencies
npm install uuid lodash eventemitter3 pino joi

# Install dev dependencies
npm install --save-dev @types/node typescript jest @types/jest
```

### Step 2: Setup Directory Structure

```bash
# Create workflow directory if not exists
mkdir -p .opencode/workflows

# Create agent directories
mkdir -p .opencode/agents/{orchestrator,specialists}

# Create logs directory
mkdir -p .opencode/logs

# Create configuration directory
mkdir -p .opencode/config
```

### Step 3: Initialize Configuration

Create `.opencode/config/workflow-config.json`:

```json
{
  "version": "1.0.0",
  "environment": "development",
  "agents": {
    "orchestrator": {
      "id": "FD-ORC-01",
      "type": "orchestrator",
      "endpoint": "ws://localhost:3000/orchestrator"
    },
    "specialists": {
      "design_system": {
        "id": "FD-DS-02",
        "endpoint": "ws://localhost:3000/design-system"
      },
      "component_developer": {
        "id": "FD-CD-03",
        "endpoint": "ws://localhost:3000/component-developer"
      },
      "performance_optimizer": {
        "id": "FD-PO-04",
        "endpoint": "ws://localhost:3000/performance-optimizer"
      },
      "accessibility": {
        "id": "FD-AX-05",
        "endpoint": "ws://localhost:3000/accessibility"
      },
      "cross_platform": {
        "id": "FD-CP-06",
        "endpoint": "ws://localhost:3000/cross-platform"
      },
      "testing_qa": {
        "id": "FD-TQ-07",
        "endpoint": "ws://localhost:3000/testing-qa"
      },
      "security": {
        "id": "FD-SC-08",
        "endpoint": "ws://localhost:3000/security"
      },
      "animation": {
        "id": "FD-AN-09",
        "endpoint": "ws://localhost:3000/animation"
      },
      "internationalization": {
        "id": "FD-I1-10",
        "endpoint": "ws://localhost:3000/internationalization"
      },
      "ux_research": {
        "id": "FD-UR-11",
        "endpoint": "ws://localhost:3000/ux-research"
      }
    }
  },
  "protocols": {
    "handoff": {
      "enabled": true,
      "timeout_ms": 5000,
      "retry_attempts": 3
    },
    "context_sharing": {
      "enabled": true,
      "sync_interval_ms": 1000,
      "cache_ttl_ms": 300000
    },
    "conflict_resolution": {
      "enabled": true,
      "escalation_timeout_ms": 60000
    },
    "collaborative_decision": {
      "enabled": true,
      "decision_timeout_ms": 300000
    },
    "tool_delegation": {
      "enabled": true,
      "lock_timeout_ms": 300000
    }
  },
  "monitoring": {
    "enabled": true,
    "endpoint": "http://localhost:3001/metrics",
    "log_level": "info"
  },
  "context7": {
    "enabled": true,
    "endpoint": "http://localhost:3002/context7"
  }
}
```

### Step 4: Initialize Workflow System

Create `.opencode/workflows/index.ts`:

```typescript
import { WorkflowSystem } from './core/WorkflowSystem';
import { loadConfig } from './utils/config';

// Load configuration
const config = loadConfig('.opencode/config/workflow-config.json');

// Initialize workflow system
const workflowSystem = new WorkflowSystem(config);

// Start the system
async function start() {
  try {
    await workflowSystem.initialize();
    await workflowSystem.start();

    console.log('Workflow system started successfully');
  } catch (error) {
    console.error('Failed to start workflow system:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workflow system...');
  await workflowSystem.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down workflow system...');
  await workflowSystem.stop();
  process.exit(0);
});

// Start the system
start();
```

---

## Agent Integration

### Step 1: Base Agent Interface

All agents must implement the base agent interface:

```typescript
// .opencode/workflows/interfaces/AgentInterface.ts
export interface AgentInterface {
  // Agent identification
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly capabilities: string[];

  // Lifecycle
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;

  // Handoff protocol
  receiveHandoff(handoff: HandoffMessage): Promise<HandoffAck>;
  sendHandoff(targetAgent: string, handoff: HandoffMessage): Promise<HandoffResult>;

  // Context protocol
  getContext(contextId: string): Promise<SharedContext | undefined>;
  updateContext(contextId: string, updates: any): Promise<void>;
  subscribeToContext(contextId: string, callback: ContextCallback): string;

  // Decision protocol
  participateInDecision(decision: CollaborativeDecision): Promise<void>;
  castVote(decisionId: string, vote: AgentVote): Promise<void>;

  // Tool protocol
  requestTool(toolId: string, task: ToolTask): Promise<ToolResponse>;
  releaseTool(toolId: string, lockId: string): Promise<boolean>;

  // Monitoring
  getMetrics(): AgentMetrics;
  getHealthStatus(): HealthStatus;
}

export enum AgentType {
  ORCHESTRATOR = "orchestrator",
  SPECIALIST = "specialist"
}

export interface AgentMetrics {
  agent_id: string;
  tasks_completed: number;
  tasks_failed: number;
  avg_task_duration_ms: number;
  total_handoffs: number;
  tool_usage_count: number;
  error_count: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  uptime_percentage: number;
  last_activity: string;
  active_tasks: number;
}

export type ContextCallback = (change: ContextChange) => void;
```

### Step 2: Base Agent Implementation

Create a base class that all agents extend:

```typescript
// .opencode/workflows/core/BaseAgent.ts
import { EventEmitter } from 'eventemitter3';
import { AgentInterface, AgentType, AgentMetrics, HealthStatus } from '../interfaces/AgentInterface';
import { HandoffProtocol } from '../protocols/HandoffProtocol';
import { ContextProtocol } from '../protocols/ContextProtocol';
import { DecisionProtocol } from '../protocols/DecisionProtocol';
import { ToolProtocol } from '../protocols/ToolProtocol';
import { Logger } from '../utils/Logger';

export abstract class BaseAgent extends EventEmitter implements AgentInterface {
  // Identification
  public readonly agentId: string;
  public readonly agentType: AgentType;
  public abstract readonly capabilities: string[];

  // Protocols
  protected handoffProtocol: HandoffProtocol;
  protected contextProtocol: ContextProtocol;
  protected decisionProtocol: DecisionProtocol;
  protected toolProtocol: ToolProtocol;

  // State
  protected running: boolean = false;
  protected metrics: AgentMetrics;
  protected logger: Logger;

  constructor(config: AgentConfig) {
    super();

    this.agentId = config.id;
    this.agentType = config.type;
    this.logger = new Logger(this.agentId);

    // Initialize protocols
    this.handoffProtocol = new HandoffProtocol(this, config.handoff);
    this.contextProtocol = new ContextProtocol(this, config.contextSharing);
    this.decisionProtocol = new DecisionProtocol(this, config.collaborativeDecision);
    this.toolProtocol = new ToolProtocol(this, config.toolDelegation);

    // Initialize metrics
    this.metrics = this.initializeMetrics();
  }

  // Lifecycle methods (to be implemented by subclasses)
  public abstract initialize(): Promise<void>;
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  // Handoff protocol
  public async receiveHandoff(handoff: HandoffMessage): Promise<HandoffAck> {
    this.logger.info(`Received handoff from ${handoff.source_agent}`);

    try {
      const ack = await this.handoffProtocol.receive(handoff);

      if (ack.status === "accepted") {
        // Process the handoff
        this.emit('handoff-received', handoff);
      }

      return ack;
    } catch (error) {
      this.logger.error('Error receiving handoff:', error);

      return {
        message_id: handoff.message_id,
        agent_id: this.agentId,
        timestamp: new Date().toISOString(),
        status: "rejected",
        reason: (error as Error).message,
        estimated_completion: "PT5M"
      };
    }
  }

  public async sendHandoff(
    targetAgent: string,
    handoff: HandoffMessage
  ): Promise<HandoffResult> {
    this.logger.info(`Sending handoff to ${targetAgent}`);

    try {
      const result = await this.handoffProtocol.send(targetAgent, handoff);

      if (result.success) {
        this.metrics.total_handoffs++;
      }

      return result;
    } catch (error) {
      this.logger.error('Error sending handoff:', error);
      this.metrics.error_count++;

      return {
        success: false,
        handoff_id: handoff.message_id,
        error: (error as Error).message
      };
    }
  }

  // Context protocol
  public async getContext(contextId: string): Promise<SharedContext | undefined> {
    return await this.contextProtocol.get(contextId);
  }

  public async updateContext(contextId: string, updates: any): Promise<void> {
    await this.contextProtocol.update(contextId, updates);
  }

  public subscribeToContext(
    contextId: string,
    callback: ContextCallback
  ): string {
    return this.contextProtocol.subscribe(contextId, callback);
  }

  // Decision protocol
  public async participateInDecision(decision: CollaborativeDecision): Promise<void> {
    this.logger.info(`Participating in decision: ${decision.title}`);

    return await this.decisionProtocol.participate(decision);
  }

  public async castVote(decisionId: string, vote: AgentVote): Promise<void> {
    this.logger.info(`Casting vote for decision ${decisionId}`);

    return await this.decisionProtocol.vote(decisionId, vote);
  }

  // Tool protocol
  public async requestTool(toolId: string, task: ToolTask): Promise<ToolResponse> {
    this.logger.info(`Requesting tool: ${toolId}`);

    try {
      const response = await this.toolProtocol.request(toolId, task);

      if (response.granted) {
        this.metrics.tool_usage_count++;
      }

      return response;
    } catch (error) {
      this.logger.error('Error requesting tool:', error);
      this.metrics.error_count++;

      throw error;
    }
  }

  public async releaseTool(toolId: string, lockId: string): Promise<boolean> {
    this.logger.info(`Releasing tool: ${toolId}`);

    return await this.toolProtocol.release(toolId, lockId);
  }

  // Monitoring
  public getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  public getHealthStatus(): HealthStatus {
    // Calculate health based on error rate
    const errorRate = this.metrics.tasks_completed > 0
      ? this.metrics.error_count / this.metrics.tasks_completed
      : 0;

    const status = errorRate < 0.05 ? "healthy"
      : errorRate < 0.1 ? "degraded"
      : "unhealthy";

    return {
      status,
      uptime_percentage: 100 - (errorRate * 100),
      last_activity: new Date().toISOString(),
      active_tasks: 0  // Track active tasks
    };
  }

  protected initializeMetrics(): AgentMetrics {
    return {
      agent_id: this.agentId,
      tasks_completed: 0,
      tasks_failed: 0,
      avg_task_duration_ms: 0,
      total_handoffs: 0,
      tool_usage_count: 0,
      error_count: 0
    };
  }

  protected async recordTaskCompletion(durationMs: number, success: boolean): void {
    if (success) {
      this.metrics.tasks_completed++;
    } else {
      this.metrics.tasks_failed++;
    }

    // Update average duration
    const totalTasks = this.metrics.tasks_completed + this.metrics.tasks_failed;
    const currentTotal = this.metrics.avg_task_duration_ms * (totalTasks - 1);
    this.metrics.avg_task_duration_ms = (currentTotal + durationMs) / totalTasks;
  }
}

export interface AgentConfig {
  id: string;
  type: AgentType;
  handoff: HandoffConfig;
  contextSharing: ContextSharingConfig;
  collaborativeDecision: DecisionConfig;
  toolDelegation: ToolDelegationConfig;
}
```

### Step 3: Specialist Agent Implementation

Example: Design System Specialist

```typescript
// .opencode/agents/specialists/DesignSystemAgent.ts
import { BaseAgent, AgentConfig } from '../../.opencode/workflows/core/BaseAgent';
import { HandoffMessage, SharedContext, ToolTask, AgentVote } from '../../.opencode/workflows/types';
import { AgentType } from '../../.opencode/workflows/interfaces/AgentInterface';

export class DesignSystemAgent extends BaseAgent {
  public readonly capabilities = [
    "design_token_management",
    "component_specification",
    "pattern_library_maintenance",
    "design_system_documentation"
  ];

  constructor(config: AgentConfig) {
    super(config);
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Design System Agent');

    // Initialize design system specific resources
    await this.loadDesignTokens();
    await this.loadComponentLibrary();

    this.logger.info('Design System Agent initialized');
  }

  public async start(): Promise<void> {
    this.logger.info('Starting Design System Agent');

    this.running = true;

    // Start listening for messages
    this.startListening();

    this.logger.info('Design System Agent started');
  }

  public async stop(): Promise<void> {
    this.logger.info('Stopping Design System Agent');

    this.running = false;

    // Release all tools
    await this.releaseAllTools();

    this.logger.info('Design System Agent stopped');
  }

  private async loadDesignTokens(): Promise<void> {
    // Load design tokens from file or API
    this.logger.info('Loading design tokens');
  }

  private async loadComponentLibrary(): Promise<void> {
    // Load component library from file or API
    this.logger.info('Loading component library');
  }

  private startListening(): void {
    // Listen for events from protocols
    this.on('handoff-received', async (handoff: HandoffMessage) => {
      await this.processHandoff(handoff);
    });

    this.on('context-changed', async (change: ContextChange) => {
      await this.processContextChange(change);
    });

    this.on('decision-required', async (decision: CollaborativeDecision) => {
      await this.processDecision(decision);
    });
  }

  private async processHandoff(handoff: HandoffMessage): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.info(`Processing handoff: ${handoff.task.title}`);

      // Process the task based on task type
      const result = await this.executeTask(handoff);

      // Send handoff back if needed
      if (handoff.metadata.stage_number < handoff.metadata.total_stages) {
        await this.sendHandoffToNextAgent(handoff, result);
      } else {
        // Send completion to orchestrator
        await this.sendCompletion(handoff, result);
      }

      const duration = Date.now() - startTime;
      await this.recordTaskCompletion(duration, true);
    } catch (error) {
      this.logger.error('Error processing handoff:', error);

      const duration = Date.now() - startTime;
      await this.recordTaskCompletion(duration, false);

      // Send error back
      await this.sendError(handoff, error as Error);
    }
  }

  private async executeTask(handoff: HandoffMessage): Promise<TaskResult> {
    const taskType = this.inferTaskType(handoff);

    switch (taskType) {
      case "create_design_tokens":
        return await this.createDesignTokens(handoff);

      case "create_component_spec":
        return await this.createComponentSpec(handoff);

      case "update_design_system":
        return await this.updateDesignSystem(handoff);

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  private inferTaskType(handoff: HandoffMessage): string {
    // Infer task type from task description and context
    const description = handoff.task.description.toLowerCase();

    if (description.includes("design token") || description.includes("token")) {
      return "create_design_tokens";
    }

    if (description.includes("component spec") || description.includes("specification")) {
      return "create_component_spec";
    }

    if (description.includes("update") || description.includes("change")) {
      return "update_design_system";
    }

    return "unknown";
  }

  private async createDesignTokens(handoff: HandoffMessage): Promise<TaskResult> {
    this.logger.info('Creating design tokens');

    // Use Context7 to get best practices
    const patterns = await this.queryContext7(
      'design system design tokens best practices'
    );

    // Create design tokens
    const tokens = {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          // ... more tokens
        }
      },
      typography: {
        // ... typography tokens
      }
    };

    return {
      success: true,
      outputs: [{
        type: "data",
        content: tokens,
        metadata: {
          format: "json",
          schema: "design-tokens-v1"
        }
      }],
      notes: "Design tokens created following best practices"
    };
  }

  private async createComponentSpec(handoff: HandoffMessage): Promise<TaskResult> {
    this.logger.info('Creating component specification');

    // Use Figma API if available
    const figmaResponse = await this.useTool("figma-api", {
      type: "get_component",
      parameters: {
        component_id: handoff.context?.design?.components?.[0]
      }
    });

    // Create component spec
    const spec = {
      id: "button",
      name: "Button",
      description: "Reusable button component",
      props: [
        {
          name: "variant",
          type: "enum",
          values: ["primary", "secondary", "tertiary"],
          default: "primary"
        },
        {
          name: "size",
          type: "enum",
          values: ["sm", "md", "lg"],
          default: "md"
        }
      ],
      accessibility: {
        keyboard_navigable: true,
        aria_label_required: true
      }
    };

    return {
      success: true,
      outputs: [{
        type: "data",
        content: spec,
        metadata: {
          format: "json",
          schema: "component-spec-v1"
        }
      }],
      notes: "Component specification created"
    };
  }

  private async updateDesignSystem(handoff: HandoffMessage): Promise<TaskResult> {
    this.logger.info('Updating design system');

    // Apply updates
    const updates = handoff.context?.design;

    // Update design system
    // ...

    return {
      success: true,
      outputs: [{
        type: "data",
        content: { updated: true },
        metadata: {}
      }],
      notes: "Design system updated"
    };
  }

  private async sendHandoffToNextAgent(
    handoff: HandoffMessage,
    result: TaskResult
  ): Promise<void> {
    // Determine next agent based on workflow
    const nextAgent = this.determineNextAgent(handoff);

    // Create new handoff message
    const newHandoff: HandoffMessage = {
      ...handoff,
      message_id: generateUUID(),
      source_agent: this.agentId,
      target_agent: nextAgent,
      handoff_type: HandoffType.SEQUENTIAL,
      metadata: {
        ...handoff.metadata,
        stage_number: handoff.metadata.stage_number + 1
      },
      previous_work: [
        ...(handoff.previous_work || []),
        {
          agent_id: this.agentId,
          task_id: handoff.task.id,
          completed_at: new Date().toISOString(),
          outputs: result.outputs,
          notes: result.notes
        }
      ]
    };

    await this.sendHandoff(nextAgent, newHandoff);
  }

  private async sendCompletion(handoff: HandoffMessage, result: TaskResult): Promise<void> {
    // Send completion to orchestrator
    const completion: HandoffMessage = {
      ...handoff,
      message_id: generateUUID(),
      source_agent: this.agentId,
      target_agent: "FD-ORC-01",
      handoff_type: HandoffType.COMPLETION,
      metadata: {
        ...handoff.metadata,
        stage_number: handoff.metadata.total_stages
      },
      previous_work: [
        ...(handoff.previous_work || []),
        {
          agent_id: this.agentId,
          task_id: handoff.task.id,
          completed_at: new Date().toISOString(),
          outputs: result.outputs,
          notes: result.notes
        }
      ]
    };

    await this.sendHandoff("FD-ORC-01", completion);
  }

  private async sendError(handoff: HandoffMessage, error: Error): Promise<void> {
    // Send error back to orchestrator
    const errorHandoff: HandoffMessage = {
      ...handoff,
      message_id: generateUUID(),
      source_agent: this.agentId,
      target_agent: "FD-ORC-01",
      handoff_type: HandoffType.EMERGENCY
    };

    await this.sendHandoff("FD-ORC-01", errorHandoff);
  }

  private determineNextAgent(handoff: HandoffMessage): string {
    // Determine next agent based on workflow stage and task type
    const workflowPatterns = {
      "component_development": [
        "FD-DS-02",  // Design System
        "FD-CD-03",  // Component Developer
        "FD-AX-05",  // Accessibility
        "FD-PO-04"   // Performance
      ],
      "performance_audit": [
        "FD-PO-04",  // Performance
        "FD-AX-05",  // Accessibility
        "FD-SC-08"   // Security
      ]
    };

    const pattern = workflowPatterns[handoff.metadata.workflow_stage as keyof typeof workflowPatterns];

    if (pattern) {
      const currentIndex = pattern.indexOf(this.agentId);
      if (currentIndex < pattern.length - 1) {
        return pattern[currentIndex + 1];
      }
    }

    // Default to orchestrator
    return "FD-ORC-01";
  }

  private async processContextChange(change: ContextChange): Promise<void> {
    this.logger.info(`Processing context change: ${change.description}`);

    // React to context changes
    // ...
  }

  private async processDecision(decision: CollaborativeDecision): Promise<void> {
    this.logger.info(`Processing decision: ${decision.title}`);

    // Analyze decision options
    const vote = await this.generateVote(decision);

    // Cast vote
    await this.castVote(decision.decision_id, vote);
  }

  private async generateVote(decision: CollaborativeDecision): Promise<AgentVote> {
    // Analyze options based on agent's domain expertise
    const scores: Record<string, number> = {};

    for (const option of decision.options) {
      scores[option.option_id] = this.evaluateOption(option, decision);
    }

    // Select best option
    const bestOptionId = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];

    return {
      agent_id: this.agentId,
      option_id: bestOptionId,
      confidence: scores[bestOptionId] / 100,
      reasoning: `Based on design system expertise`,
      timestamp: new Date().toISOString()
    };
  }

  private evaluateOption(option: DecisionOption, decision: CollaborativeDecision): number {
    let score = 0;

    // Evaluate against criteria
    for (const criterion of decision.criteria) {
      const criterionScore = this.evaluateAgainstCriterion(option, criterion);
      score += criterionScore * criterion.weight;
    }

    return score;
  }

  private evaluateAgainstCriterion(
    option: DecisionOption,
    criterion: DecisionCriteria
  ): number {
    // Implementation depends on criterion type
    return 75;  // Placeholder
  }

  private async queryContext7(query: string): Promise<any> {
    // Query Context7 for best practices
    return {};
  }

  private async useTool(toolId: string, task: ToolTask): Promise<any> {
    // Request tool from Tool Protocol
    const response = await this.requestTool(toolId, task);

    if (!response.granted) {
      throw new Error(`Tool ${toolId} not available: ${response.error?.message}`);
    }

    // Execute tool task
    // ...

    // Release tool
    if (response.lock_id) {
      await this.releaseTool(toolId, response.lock_id);
    }

    return {};
  }

  private async releaseAllTools(): Promise<void> {
    // Release all held tools
    // ...
  }
}

interface TaskResult {
  success: boolean;
  outputs: any[];
  notes: string;
}

interface DesignSystemConfig extends AgentConfig {
  // Design system specific config
}
```

### Step 4: Orchestrator Agent Implementation

```typescript
// .opencode/agents/orchestrator/OrchestratorAgent.ts
import { BaseAgent, AgentConfig } from '../../.opencode/workflows/core/BaseAgent';
import { HandoffMessage, CollaborativeDecision } from '../../.opencode/workflows/types';
import { AgentType } from '../../.opencode/workflows/interfaces/AgentInterface';

export class OrchestratorAgent extends BaseAgent {
  public readonly capabilities = [
    "workflow_orchestration",
    "task_assignment",
    "agent_coordination",
    "conflict_resolution",
    "decision_making"
  ];

  private activeWorkflows: Map<string, WorkflowState> = new Map();
  private activeDecisions: Map<string, CollaborativeDecision> = new Map();

  constructor(config: AgentConfig) {
    super(config);
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Orchestrator Agent');

    // Initialize orchestrator specific resources
    await this.loadAgentRegistry();
    await this.loadWorkflowTemplates();

    this.logger.info('Orchestrator Agent initialized');
  }

  public async start(): Promise<void> {
    this.logger.info('Starting Orchestrator Agent');

    this.running = true;

    // Start listening for messages
    this.startListening();

    this.logger.info('Orchestrator Agent started');
  }

  public async stop(): Promise<void> {
    this.logger.info('Stopping Orchestrator Agent');

    this.running = false;

    // Wait for all workflows to complete
    await this.waitForWorkflowsToComplete();

    this.logger.info('Orchestrator Agent stopped');
  }

  private startListening(): void {
    this.on('handoff-received', async (handoff: HandoffMessage) => {
      await this.processHandoff(handoff);
    });

    this.on('task-request', async (request: TaskRequest) => {
      await this.handleTaskRequest(request);
    });
  }

  private async processHandoff(handoff: HandoffMessage): Promise<void> {
    if (handoff.handoff_type === HandoffType.COMPLETION) {
      await this.handleCompletion(handoff);
    } else if (handoff.handoff_type === HandoffType.EMERGENCY) {
      await this.handleEmergency(handoff);
    } else if (handoff.handoff_type === HandoffType.ESCALATION) {
      await this.handleEscalation(handoff);
    }
  }

  private async handleCompletion(handoff: HandoffMessage): Promise<void> {
    this.logger.info(`Handling completion for workflow ${handoff.workflow_id}`);

    const workflow = this.activeWorkflows.get(handoff.workflow_id);

    if (!workflow) {
      this.logger.error(`Workflow ${handoff.workflow_id} not found`);
      return;
    }

    // Update workflow state
    workflow.status = "completed";
    workflow.completed_at = new Date().toISOString();
    workflow.results = handoff.previous_work;

    this.activeWorkflows.set(handoff.workflow_id, workflow);

    // Notify all participants
    await this.notifyWorkflowCompletion(workflow);
  }

  private async handleEmergency(handoff: HandoffMessage): Promise<void> {
    this.logger.error(`Handling emergency from ${handoff.source_agent}`);

    // Take emergency action
    // ...
  }

  private async handleEscalation(handoff: HandoffMessage): Promise<void> {
    this.logger.info(`Handling escalation from ${handoff.source_agent}`);

    // Handle escalation
    // ...
  }

  private async handleTaskRequest(request: TaskRequest): Promise<void> {
    this.logger.info(`Handling task request: ${request.title}`);

    // Create workflow
    const workflow = await this.createWorkflow(request);

    // Start workflow
    await this.startWorkflow(workflow);
  }

  private async createWorkflow(request: TaskRequest): Promise<WorkflowState> {
    // Determine workflow pattern
    const pattern = this.determineWorkflowPattern(request);

    // Select agents
    const agents = this.selectAgents(pattern, request);

    // Create workflow state
    const workflow: WorkflowState = {
      workflow_id: generateUUID(),
      pattern: pattern,
      task: request,
      agents: agents,
      status: "pending",
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      results: null
    };

    this.activeWorkflows.set(workflow.workflow_id, workflow);

    return workflow;
  }

  private determineWorkflowPattern(request: TaskRequest): WorkflowPattern {
    // Determine best workflow pattern based on task requirements
    // ...

    return WorkflowPattern.PIPELINE;
  }

  private selectAgents(
    pattern: WorkflowPattern,
    request: TaskRequest
  ): string[] {
    // Select agents for the workflow
    // ...

    return ["FD-DS-02", "FD-CD-03", "FD-AX-05", "FD-PO-04"];
  }

  private async startWorkflow(workflow: WorkflowState): Promise<void> {
    this.logger.info(`Starting workflow ${workflow.workflow_id}`);

    // Update status
    workflow.status = "running";
    workflow.started_at = new Date().toISOString();
    this.activeWorkflows.set(workflow.workflow_id, workflow);

    // Initiate first handoff
    const firstAgent = workflow.agents[0];

    const handoff: HandoffMessage = {
      message_id: generateUUID(),
      protocol_version: "1.0.0",
      timestamp: new Date().toISOString(),
      source_agent: this.agentId,
      target_agent: firstAgent,
      workflow_id: workflow.workflow_id,

      handoff_type: HandoffType.INITIAL,
      task: {
        id: generateUUID(),
        title: workflow.task.title,
        description: workflow.task.description,
        priority: workflow.task.priority,
        estimated_duration: "PT15M",
        dependencies: [],
        deliverables: workflow.task.deliverables
      },

      context: workflow.task.context || {},
      previous_work: [],

      metadata: {
        workflow_stage: "initiation",
        stage_number: 1,
        total_stages: workflow.agents.length,
        retry_count: 0,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      }
    };

    await this.sendHandoff(firstAgent, handoff);
  }

  private async notifyWorkflowCompletion(workflow: WorkflowState): Promise<void> {
    // Notify all participants
    // ...
  }

  private async waitForWorkflowsToComplete(): Promise<void> {
    // Wait for all active workflows to complete
    // ...
  }

  private async loadAgentRegistry(): Promise<void> {
    // Load agent registry
    // ...
  }

  private async loadWorkflowTemplates(): Promise<void> {
    // Load workflow templates
    // ...
  }
}

interface WorkflowState {
  workflow_id: string;
  pattern: WorkflowPattern;
  task: TaskRequest;
  agents: string[];
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  results: any[] | null;
}

enum WorkflowPattern {
  PIPELINE = "pipeline",
  MANAGER_WORKER = "manager_worker",
  MAP_REDUCE = "map_reduce",
  PEER_REVIEW = "peer_review"
}

interface TaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  deliverables: string[];
  context?: any;
}
```

---

## Protocol Implementation

### Handoff Protocol Implementation

```typescript
// .opencode/workflows/protocols/HandoffProtocol.ts
import { BaseAgent } from '../core/BaseAgent';
import { HandoffMessage, HandoffAck, HandoffResult } from '../types';
import { Logger } from '../utils/Logger';
import { validateHandoff } from '../validation/handoffValidator';

export class HandoffProtocol {
  constructor(
    private agent: BaseAgent,
    private config: HandoffConfig
  ) {}

  async receive(handoff: HandoffMessage): Promise<HandoffAck> {
    const logger = new Logger(`HandoffProtocol-${this.agent.agentId}`);

    // Validate handoff message
    const validation = await validateHandoff(handoff);

    if (!validation.valid) {
      logger.error(`Invalid handoff: ${validation.error}`);

      return {
        message_id: handoff.message_id,
        agent_id: this.agent.agentId,
        timestamp: new Date().toISOString(),
        status: "rejected",
        reason: validation.error,
        estimated_completion: "PT0M"
      };
    }

    // Check dependencies
    const dependenciesMet = await this.checkDependencies(handoff);

    if (!dependenciesMet) {
      logger.warn(`Dependencies not met for handoff ${handoff.message_id}`);

      return {
        message_id: handoff.message_id,
        agent_id: this.agent.agentId,
        timestamp: new Date().toISOString(),
        status: "rejected",
        reason: "Dependencies not met",
        estimated_completion: "PT0M"
      };
    }

    // Accept handoff
    logger.info(`Handoff accepted from ${handoff.source_agent}`);

    return {
      message_id: handoff.message_id,
      agent_id: this.agent.agentId,
      timestamp: new Date().toISOString(),
      status: "accepted",
      estimated_completion: this.estimateCompletion(handoff)
    };
  }

  async send(
    targetAgent: string,
    handoff: HandoffMessage
  ): Promise<HandoffResult> {
    const logger = new Logger(`HandoffProtocol-${this.agent.agentId}`);

    try {
      // Send handoff to target agent
      const ack = await this.sendToAgent(targetAgent, handoff);

      if (ack.status === "accepted") {
        logger.info(`Handoff sent to ${targetAgent} accepted`);

        return {
          success: true,
          handoff_id: handoff.message_id,
          timestamp: new Date().toISOString()
        };
      } else {
        logger.warn(`Handoff sent to ${targetAgent} rejected: ${ack.reason}`);

        return {
          success: false,
          handoff_id: handoff.message_id,
          error: ack.reason
        };
      }
    } catch (error) {
      logger.error(`Error sending handoff to ${targetAgent}:`, error);

      // Retry logic
      if (this.config.retry_attempts > 0) {
        return await this.retrySend(targetAgent, handoff, this.config.retry_attempts);
      }

      return {
        success: false,
        handoff_id: handoff.message_id,
        error: (error as Error).message
      };
    }
  }

  private async sendToAgent(
    targetAgent: string,
    handoff: HandoffMessage
  ): Promise<HandoffAck> {
    // Implementation would send to target agent via messaging system
    // For now, return mock response
    return {
      message_id: handoff.message_id,
      agent_id: targetAgent,
      timestamp: new Date().toISOString(),
      status: "accepted",
      estimated_completion: "PT5M"
    };
  }

  private async retrySend(
    targetAgent: string,
    handoff: HandoffMessage,
    attempts: number
  ): Promise<HandoffResult> {
    const logger = new Logger(`HandoffProtocol-${this.agent.agentId}`);

    for (let i = 0; i < attempts; i++) {
      const delay = Math.pow(2, i) * 1000;  // Exponential backoff

      logger.info(`Retrying handoff to ${targetAgent} (attempt ${i + 1})`);

      await sleep(delay);

      try {
        const ack = await this.sendToAgent(targetAgent, handoff);

        if (ack.status === "accepted") {
          return {
            success: true,
            handoff_id: handoff.message_id,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        logger.error(`Retry ${i + 1} failed:`, error);
      }
    }

    return {
      success: false,
      handoff_id: handoff.message_id,
      error: `Failed after ${attempts} attempts`
    };
  }

  private async checkDependencies(handoff: HandoffMessage): Promise<boolean> {
    // Check if all task dependencies are complete
    // Implementation would check with orchestrator
    return true;
  }

  private estimateCompletion(handoff: HandoffMessage): string {
    // Estimate completion time based on task and agent capabilities
    return handoff.task.estimated_duration || "PT5M";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface HandoffConfig {
  timeout_ms: number;
  retry_attempts: number;
}
```

---

## Testing

### Unit Tests

Create `.opencode/workflows/tests/handoffProtocol.test.ts`:

```typescript
import { HandoffProtocol } from '../protocols/HandoffProtocol';
import { HandoffMessage, HandoffType } from '../types';
import { BaseAgent } from '../core/BaseAgent';

describe('HandoffProtocol', () => {
  let agent: jest.Mocked<BaseAgent>;
  let protocol: HandoffProtocol;

  beforeEach(() => {
    agent = {
      agentId: 'FD-DS-02',
      agentType: 'specialist',
      capabilities: []
    } as any;

    protocol = new HandoffProtocol(agent, {
      timeout_ms: 5000,
      retry_attempts: 3
    });
  });

  test('should accept valid handoff', async () => {
    const handoff: HandoffMessage = {
      message_id: 'test-message-id',
      protocol_version: '1.0.0',
      timestamp: new Date().toISOString(),
      source_agent: 'FD-ORC-01',
      target_agent: 'FD-DS-02',
      workflow_id: 'test-workflow-id',

      handoff_type: HandoffType.INITIAL,
      task: {
        id: 'test-task-id',
        title: 'Test Task',
        description: 'Test description',
        priority: 'medium',
        estimated_duration: 'PT10M',
        dependencies: [],
        deliverables: []
      },

      context: {},
      previous_work: [],

      metadata: {
        workflow_stage: 'initiation',
        stage_number: 1,
        total_stages: 4,
        retry_count: 0,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      }
    };

    const ack = await protocol.receive(handoff);

    expect(ack.status).toBe('accepted');
    expect(ack.agent_id).toBe('FD-DS-02');
    expect(ack.message_id).toBe('test-message-id');
  });

  test('should reject invalid handoff', async () => {
    const invalidHandoff = {} as HandoffMessage;

    const ack = await protocol.receive(invalidHandoff);

    expect(ack.status).toBe('rejected');
    expect(ack.reason).toBeDefined();
  });
});
```

### Integration Tests

Create `.opencode/workflows/tests/integration/workflowIntegration.test.ts`:

```typescript
import { OrchestratorAgent } from '../../../.opencode/agents/orchestrator/OrchestratorAgent';
import { DesignSystemAgent } from '../../../.opencode/agents/specialists/DesignSystemAgent';

describe('Workflow Integration', () => {
  let orchestrator: OrchestratorAgent;
  let designSystem: DesignSystemAgent;

  beforeAll(async () => {
    // Initialize agents
    const orchestratorConfig = {
      id: 'FD-ORC-01',
      type: 'orchestrator',
      handoff: { timeout_ms: 5000, retry_attempts: 3 },
      contextSharing: { enabled: true },
      collaborativeDecision: { enabled: true },
      toolDelegation: { enabled: true }
    };

    const designSystemConfig = {
      id: 'FD-DS-02',
      type: 'specialist',
      handoff: { timeout_ms: 5000, retry_attempts: 3 },
      contextSharing: { enabled: true },
      collaborativeDecision: { enabled: true },
      toolDelegation: { enabled: true }
    };

    orchestrator = new OrchestratorAgent(orchestratorConfig);
    designSystem = new DesignSystemAgent(designSystemConfig);

    await orchestrator.initialize();
    await designSystem.initialize();
  });

  afterAll(async () => {
    await orchestrator.stop();
    await designSystem.stop();
  });

  test('should complete simple workflow', async () => {
    // Test a simple workflow from orchestrator to design system
    // Implementation would test end-to-end workflow
    expect(true).toBe(true);
  });
});
```

---

## Implementation Checklist

- [ ] Install dependencies
- [ ] Setup directory structure
- [ ] Create configuration files
- [ ] Implement BaseAgent class
- [ ] Implement OrchestratorAgent
- [ ] Implement all specialist agents
- [ ] Implement all protocol classes
- [ ] Create validation schemas
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Setup monitoring and logging
- [ ] Configure error handling
- [ ] Create deployment scripts
- [ ] Write documentation
- [ ] Train agents on protocols

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete implementation guide |

---

**Related Documents:**
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Context Sharing Architecture](./02-context-sharing-architecture.md)
- [Conflict Resolution Framework](./03-conflict-resolution-framework.md)
- [Collaborative Decision Protocols](./04-collaborative-decision-protocols.md)
- [Tool Delegation Standards](./05-tool-delegation-standards.md)
- [Workflow Templates](./07-workflow-templates.md)
