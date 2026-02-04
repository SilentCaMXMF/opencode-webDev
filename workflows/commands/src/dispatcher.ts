import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { ResearchCommandHandler } from '@commands/research';
import { PlanCommandHandler } from '@commands/plan';
import { BuildCommandHandler } from '@commands/build';
import { ValidateCommandHandler } from '@commands/validate';
import { CompleteCommandHandler } from '@commands/complete';
import { HandoffCommandHandler } from '@commands/handoff';
import { EscalateCommandHandler } from '@commands/escalate';
import {
  AnyWorkflowCommand,
  CommandResult,
  WorkflowContext,
  WorkflowStage
} from '@types/workflow';
import { CommandValidator } from '@validators/command-validator';

export class WorkflowCommandDispatcher {
  private contextSystem: ContextSystem;
  private commandHandlers: Map<string, any>;
  private activeWorkflows: Map<string, WorkflowContext>;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
    this.activeWorkflows = new Map();
    
    // Initialize command handlers
    this.commandHandlers = new Map([
      ['workflow.research', new ResearchCommandHandler(contextSystem)],
      ['workflow.plan', new PlanCommandHandler(contextSystem)],
      ['workflow.build', new BuildCommandHandler(contextSystem)],
      ['workflow.validate', new ValidateCommandHandler(contextSystem)],
      ['workflow.complete', new CompleteCommandHandler(contextSystem)],
      ['workflow.handoff', new HandoffCommandHandler(contextSystem)],
      ['workflow.escalate', new EscalateCommandHandler(contextSystem)]
    ]);
  }

  async executeCommand(command: AnyWorkflowCommand): Promise<CommandResult> {
    // Validate command
    const validatedCommand = CommandValidator.validateCommand(command);
    
    // Get or create workflow context
    const workflowContext = await this.getOrCreateWorkflowContext(command);
    
    // Check command sequence validity
    if (!this.isValidCommandSequence(workflowContext, command)) {
      throw new Error(`Invalid command sequence: ${command.command} cannot be executed at this stage`);
    }

    // Get command handler
    const handler = this.commandHandlers.get(command.command);
    if (!handler) {
      throw new Error(`No handler found for command: ${command.command}`);
    }

    try {
      // Update workflow status
      workflowContext.status = 'in_progress';
      workflowContext.currentStage = command.stage;
      workflowContext.updatedAt = new Date();
      workflowContext.commands.push(validatedCommand);

      // Execute command
      const result = await handler.execute(validatedCommand);

      // Update workflow context with result
      workflowContext.deviations.push(...result.deviations);
      workflowContext.evidence.push(...result.evidence);

      // Update workflow status based on result
      if (result.success) {
        if (result.nextStage) {
          workflowContext.currentStage = result.nextStage;
        }
        
        // Check if workflow is complete
        if (command.stage === 'complete') {
          workflowContext.status = 'completed';
        }
      } else {
        workflowContext.status = 'failed';
      }

      // Store workflow execution in context system
      await this.storeWorkflowExecution(workflowContext, command, result);

      return result;

    } catch (error) {
      workflowContext.status = 'failed';
      throw error;
    }
  }

  async executeBatch(commands: AnyWorkflowCommand[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      try {
        const result = await this.executeCommand(command);
        results.push(result);

        // Stop batch execution if a command fails and it's critical
        if (!result.success && this.isCriticalFailure(result)) {
          break;
        }
      } catch (error) {
        results.push({
          commandId: command.id,
          success: false,
          stage: command.stage,
          agent: command.agent,
          timestamp: new Date(),
          executionTime: 0,
          result: null,
          deviations: [],
          evidence: [],
          message: `Batch execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        break;
      }
    }

    return results;
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowContext | null> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      return workflow;
    }

    // Try to load from context system
    try {
      const searchResult = await this.contextSystem.search({
        query: workflowId,
        types: ['session_memory'],
        limit: 1
      });

      if (searchResult.entries.length > 0) {
        const entry = searchResult.entries[0];
        const workflowContext = JSON.parse(entry.content);
        this.activeWorkflows.set(workflowId, workflowContext);
        return workflowContext;
      }
    } catch (error) {
      console.error('Failed to load workflow status:', error);
    }

    return null;
  }

  async listActiveWorkflows(): Promise<string[]> {
    return Array.from(this.activeWorkflows.keys());
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'on_hold';
      await this.updateWorkflowInContext(workflow);
    }
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'in_progress';
      await this.updateWorkflowInContext(workflow);
    }
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      await this.updateWorkflowInContext(workflow);
      this.activeWorkflows.delete(workflowId);
    }
  }

  async retryCommand(workflowId: string, commandId: string): Promise<CommandResult> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const command = workflow.commands.find(cmd => cmd.id === commandId);
    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    // Reset command status
    command.status = 'pending';

    // Re-execute command
    return this.executeCommand(command);
  }

  async getWorkflowMetrics(workflowId: string): Promise<any> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const totalCommands = workflow.commands.length;
    const completedCommands = workflow.commands.filter(cmd => cmd.status === 'completed').length;
    const totalDeviations = workflow.deviations.length;
    const criticalDeviations = workflow.deviations.filter(d => d.severity === 'critical').length;
    const totalEvidence = workflow.evidence.length;

    const stageMetrics = this.calculateStageMetrics(workflow);
    const agentMetrics = this.calculateAgentMetrics(workflow);

    return {
      workflowId,
      status: workflow.status,
      currentStage: workflow.currentStage,
      startedAt: workflow.startedAt,
      updatedAt: workflow.updatedAt,
      duration: Date.now() - workflow.startedAt.getTime(),
      commands: {
        total: totalCommands,
        completed: completedCommands,
        progress: totalCommands > 0 ? (completedCommands / totalCommands) * 100 : 0
      },
      deviations: {
        total: totalDeviations,
        critical: criticalDeviations,
        bySeverity: this.groupDeviationsBySeverity(workflow.deviations)
      },
      evidence: {
        total: totalEvidence,
        byType: this.groupEvidenceByType(workflow.evidence)
      },
      stages: stageMetrics,
      agents: agentMetrics
    };
  }

  private async getOrCreateWorkflowContext(command: AnyWorkflowCommand): Promise<WorkflowContext> {
    // Extract workflow ID from command metadata or create new one
    let workflowId = this.extractWorkflowId(command);

    if (!workflowId) {
      // Create new workflow context
      workflowId = this.generateWorkflowId(command);
      const newContext: WorkflowContext = {
        workflowId,
        currentStage: command.stage,
        status: 'pending',
        startedAt: new Date(),
        updatedAt: new Date(),
        agent: command.agent,
        commands: [],
        deviations: [],
        evidence: [],
        qualityGates: [],
        handoffs: [],
        escalations: [],
        metadata: {}
      };

      this.activeWorkflows.set(workflowId, newContext);
      return newContext;
    }

    // Load existing workflow context
    let workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      // Try to load from context system
      workflow = await this.getWorkflowStatus(workflowId);
    }

    if (!workflow) {
      throw new Error(`Unable to create or load workflow context for workflow: ${workflowId}`);
    }

    return workflow;
  }

  private isValidCommandSequence(workflow: WorkflowContext, command: AnyWorkflowCommand): boolean {
    // If this is the first command, it must be research
    if (workflow.commands.length === 0 && command.stage !== 'research') {
      return false;
    }

    // Allow escalation and handoff at any time
    if (command.stage === 'escalate' || command.stage === 'handoff') {
      return true;
    }

    // Check standard workflow progression
    const validProgression: Record<WorkflowStage, WorkflowStage[]> = {
      'research': ['plan', 'escalate'],
      'plan': ['build', 'escalate'],
      'build': ['validate', 'escalate'],
      'validate': ['complete', 'build', 'escalate'],
      'complete': [],
      'handoff': ['research', 'plan', 'build', 'validate', 'escalate'],
      'escalate': ['research', 'plan', 'build', 'validate', 'complete']
    };

    const allowedStages = validProgression[workflow.currentStage] || [];
    return allowedStages.includes(command.stage);
  }

  private async storeWorkflowExecution(
    workflow: WorkflowContext,
    command: AnyWorkflowCommand,
    result: CommandResult
  ): Promise<void> {
    // Store command execution as session memory
    const executionEntry = {
      id: `${workflow.workflowId}-${command.id}`,
      type: 'session_memory',
      title: `Command Execution: ${command.command}`,
      content: JSON.stringify({
        command,
        result,
        workflowId: workflow.workflowId,
        timestamp: new Date()
      }),
      metadata: {
        version: 1,
        tags: ['command_execution', command.command, workflow.agent],
        agents: [workflow.agent]
      }
    };

    await this.contextSystem.create(executionEntry);

    // Update workflow in context system
    await this.updateWorkflowInContext(workflow);
  }

  private async updateWorkflowInContext(workflow: WorkflowContext): Promise<void> {
    const workflowEntry = {
      type: 'session_memory',
      title: `Workflow Context: ${workflow.workflowId}`,
      content: JSON.stringify(workflow),
      metadata: {
        version: 1,
        tags: ['workflow_context', workflow.status, workflow.currentStage],
        agents: [workflow.agent]
      }
    };

    // Search for existing workflow entry
    const searchResult = await this.contextSystem.search({
      query: workflow.workflowId,
      types: ['session_memory'],
      limit: 1
    });

    if (searchResult.entries.length > 0) {
      await this.contextSystem.update(searchResult.entries[0].id, workflowEntry);
    } else {
      await this.contextSystem.create({
        ...workflowEntry,
        id: workflow.workflowId
      });
    }
  }

  private extractWorkflowId(command: AnyWorkflowCommand): string | null {
    // Try to extract workflow ID from command metadata
    if (command.metadata?.workflowId) {
      return command.metadata.workflowId;
    }

    // Try to extract from context references
    if (command.context && command.context.length > 0) {
      // Look for workflow ID in context entries
      for (const contextId of command.context) {
        if (contextId.includes('workflow-')) {
          return contextId;
        }
      }
    }

    return null;
  }

  private generateWorkflowId(command: AnyWorkflowCommand): string {
    const timestamp = Date.now();
    const agent = command.agent.toLowerCase();
    return `workflow-${agent}-${timestamp}`;
  }

  private isCriticalFailure(result: CommandResult): boolean {
    // Check if result has critical deviations
    return result.deviations.some(deviation => deviation.severity === 'critical');
  }

  private calculateStageMetrics(workflow: WorkflowContext): any {
    const stageCounts = workflow.commands.reduce((counts, cmd) => {
      counts[cmd.stage] = (counts[cmd.stage] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const stageDurations = workflow.commands.reduce((durations, cmd) => {
      if (!durations[cmd.stage]) {
        durations[cmd.stage] = { total: 0, count: 0 };
      }
      // This would need to be stored with command execution time
      return durations;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      commandCounts: stageCounts,
      durations: stageDurations
    };
  }

  private calculateAgentMetrics(workflow: WorkflowContext): any {
    const agentCommands = workflow.commands.reduce((counts, cmd) => {
      counts[cmd.agent] = (counts[cmd.agent] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const agentDeviations = workflow.deviations.reduce((counts, deviation) => {
      counts[deviation.agent] = (counts[deviation.agent] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      commandCounts: agentCommands,
      deviationCounts: agentDeviations
    };
  }

  private groupDeviationsBySeverity(deviations: any[]): Record<string, number> {
    return deviations.reduce((groups, deviation) => {
      groups[deviation.severity] = (groups[deviation.severity] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private groupEvidenceByType(evidence: any[]): Record<string, number> {
    return evidence.reduce((groups, item) => {
      groups[item.type] = (groups[item.type] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}