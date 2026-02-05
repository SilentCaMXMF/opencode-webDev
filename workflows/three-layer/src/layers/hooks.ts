import {
  HookType,
  HookResult,
  HookContext,
  HookConfig,
  DefaultHookConfigs,
  SkillResult,
  SkillType
} from '../types/three-layer';
import { AgentType } from '../../../monitoring/types/monitoring';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';

/**
 * Layer 1: Automatic Hooks
 * 
 * These hooks run automatically before/after agent tasks:
 * - preTaskValidation: Auto-format checks, blockers, dependencies
 * - contextVerification: Verify required context available
 * - securityScan: Auto-security validation
 * - preHandoffValidation: Validate handoff readiness
 * - postTaskAudit: Validate task completion
 */
export class HookSystem {
  private contextSystem: ContextSystem;
  private configs: Map<HookType, HookConfig>;
  private hookHandlers: Map<HookType, Function>;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
    this.configs = new Map(Object.entries(DefaultHookConfigs) as [HookType, HookConfig][]);
    this.hookHandlers = new Map();
    this.initializeDefaultHandlers();
  }

  /**
   * Execute a hook with the given context
   */
  async executeHook(
    hookType: HookType,
    context: HookContext
  ): Promise<HookResult> {
    const config = this.configs.get(hookType) || DefaultHookConfigs[hookType];
    const startTime = Date.now();

    try {
      // Check if hook is enabled
      if (!config.enabled) {
        return {
          hookType,
          status: 'skipped',
          agent: context.agentType,
          timestamp: new Date(),
          executionTime: 0,
          message: `Hook ${hookType} is disabled`
        };
      }

      // Get hook handler
      const handler = this.hookHandlers.get(hookType);
      if (!handler) {
        throw new Error(`No handler registered for hook: ${hookType}`);
      }

      // Execute hook with timeout
      const result = await this.executeWithTimeout(
        () => handler(context),
        config.timeoutMs
      );

      const executionTime = Date.now() - startTime;

      // Store hook result in context system
      await this.storeHookResult(context, result, executionTime);

      return {
        ...result,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Check if we should retry
      if (config.retries > 0) {
        console.log(`Hook ${hookType} failed, retrying... (${config.retries} retries left)`);
        config.retries--;
        return this.executeHook(hookType, context);
      }

      const failedResult: HookResult = {
        hookType,
        status: 'failed',
        agent: context.agentType,
        timestamp: new Date(),
        executionTime,
        message: `Hook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        blockers: [`Hook ${hookType} failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };

      // Store failed result
      await this.storeHookResult(context, failedResult, executionTime);

      return failedResult;
    }
  }

  /**
   * Execute all hooks for a given stage
   */
  async executeHooksForStage(
    stage: 'before' | 'after',
    agentType: AgentType,
    workflowId: string,
    taskContext: Record<string, any>
  ): Promise<HookResult[]> {
    const hooksToExecute: HookType[] = [];
    
    if (stage === 'before') {
      hooksToExecute.push('preTaskValidation', 'contextVerification', 'securityScan');
    } else {
      hooksToExecute.push('postTaskAudit');
    }

    const context: HookContext = {
      taskId: `${workflowId}-${Date.now()}`,
      agentType: agentType.toString(),
      workflowId,
      stage: stage === 'before' ? 'pre-execution' : 'post-execution',
      timestamp: new Date(),
      context: taskContext,
      previousResults: []
    };

    const results: HookResult[] = [];
    
    for (const hookType of hooksToExecute) {
      const result = await this.executeHook(hookType, context);
      results.push(result);
      context.previousResults = results;

      // If hook is blocking and failed, stop execution
      const config = this.configs.get(hookType);
      if (config?.blocking && result.status === 'failed') {
        console.warn(`Blocking hook ${hookType} failed, stopping execution`);
        break;
      }
    }

    return results;
  }

  /**
   * Execute handoff validation hooks
   */
  async executeHandoffHooks(
    fromAgent: AgentType,
    toAgent: AgentType,
    workflowId: string,
    handoffContext: Record<string, any>
  ): Promise<HookResult> {
    const context: HookContext = {
      taskId: `${workflowId}-handoff-${Date.now()}`,
      agentType: fromAgent.toString(),
      workflowId,
      stage: 'handoff',
      timestamp: new Date(),
      context: {
        ...handoffContext,
        toAgent: toAgent.toString()
      }
    };

    return this.executeHook('preHandoffValidation', context);
  }

  /**
   * Register a custom hook handler
   */
  registerHookHandler(hookType: HookType, handler: (context: HookContext) => Promise<HookResult>): void {
    this.hookHandlers.set(hookType, handler);
  }

  /**
   * Update hook configuration
   */
  updateHookConfig(hookType: HookType, config: Partial<HookConfig>): void {
    const currentConfig = this.configs.get(hookType) || DefaultHookConfigs[hookType];
    this.configs.set(hookType, { ...currentConfig, ...config });
  }

  /**
   * Get hook configuration
   */
  getHookConfig(hookType: HookType): HookConfig {
    return this.configs.get(hookType) || DefaultHookConfigs[hookType];
  }

  /**
   * Check if all blocking hooks passed
   */
  async validateHooksPassed(results: HookResult[]): Promise<{ passed: boolean; blockers: string[] }> {
    const blockers: string[] = [];
    
    for (const result of results) {
      const config = this.configs.get(result.hookType);
      if (config?.blocking && result.status === 'failed') {
        blockers.push(...(result.blockers || [`${result.hookType} failed: ${result.message}`]));
      }
    }

    return {
      passed: blockers.length === 0,
      blockers
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Hook execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private async storeHookResult(
    context: HookContext,
    result: HookResult,
    executionTime: number
  ): Promise<void> {
    const entry = {
      type: 'agent_interaction' as const,
      title: `Hook Execution: ${result.hookType}`,
      content: JSON.stringify({
        ...result,
        executionTime,
        workflowId: context.workflowId,
        agentType: context.agentType
      }),
      metadata: {
        version: 1,
        tags: ['hook', result.hookType, context.agentType, result.status],
        agents: [context.agentType]
      }
    };

    try {
      await this.contextSystem.create(entry);
    } catch (error) {
      console.error('Failed to store hook result:', error);
    }
  }

  private initializeDefaultHandlers(): void {
    // preTaskValidation: Auto-format checks, blockers, dependencies
    this.hookHandlers.set('preTaskValidation', async (context: HookContext): Promise<HookResult> => {
      const blockers: string[] = [];
      const warnings: string[] = [];

      // Check if required context is available
      if (!context.context?.requirements) {
        warnings.push('No explicit requirements defined');
      }

      // Check if agent has necessary tools
      if (!context.context?.toolsAvailable) {
        warnings.push('Tool availability not verified');
      }

      // Check dependencies
      if (context.context?.dependencies) {
        const unresolvedDeps = context.context.dependencies.filter((dep: any) => !dep.resolved);
        if (unresolvedDeps.length > 0) {
          blockers.push(`Unresolved dependencies: ${unresolvedDeps.map((d: any) => d.name).join(', ')}`);
        }
      }

      // Check for code style compliance (if applicable)
      if (context.context?.codeChanges) {
        // This would integrate with linting tools
        const styleIssues = context.context.codeChanges.styleIssues || [];
        if (styleIssues.length > 0) {
          warnings.push(`Code style issues detected: ${styleIssues.length}`);
        }
      }

      const status = blockers.length > 0 ? 'failed' : 'passed';

      return {
        hookType: 'preTaskValidation',
        status,
        agent: context.agentType,
        timestamp: new Date(),
        executionTime: 0, // Will be set by caller
        message: status === 'passed' 
          ? 'Pre-task validation passed' 
          : `Pre-task validation failed with ${blockers.length} blockers`,
        blockers: blockers.length > 0 ? blockers : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    });

    // contextVerification: Verify required context available
    this.hookHandlers.set('contextVerification', async (context: HookContext): Promise<HookResult> => {
      const blockers: string[] = [];
      const warnings: string[] = [];

      try {
        // Search for relevant context
        const searchResult = await this.contextSystem.search({
          query: context.workflowId,
          types: ['project_context', 'session_memory', 'pattern'],
          limit: 10
        });

        if (searchResult.entries.length === 0) {
          warnings.push('No existing context found for this workflow');
        }

        // Check context freshness (< 24 hours)
        const staleContext = searchResult.entries.filter(entry => {
          const age = Date.now() - new Date(entry.metadata?.createdAt || 0).getTime();
          return age > 24 * 60 * 60 * 1000; // 24 hours
        });

        if (staleContext.length > 0) {
          warnings.push(`${staleContext.length} context entries are stale (> 24 hours)`);
        }

        // Check context completeness for task type
        if (context.context?.taskType) {
          const requiredContext = this.getRequiredContextForTask(context.context.taskType);
          const availableContext = searchResult.entries.map(e => e.type);
          
          const missingContext = requiredContext.filter(req => !availableContext.includes(req));
          if (missingContext.length > 0) {
            warnings.push(`Missing recommended context: ${missingContext.join(', ')}`);
          }
        }

      } catch (error) {
        warnings.push('Failed to verify context: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      return {
        hookType: 'contextVerification',
        status: 'passed', // Non-blocking
        agent: context.agentType,
        timestamp: new Date(),
        executionTime: 0,
        message: 'Context verification completed',
        warnings: warnings.length > 0 ? warnings : undefined
      };
    });

    // securityScan: Auto-security validation
    this.hookHandlers.set('securityScan', async (context: HookContext): Promise<HookResult> => {
      const blockers: string[] = [];
      const warnings: string[] = [];

      // Check for potential security issues in code changes
      if (context.context?.codeChanges) {
        const code = context.context.codeChanges.content || '';
        
        // Check for common security issues
        if (code.includes('eval(')) {
          blockers.push('Usage of eval() detected - security risk');
        }
        
        if (code.includes('innerHTML') && !code.includes('sanitize')) {
          warnings.push('innerHTML usage detected without sanitization');
        }

        if (code.match(/password|secret|key|token/i) && !code.includes('process.env')) {
          warnings.push('Potential hardcoded credentials detected');
        }

        // Check for dependency vulnerabilities (would integrate with npm audit)
        if (context.context.dependencies) {
          const vulnerableDeps = context.context.dependencies.filter((dep: any) => dep.vulnerable);
          if (vulnerableDeps.length > 0) {
            blockers.push(`Vulnerable dependencies: ${vulnerableDeps.map((d: any) => d.name).join(', ')}`);
          }
        }
      }

      const status = blockers.length > 0 ? 'failed' : 'passed';

      return {
        hookType: 'securityScan',
        status,
        agent: context.agentType,
        timestamp: new Date(),
        executionTime: 0,
        message: status === 'passed'
          ? 'Security scan passed'
          : `Security scan failed with ${blockers.length} critical issues`,
        blockers: blockers.length > 0 ? blockers : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    });

    // preHandoffValidation: Validate handoff readiness
    this.hookHandlers.set('preHandoffValidation', async (context: HookContext): Promise<HookResult> => {
      const blockers: string[] = [];
      const warnings: string[] = [];

      // Check context completeness
      if (!context.context?.artifacts || context.context.artifacts.length === 0) {
        blockers.push('No artifacts provided for handoff');
      }

      // Check for complete documentation
      if (!context.context?.documentation) {
        warnings.push('Handoff documentation not provided');
      }

      // Check agent compatibility
      const fromAgent = context.agentType;
      const toAgent = context.context?.toAgent;
      
      if (toAgent) {
        const compatible = this.checkAgentCompatibility(fromAgent, toAgent);
        if (!compatible) {
          warnings.push(`Unusual handoff from ${fromAgent} to ${toAgent}`);
        }
      }

      // Check evidence collection completeness
      if (!context.context?.evidence || context.context.evidence.length === 0) {
        warnings.push('No evidence collected for handoff');
      }

      const status = blockers.length > 0 ? 'failed' : 'passed';

      return {
        hookType: 'preHandoffValidation',
        status,
        agent: context.agentType,
        timestamp: new Date(),
        executionTime: 0,
        message: status === 'passed'
          ? 'Handoff validation passed'
          : `Handoff validation failed with ${blockers.length} blockers`,
        blockers: blockers.length > 0 ? blockers : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    });

    // postTaskAudit: Validate task completion
    this.hookHandlers.set('postTaskAudit', async (context: HookContext): Promise<HookResult> => {
      const warnings: string[] = [];

      // Check if task was completed successfully
      if (context.context?.taskCompleted === false) {
        warnings.push('Task marked as incomplete');
      }

      // Check if evidence was collected
      if (!context.context?.evidence || context.context.evidence.length === 0) {
        warnings.push('No evidence collected for task completion');
      }

      // Check if documentation was created
      if (!context.context?.documentation) {
        warnings.push('Task completion documentation not created');
      }

      // Check if metrics were recorded
      if (!context.context?.metrics) {
        warnings.push('Task metrics not recorded');
      }

      // Update context with new learnings
      if (context.context?.learnings) {
        try {
          await this.contextSystem.create({
            type: 'session_memory',
            title: `Learning: ${context.workflowId}`,
            content: JSON.stringify(context.context.learnings),
            metadata: {
              version: 1,
              tags: ['learning', context.agentType, 'post-task'],
              agents: [context.agentType]
            }
          });
        } catch (error) {
          warnings.push('Failed to store learnings: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }

      return {
        hookType: 'postTaskAudit',
        status: 'passed',
        agent: context.agentType,
        timestamp: new Date(),
        executionTime: 0,
        message: 'Post-task audit completed',
        warnings: warnings.length > 0 ? warnings : undefined
      };
    });
  }

  private getRequiredContextForTask(taskType: string): string[] {
    const contextMap: Record<string, string[]> = {
      'component-implementation': ['project_context', 'pattern', 'architectural_decision'],
      'architecture-design': ['architectural_decision', 'pattern', 'project_context'],
      'testing': ['project_context', 'session_memory'],
      'security-audit': ['project_context', 'architectural_decision'],
      'performance-optimization': ['project_context', 'session_memory'],
      'default': ['project_context']
    };

    return contextMap[taskType] || contextMap['default'];
  }

  private checkAgentCompatibility(fromAgent: string, toAgent: string): boolean {
    // Define typical handoff patterns
    const typicalHandoffs: Record<string, string[]> = {
      'program-manager': ['system-architect', 'frontend-specialist', 'product-researcher'],
      'system-architect': ['frontend-specialist', 'ux-motion-specialist', 'program-manager'],
      'frontend-specialist': ['quality-specialist', 'performance-engineer', 'program-manager'],
      'quality-specialist': ['frontend-specialist', 'program-manager'],
      'performance-engineer': ['frontend-specialist', 'platform-engineer', 'program-manager'],
      'a11y-specialist': ['frontend-specialist', 'product-researcher', 'program-manager'],
      'platform-engineer': ['frontend-specialist', 'program-manager'],
      'security-specialist': ['frontend-specialist', 'program-manager'],
      'ux-motion-specialist': ['frontend-specialist', 'system-architect', 'program-manager'],
      'globalization-specialist': ['frontend-specialist', 'product-researcher', 'program-manager'],
      'product-researcher': ['system-architect', 'frontend-specialist', 'program-manager']
    };

    const typical = typicalHandoffs[fromAgent] || [];
    return typical.includes(toAgent);
  }
}

export default HookSystem;
