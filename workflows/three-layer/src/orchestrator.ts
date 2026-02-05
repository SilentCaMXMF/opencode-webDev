import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { WorkflowCommandDispatcher } from '../../../workflows/commands/src/dispatcher';
import { HookSystem } from '../layers/hooks';
import { SkillSystem } from '../layers/skills';
import { AuthorityEscalationSystem } from '../authority/escalation';
import {
  ThreeLayerContext,
  HookResult,
  CommandResult,
  SkillResult,
  EscalationRequest,
  HookType
} from '../types/three-layer';
import { AgentType } from '../../../monitoring/types/monitoring';
import { AnyWorkflowCommand } from '../../../workflows/commands/src/types/workflow';

/**
 * Three-Layer Architecture Orchestrator
 * 
 * Orchestrates the complete three-layer architecture:
 * Layer 1: Automatic Hooks (preTaskValidation, contextVerification, securityScan, etc.)
 * Layer 2: User Commands (/start-work, /handoff, /escalate, /validate, /complete)
 * Layer 3: Model-Invoked Skills (patternDiscovery, architecturalReview, complianceCheck, etc.)
 * 
 * Also coordinates with the Authority Escalation System for issue resolution.
 */
export class ThreeLayerOrchestrator {
  private contextSystem: ContextSystem;
  private workflowDispatcher: WorkflowCommandDispatcher;
  private hookSystem: HookSystem;
  private skillSystem: SkillSystem;
  private escalationSystem: AuthorityEscalationSystem;
  private activeContexts: Map<string, ThreeLayerContext>;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
    this.workflowDispatcher = new WorkflowCommandDispatcher(contextSystem);
    this.hookSystem = new HookSystem(contextSystem);
    this.skillSystem = new SkillSystem(contextSystem);
    this.escalationSystem = new AuthorityEscalationSystem(contextSystem);
    this.activeContexts = new Map();
  }

  /**
   * Execute the complete three-layer workflow
   */
  async executeWorkflow(
    agentType: AgentType,
    workflowId: string,
    command: AnyWorkflowCommand,
    taskContext: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    hookResults: HookResult[];
    commandResult: CommandResult;
    skillResults: SkillResult[];
    escalation?: EscalationRequest;
    message: string;
  }> {
    console.log(`\n========================================`);
    console.log(`Executing Three-Layer Workflow`);
    console.log(`Agent: ${agentType}`);
    console.log(`Workflow: ${workflowId}`);
    console.log(`Command: ${command.command}`);
    console.log(`========================================\n`);

    // Initialize or get three-layer context
    const layerContext = this.getOrCreateContext(agentType, workflowId);
    layerContext.state.currentLayer = 'hooks';
    layerContext.state.status = 'running';

    try {
      // ============================================
      // LAYER 1: AUTOMATIC HOOKS
      // ============================================
      console.log('📋 LAYER 1: Executing Automatic Hooks...');
      
      const hookResults = await this.hookSystem.executeHooksForStage(
        'before',
        agentType,
        workflowId,
        taskContext
      );
      
      layerContext.hooks.results.push(...hookResults);
      
      // Store hook results
      for (const result of hookResults) {
        await this.storeLayerResult(workflowId, 'hook', result);
      }

      // Validate hooks passed
      const hookValidation = await this.hookSystem.validateHooksPassed(hookResults);
      
      if (!hookValidation.passed) {
        console.error('❌ Blocking hooks failed:', hookValidation.blockers);
        
        // Create escalation for blocking hook failures
        const escalation = await this.escalationSystem.escalate(
          agentType,
          `Pre-execution hooks failed: ${hookValidation.blockers.join(', ')}`,
          'high',
          { blockers: hookValidation.blockers, stage: 'hooks' },
          true
        );

        layerContext.state.status = 'failed';
        layerContext.state.blockers = hookValidation.blockers;

        return {
          success: false,
          hookResults,
          commandResult: null as any,
          skillResults: [],
          escalation,
          message: `Workflow blocked by failed hooks: ${hookValidation.blockers.join(', ')}`
        };
      }

      console.log('✅ All hooks passed\n');

      // ============================================
      // LAYER 2: USER COMMANDS
      // ============================================
      console.log('🔧 LAYER 2: Executing User Command...');
      
      layerContext.state.currentLayer = 'commands';
      
      const commandResult = await this.workflowDispatcher.executeCommand(command);
      
      layerContext.commands.history.push(commandResult);
      layerContext.commands.current = commandResult;
      
      await this.storeLayerResult(workflowId, 'command', commandResult);

      // Check if command failed and needs escalation
      const escalationCheck = this.escalationSystem.shouldEscalate(commandResult);
      
      if (escalationCheck.shouldEscalate) {
        console.warn('⚠️  Command result indicates need for escalation');
        
        const escalation = await this.escalationSystem.escalate(
          agentType,
          escalationCheck.reason || 'Command execution issues',
          commandResult.qualityGateStatus === 'failed' ? 'high' : 'medium',
          { commandResult, stage: 'commands' },
          false
        );

        // Continue with skills even if command had issues
        // (skills might help identify solutions)
      }

      console.log(`✅ Command executed: ${commandResult.success ? 'Success' : 'Failed'}\n`);

      // ============================================
      // LAYER 3: MODEL-INVOKED SKILLS
      // ============================================
      console.log('🎯 LAYER 3: Invoking Model Skills...');
      
      layerContext.state.currentLayer = 'skills';
      
      // Determine which skills to invoke based on context
      const skillTriggerType = command.stage === 'validate' ? 'command' : 'automatic';
      
      const skillResults = await this.skillSystem.invokeApplicableSkills(
        agentType,
        workflowId,
        {
          ...taskContext,
          commandResult,
          hookResults
        },
        skillTriggerType
      );
      
      layerContext.skills.results.push(...skillResults);
      
      for (const result of skillResults) {
        layerContext.skills.invoked.push(result.skillType);
        await this.storeLayerResult(workflowId, 'skill', result);
      }

      console.log(`✅ Skills invoked: ${skillResults.length} skills\n`);

      // Execute post-execution hooks
      console.log('📋 Executing Post-Execution Hooks...');
      const postHookResults = await this.hookSystem.executeHooksForStage(
        'after',
        agentType,
        workflowId,
        {
          ...taskContext,
          commandResult,
          skillResults
        }
      );
      
      layerContext.hooks.results.push(...postHookResults);

      // Check for critical findings from skills
      const criticalFindings = skillResults.flatMap(r => 
        r.findings.filter(f => f.severity === 'critical')
      );

      if (criticalFindings.length > 0) {
        console.error('❌ Critical findings from skills:', criticalFindings.length);
        
        const escalation = await this.escalationSystem.escalate(
          agentType,
          `Critical findings from automated analysis: ${criticalFindings.map(f => f.message).join(', ')}`,
          'critical',
          { findings: criticalFindings, stage: 'skills' },
          true
        );

        layerContext.state.status = 'failed';

        return {
          success: false,
          hookResults: [...hookResults, ...postHookResults],
          commandResult,
          skillResults,
          escalation,
          message: `Critical issues identified: ${criticalFindings.map(f => f.message).join(', ')}`
        };
      }

      // Mark workflow as completed
      layerContext.state.status = 'completed';
      
      console.log('========================================');
      console.log('✅ Three-Layer Workflow Completed Successfully');
      console.log('========================================\n');

      return {
        success: true,
        hookResults: [...hookResults, ...postHookResults],
        commandResult,
        skillResults,
        message: 'Workflow completed successfully'
      };

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      
      layerContext.state.status = 'failed';
      
      // Create escalation for unexpected errors
      const escalation = await this.escalationSystem.escalate(
        agentType,
        `Workflow execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'critical',
        { error: error instanceof Error ? error.message : 'Unknown error', stage: layerContext.state.currentLayer },
        true
      );

      return {
        success: false,
        hookResults: layerContext.hooks.results,
        commandResult: null as any,
        skillResults: layerContext.skills.results,
        escalation,
        message: `Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Execute a handoff between agents with three-layer validation
   */
  async executeHandoff(
    fromAgent: AgentType,
    toAgent: AgentType,
    workflowId: string,
    handoffContext: Record<string, any>
  ): Promise<{
    success: boolean;
    hookResult: HookResult;
    escalation?: EscalationRequest;
    message: string;
  }> {
    console.log(`\n🔄 Executing Agent Handoff: ${fromAgent} → ${toAgent}`);

    // Execute pre-handoff validation hook
    const hookResult = await this.hookSystem.executeHandoffHooks(
      fromAgent,
      toAgent,
      workflowId,
      handoffContext
    );

    if (hookResult.status === 'failed') {
      console.error('❌ Handoff validation failed');
      
      const escalation = await this.escalationSystem.escalate(
        fromAgent,
        `Handoff validation failed: ${hookResult.blockers?.join(', ')}`,
        'high',
        { handoffContext, blockers: hookResult.blockers },
        true
      );

      return {
        success: false,
        hookResult,
        escalation,
        message: `Handoff validation failed: ${hookResult.blockers?.join(', ')}`
      };
    }

    console.log('✅ Handoff validated successfully\n');

    return {
      success: true,
      hookResult,
      message: `Handoff from ${fromAgent} to ${toAgent} validated and ready`
    };
  }

  /**
   * Get three-layer context for a workflow
   */
  async getWorkflowContext(workflowId: string): Promise<ThreeLayerContext | null> {
    return this.activeContexts.get(workflowId) || null;
  }

  /**
   * Get comprehensive workflow metrics
   */
  async getWorkflowMetrics(workflowId: string): Promise<{
    hooks: {
      total: number;
      passed: number;
      failed: number;
      avgExecutionTime: number;
    };
    commands: {
      total: number;
      successful: number;
      failed: number;
    };
    skills: {
      total: number;
      successful: number;
      findings: number;
    };
    escalations: number;
    status: string;
  } | null> {
    const context = this.activeContexts.get(workflowId);
    if (!context) return null;

    const hookResults = context.hooks.results;
    const commandResults = context.commands.history;
    const skillResults = context.skills.results;

    return {
      hooks: {
        total: hookResults.length,
        passed: hookResults.filter(h => h.status === 'passed').length,
        failed: hookResults.filter(h => h.status === 'failed').length,
        avgExecutionTime: hookResults.length > 0
          ? hookResults.reduce((sum, h) => sum + h.executionTime, 0) / hookResults.length
          : 0
      },
      commands: {
        total: commandResults.length,
        successful: commandResults.filter(c => c.success).length,
        failed: commandResults.filter(c => !c.success).length
      },
      skills: {
        total: skillResults.length,
        successful: skillResults.filter(s => s.success).length,
        findings: skillResults.reduce((sum, s) => sum + s.findings.length, 0)
      },
      escalations: (await this.escalationSystem.getEscalationHistory(context.agentType as AgentType)).length,
      status: context.state.status
    };
  }

  /**
   * Get all active workflows
   */
  async getActiveWorkflows(): Promise<string[]> {
    return Array.from(this.activeContexts.keys()).filter(id => {
      const context = this.activeContexts.get(id);
      return context && context.state.status === 'running';
    });
  }

  /**
   * Resolve an escalation
   */
  async resolveEscalation(
    escalationId: string,
    resolvedBy: string,
    decision: string,
    rationale: string
  ): Promise<void> {
    await this.escalationSystem.resolveEscalation(escalationId, resolvedBy, decision, rationale);
  }

  /**
   * Get pending escalations
   */
  async getPendingEscalations(agentType?: AgentType): Promise<EscalationRequest[]> {
    return this.escalationSystem.getPendingEscalations(agentType ? [agentType] : undefined);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private getOrCreateContext(agentType: AgentType, workflowId: string): ThreeLayerContext {
    let context = this.activeContexts.get(workflowId);
    
    if (!context) {
      context = {
        workflowId,
        agentType: agentType.toString(),
        timestamp: new Date(),
        hooks: {
          results: [],
          config: {}
        },
        commands: {
          history: []
        },
        skills: {
          results: [],
          invoked: []
        },
        state: {
          currentLayer: 'hooks',
          status: 'idle',
          blockers: [],
          pendingApprovals: []
        }
      };
      
      this.activeContexts.set(workflowId, context);
    }
    
    return context;
  }

  private async storeLayerResult(
    workflowId: string,
    layerType: 'hook' | 'command' | 'skill',
    result: HookResult | CommandResult | SkillResult
  ): Promise<void> {
    try {
      const entry = {
        type: 'agent_interaction' as const,
        title: `${layerType.toUpperCase()} Result: ${workflowId}`,
        content: JSON.stringify({
          layerType,
          result,
          workflowId,
          timestamp: new Date()
        }),
        metadata: {
          version: 1,
          tags: [layerType, workflowId],
          agents: []
        }
      };

      await this.contextSystem.create(entry);
    } catch (error) {
      console.error(`Failed to store ${layerType} result:`, error);
    }
  }
}

export default ThreeLayerOrchestrator;
