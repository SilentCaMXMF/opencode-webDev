import { v4 as uuidv4 } from 'uuid';
import { 
  AnyWorkflowCommand, 
  WorkflowStage, 
  AgentType, 
  Priority,
  Deviation,
  Evidence
} from '@types/workflow';

export class WorkflowUtils {
  // Command creation utilities
  static createResearchCommand(
    agent: AgentType,
    query: string,
    options: {
      contextTypes?: string[];
      agentFilter?: AgentType[];
      maxResults?: number;
      includeEvidence?: boolean;
      priority?: Priority;
      context?: string[];
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.research',
      stage: 'research',
      agent,
      timestamp: new Date(),
      parameters: {
        query,
        contextTypes: options.contextTypes,
        agentFilter: options.agentFilter,
        maxResults: options.maxResults || 20,
        includeEvidence: options.includeEvidence ?? true
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'medium'
    };
  }

  static createPlanCommand(
    agent: AgentType,
    requirements: string[],
    options: {
      constraints?: string[];
      deliverables?: string[];
      timeline?: any;
      resources?: any[];
      priority?: Priority;
      context?: string[];
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.plan',
      stage: 'plan',
      agent,
      timestamp: new Date(),
      parameters: {
        requirements,
        constraints: options.constraints || [],
        deliverables: options.deliverables || requirements,
        timeline: options.timeline || this.createDefaultTimeline(),
        resources: options.resources
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'medium'
    };
  }

  static createBuildCommand(
    agent: AgentType,
    artifacts: any[],
    options: {
      specifications?: string[];
      trackDeviations?: boolean;
      checkpointInterval?: number;
      priority?: Priority;
      context?: string[];
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.build',
      stage: 'build',
      agent,
      timestamp: new Date(),
      parameters: {
        specifications: options.specifications || [],
        artifacts,
        trackDeviations: options.trackDeviations ?? true,
        checkpointInterval: options.checkpointInterval || 300000
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'medium'
    };
  }

  static createValidateCommand(
    agent: AgentType,
    targetArtifacts: string[],
    options: {
      validationTypes?: string[];
      evidenceRequired?: boolean;
      autoApproveThreshold?: number;
      qualityGates?: string[];
      priority?: Priority;
      context?: string[];
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.validate',
      stage: 'validate',
      agent,
      timestamp: new Date(),
      parameters: {
        targetArtifacts,
        validationTypes: options.validationTypes || ['functional', 'code_quality'],
        evidenceRequired: options.evidenceRequired ?? true,
        autoApproveThreshold: options.autoApproveThreshold || 0.9,
        qualityGates: options.qualityGates || []
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'high'
    };
  }

  static createCompleteCommand(
    agent: AgentType,
    artifacts: string[],
    summary: string,
    outcomes: string[],
    options: {
      nextSteps?: string[];
      cleanup?: boolean;
      archive?: boolean;
      priority?: Priority;
      context?: string[];
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.complete',
      stage: 'complete',
      agent,
      timestamp: new Date(),
      parameters: {
        artifacts,
        summary,
        outcomes,
        nextSteps: options.nextSteps || [],
        cleanup: options.cleanup ?? true,
        archive: options.archive ?? true
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'medium'
    };
  }

  static createHandoffCommand(
    agent: AgentType,
    toAgent: AgentType,
    artifacts: string[],
    instructions: string,
    options: {
      context?: string[];
      priority?: Priority;
      expectedDuration?: number;
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.handoff',
      stage: 'handoff',
      agent,
      timestamp: new Date(),
      parameters: {
        toAgent,
        artifacts,
        context: options.context || [],
        instructions,
        priority: options.priority || 'medium',
        expectedDuration: options.expectedDuration
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || 'medium'
    };
  }

  static createEscalateCommand(
    agent: AgentType,
    issue: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    options: {
      context?: string[];
      escalateTo?: AgentType;
      blockWorkflow?: boolean;
      suggestedResolution?: string;
      priority?: Priority;
    } = {}
  ): AnyWorkflowCommand {
    return {
      id: uuidv4(),
      command: 'workflow.escalate',
      stage: 'escalate',
      agent,
      timestamp: new Date(),
      parameters: {
        issue,
        severity,
        context: options.context || [],
        escalateTo: options.escalateTo,
        blockWorkflow: options.blockWorkflow ?? false,
        suggestedResolution: options.suggestedResolution
      },
      context: options.context || [],
      status: 'pending',
      priority: options.priority || severity as Priority
    };
  }

  // Workflow sequence creation utilities
  static createStandardWorkflowSequence(
    agent: AgentType,
    requirements: string[],
    artifacts: any[],
    summary: string,
    outcomes: string[],
    options: {
      context?: string[];
      priority?: Priority;
      includeValidations?: string[];
    } = {}
  ): AnyWorkflowCommand[] {
    const commands: AnyWorkflowCommand[] = [];

    // Research phase
    commands.push(this.createResearchCommand(
      agent,
      `Research requirements: ${requirements.join(', ')}`,
      {
        context: options.context,
        priority: options.priority
      }
    ));

    // Planning phase
    commands.push(this.createPlanCommand(
      agent,
      requirements,
      {
        deliverables: artifacts.map(a => a.name || a.path || 'artifact'),
        context: options.context,
        priority: options.priority
      }
    ));

    // Build phase
    commands.push(this.createBuildCommand(
      agent,
      artifacts,
      {
        context: options.context,
        priority: options.priority
      }
    ));

    // Validation phase
    commands.push(this.createValidateCommand(
      agent,
      artifacts.map(a => a.path || a.name || 'artifact'),
      {
        validationTypes: options.includeValidations || ['functional', 'code_quality', 'security'],
        context: options.context,
        priority: options.priority
      }
    ));

    // Completion phase
    commands.push(this.createCompleteCommand(
      agent,
      artifacts.map(a => a.path || a.name || 'artifact'),
      summary,
      outcomes,
      {
        context: options.context,
        priority: options.priority
      }
    ));

    return commands;
  }

  // Validation utilities
  static validateCommandSequence(commands: AnyWorkflowCommand[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (commands.length === 0) {
      return { valid: false, errors: ['No commands provided'], warnings: [] };
    }

    // Check if first command is research
    if (commands[0].stage !== 'research') {
      errors.push('First command must be research stage');
    }

    // Check command sequence
    const expectedOrder = ['research', 'plan', 'build', 'validate', 'complete'];
    const filteredCommands = commands.filter(cmd => 
      !['handoff', 'escalate'].includes(cmd.stage)
    );

    let lastIndex = -1;
    for (const command of filteredCommands) {
      const currentIndex = expectedOrder.indexOf(command.stage);
      if (currentIndex === -1) {
        errors.push(`Invalid stage: ${command.stage}`);
        continue;
      }

      if (currentIndex < lastIndex) {
        warnings.push(`Command out of order: ${command.stage} after stage ${expectedOrder[lastIndex]}`);
      }
      lastIndex = currentIndex;
    }

    // Check for missing stages
    const presentStages = new Set(filteredCommands.map(cmd => cmd.stage));
    const missingStages = expectedOrder.filter(stage => !presentStages.has(stage));
    if (missingStages.length > 0) {
      warnings.push(`Missing stages: ${missingStages.join(', ')}`);
    }

    // Check command consistency
    const agent = commands[0].agent;
    for (let i = 1; i < commands.length; i++) {
      if (commands[i].agent !== agent) {
        warnings.push(`Agent change detected: ${commands[i-1].agent} -> ${commands[i].agent}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Analysis utilities
  static analyzeCommandResults(results: any[]): {
    totalCommands: number;
    successRate: number;
    totalDeviations: number;
    criticalDeviations: number;
    totalEvidence: number;
    averageExecutionTime: number;
    stageMetrics: Record<string, any>;
  } {
    const totalCommands = results.length;
    const successfulCommands = results.filter(r => r.success).length;
    const totalDeviations = results.reduce((sum, r) => sum + (r.deviations?.length || 0), 0);
    const criticalDeviations = results.reduce((sum, r) => 
      sum + (r.deviations?.filter((d: Deviation) => d.severity === 'critical').length || 0), 0);
    const totalEvidence = results.reduce((sum, r) => sum + (r.evidence?.length || 0), 0);
    const totalExecutionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);

    const stageMetrics = results.reduce((metrics, result) => {
      const stage = result.stage;
      if (!metrics[stage]) {
        metrics[stage] = {
          count: 0,
          successCount: 0,
          totalDeviations: 0,
          totalEvidence: 0,
          totalExecutionTime: 0
        };
      }

      metrics[stage].count++;
      if (result.success) metrics[stage].successCount++;
      metrics[stage].totalDeviations += result.deviations?.length || 0;
      metrics[stage].totalEvidence += result.evidence?.length || 0;
      metrics[stage].totalExecutionTime += result.executionTime || 0;

      return metrics;
    }, {} as Record<string, any>);

    return {
      totalCommands,
      successRate: totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0,
      totalDeviations,
      criticalDeviations,
      totalEvidence,
      averageExecutionTime: totalCommands > 0 ? totalExecutionTime / totalCommands : 0,
      stageMetrics
    };
  }

  // Timeline creation utility
  static createDefaultTimeline(): any {
    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

    return {
      start,
      end,
      milestones: [
        {
          name: 'Research Complete',
          date: new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
          deliverables: ['Requirements analysis', 'Context research']
        },
        {
          name: 'Design Complete',
          date: new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
          deliverables: ['Architecture decisions', 'Design specifications']
        },
        {
          name: 'Build Complete',
          date: new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
          deliverables: ['Component implementation', 'Integration']
        },
        {
          name: 'Validation Complete',
          date: new Date(start.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days
          deliverables: ['Quality gates passed', 'Testing complete']
        },
        {
          name: 'Deployment Ready',
          date: end,
          deliverables: ['Documentation', 'Deployment package']
        }
      ]
    };
  }

  // Agent role utilities
  static getAgentCapabilities(agent: AgentType): {
    primaryStages: WorkflowStage[];
    secondaryStages: WorkflowStage[];
    canEscalateTo: AgentType[];
    specialization: string[];
  } {
    const capabilities = {
      'ORCHESTRATOR': {
        primaryStages: ['plan', 'complete'],
        secondaryStages: ['research', 'handoff'],
        canEscalateTo: [],
        specialization: ['coordination', 'integration', 'decision_making']
      },
      'DESIGN_SYSTEM': {
        primaryStages: ['plan', 'build'],
        secondaryStages: ['research', 'validate'],
        canEscalateTo: ['ORCHESTRATOR', 'UX_RESEARCH'],
        specialization: ['ui_design', 'component_architecture', 'design_tokens']
      },
      'COMPONENT_DEVELOPER': {
        primaryStages: ['build', 'validate'],
        secondaryStages: ['plan', 'research'],
        canEscalateTo: ['ORCHESTRATOR', 'DESIGN_SYSTEM', 'PERFORMANCE_OPTIMIZER'],
        specialization: ['react_components', 'typescript', 'component_testing']
      },
      'PERFORMANCE_OPTIMIZER': {
        primaryStages: ['validate', 'build'],
        secondaryStages: ['research', 'plan'],
        canEscalateTo: ['ORCHESTRATOR'],
        specialization: ['performance_optimization', 'metrics', 'profiling']
      },
      'ACCESSIBILITY': {
        primaryStages: ['validate', 'plan'],
        secondaryStages: ['research'],
        canEscalateTo: ['ORCHESTRATOR', 'DESIGN_SYSTEM'],
        specialization: ['a11y_compliance', 'screen_readers', 'keyboard_navigation']
      },
      'CROSS_PLATFORM': {
        primaryStages: ['build', 'validate'],
        secondaryStages: ['research'],
        canEscalateTo: ['ORCHESTRATOR', 'COMPONENT_DEVELOPER'],
        specialization: ['browser_compatibility', 'responsive_design', 'platform_testing']
      },
      'TESTING_QA': {
        primaryStages: ['validate'],
        secondaryStages: ['build', 'plan'],
        canEscalateTo: ['ORCHESTRATOR', 'SECURITY'],
        specialization: ['automated_testing', 'quality_assurance', 'test_planning']
      },
      'SECURITY': {
        primaryStages: ['validate', 'research'],
        secondaryStages: ['plan'],
        canEscalateTo: ['ORCHESTRATOR'],
        specialization: ['security_scanning', 'vulnerability_assessment', 'secure_coding']
      },
      'ANIMATION': {
        primaryStages: ['build', 'plan'],
        secondaryStages: ['validate'],
        canEscalateTo: ['ORCHESTRATOR', 'DESIGN_SYSTEM'],
        specialization: ['motion_design', 'animations', 'transitions']
      },
      'I18N': {
        primaryStages: ['build', 'validate'],
        secondaryStages: ['plan', 'research'],
        canEscalateTo: ['ORCHESTRATOR', 'COMPONENT_DEVELOPER'],
        specialization: ['internationalization', 'localization', 'translation']
      },
      'UX_RESEARCH': {
        primaryStages: ['research', 'plan'],
        secondaryStages: ['validate'],
        canEscalateTo: ['ORCHESTRATOR', 'DESIGN_SYSTEM'],
        specialization: ['user_research', 'usability_testing', 'user_experience']
      }
    };

    return capabilities[agent] || {
      primaryStages: ['research', 'plan', 'build', 'validate', 'complete'],
      secondaryStages: ['handoff', 'escalate'],
      canEscalateTo: ['ORCHESTRATOR'],
      specialization: ['general']
    };
  }

  // Quality gate utilities
  static createStandardQualityGates(): string[] {
    return [
      'code_quality_gate',
      'performance_gate',
      'security_gate',
      'accessibility_gate',
      'functional_validation_gate'
    ];
  }

  // Context management utilities
  static extractContextReferences(commands: AnyWorkflowCommand[]): string[] {
    const references = new Set<string>();
    
    for (const command of commands) {
      for (const contextId of command.context) {
        references.add(contextId);
      }
    }

    return Array.from(references);
  }

  static generateWorkflowSummary(commands: AnyWorkflowCommand[], results?: any[]): string {
    const stages = commands.map(cmd => cmd.stage);
    const agents = [...new Set(commands.map(cmd => cmd.agent))];
    
    let summary = `Workflow with ${commands.length} commands across stages: ${stages.join(' -> ')}. `;
    summary += `Involved agents: ${agents.join(', ')}.`;
    
    if (results) {
      const analysis = this.analyzeCommandResults(results);
      summary += ` Success rate: ${analysis.successRate.toFixed(1)}%. `;
      summary += `Total deviations: ${analysis.totalDeviations} (${analysis.criticalDeviations} critical).`;
    }

    return summary;
  }
}