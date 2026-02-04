import { v4 as uuidv4 } from 'uuid';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { 
  EscalateCommand, 
  CommandResult,
  WorkflowStage,
  AgentType,
  Deviation,
  Evidence,
  Escalation
} from '@types/workflow';

export class EscalateCommandHandler {
  private contextSystem: ContextSystem;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
  }

  async execute(command: EscalateCommand): Promise<CommandResult> {
    const startTime = Date.now();
    const deviations: Deviation[] = [];
    const evidence: Evidence[] = [];

    try {
      // Validate escalation prerequisites
      const escalationValidation = await this.validateEscalationPrerequisites(command);
      
      // Create escalation record
      const escalation = await this.createEscalation(command);
      
      // Determine escalation target
      const escalationTarget = await this.determineEscalationTarget(command, escalation);
      
      // Notify escalation target (simulated)
      const targetNotification = await this.notifyEscalationTarget(escalation, escalationTarget);
      
      // Block workflow if required
      if (command.parameters.blockWorkflow) {
        await this.blockWorkflow(command);
      }

      // Generate escalation evidence
      evidence.push(...await this.generateEscalationEvidence(
        escalationValidation,
        escalation,
        escalationTarget,
        targetNotification,
        command
      ));

      // Detect escalation deviations
      const escalationDeviations = await this.detectEscalationDeviations(
        escalationValidation,
        command
      );
      deviations.push(...escalationDeviations);

      const executionTime = Date.now() - startTime;

      return {
        commandId: command.id,
        success: escalationValidation.valid,
        stage: 'escalate',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: {
          escalationValidation,
          escalation,
          escalationTarget,
          targetNotification,
          workflowBlocked: command.parameters.blockWorkflow,
          nextStage: this.determineNextStage(escalationValidation, command)
        },
        deviations,
        evidence,
        nextStage: this.determineNextStage(escalationValidation, command),
        artifacts: []
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        commandId: command.id,
        success: false,
        stage: 'escalate',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: null,
        deviations,
        evidence,
        message: `Escalate command failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async validateEscalationPrerequisites(command: EscalateCommand): Promise<any> {
    const validation = {
      valid: true,
      issues: [],
      contextValidation: {},
      issueValidation: {},
      targetValidation: {}
    };

    // Validate context entries
    for (const contextId of command.parameters.context) {
      try {
        const searchResult = await this.contextSystem.search({
          query: contextId,
          types: ['project_context', 'architectural_decision', 'pattern', 'session_memory'],
          limit: 5
        });

        validation.contextValidation[contextId] = {
          exists: searchResult.entries.length > 0,
          entries: searchResult.entries.length,
          type: searchResult.entries.length > 0 ? searchResult.entries[0].type : 'unknown'
        };

        if (searchResult.entries.length === 0) {
          validation.issues.push(`Context entry not found: ${contextId}`);
        }
      } catch (error) {
        validation.contextValidation[contextId] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        validation.issues.push(`Error validating context ${contextId}: ${error}`);
      }
    }

    // Validate issue description
    validation.issueValidation = {
      present: !!command.parameters.issue && command.parameters.issue.length > 0,
      length: command.parameters.issue ? command.parameters.issue.length : 0,
      severity: command.parameters.severity,
      hasKeywords: this.hasIssueKeywords(command.parameters.issue),
      suggestedResolution: !!command.parameters.suggestedResolution
    };

    if (!validation.issueValidation.present) {
      validation.valid = false;
      validation.issues.push('Issue description is required');
    }

    if (validation.issueValidation.length < 10) {
      validation.issues.push('Issue description is too brief - please provide more details');
    }

    // Validate escalation target if specified
    if (command.parameters.escalateTo) {
      const targetValid = this.isValidEscalationTarget(command.parameters.escalateTo, command.agent);
      validation.targetValidation = {
        specified: true,
        target: command.parameters.escalateTo,
        valid: targetValid,
        reason: targetValid ? 'Valid escalation target' : 'Invalid escalation target for this agent'
      };

      if (!targetValid) {
        validation.valid = false;
        validation.issues.push(`Invalid escalation target: ${command.parameters.escalateTo}`);
      }
    } else {
      validation.targetValidation = {
        specified: false,
        target: null,
        valid: true,
        reason: 'Will auto-determine escalation target'
      };
    }

    return validation;
  }

  private async createEscalation(command: EscalateCommand): Promise<Escalation> {
    const escalation: Escalation = {
      id: uuidv4(),
      stage: command.stage,
      agent: command.agent,
      severity: command.parameters.severity,
      issue: command.parameters.issue,
      context: command.parameters.context,
      timestamp: new Date(),
      assignedTo: command.parameters.escalateTo,
      resolution: undefined,
      resolvedAt: undefined
    };

    // Store escalation in context system
    await this.contextSystem.create({
      type: 'agent_interaction',
      title: `Escalation: ${command.agent} - ${command.parameters.severity}`,
      content: JSON.stringify(escalation),
      metadata: {
        version: 1,
        tags: ['escalation', 'issue', command.parameters.severity, command.agent],
        agents: [command.agent, command.parameters.escalateTo].filter(Boolean) as AgentType[]
      }
    });

    return escalation;
  }

  private async determineEscalationTarget(command: EscalateCommand, escalation: Escalation): Promise<any> {
    let targetAgent: AgentType;

    // Use explicitly specified target if provided
    if (command.parameters.escalateTo) {
      targetAgent = command.parameters.escalateTo;
    } else {
      // Auto-determine escalation target based on issue content and severity
      targetAgent = this.autoDetermineEscalationTarget(
        command.parameters.issue,
        command.parameters.severity,
        command.agent
      );
    }

    // Check target availability
    const targetAvailability = await this.checkTargetAvailability(targetAgent);

    return {
      targetAgent,
      autoDetermined: !command.parameters.escalateTo,
      reasoning: this.getEscalationReasoning(targetAgent, escalation),
      availability: targetAvailability,
      estimatedResolutionTime: this.estimateResolutionTime(targetAgent, escalation)
    };
  }

  private async notifyEscalationTarget(escalation: Escalation, escalationTarget: any): Promise<any> {
    const notification = {
      id: uuidv4(),
      escalationId: escalation.id,
      targetAgent: escalationTarget.targetAgent,
      fromAgent: escalation.agent,
      severity: escalation.severity,
      issue: escalation.issue,
      timestamp: new Date(),
      status: 'sent',
      expectedResponseBy: this.calculateExpectedResponseTime(escalation.severity),
      priority: this.determineNotificationPriority(escalation.severity),
      context: escalation.context
    };

    // Store notification in context system
    await this.contextSystem.create({
      type: 'agent_interaction',
      title: `Escalation Notification: ${escalation.id}`,
      content: JSON.stringify(notification),
      metadata: {
        version: 1,
        tags: ['notification', 'escalation', escalation.severity, escalation.agent, escalationTarget.targetAgent],
        agents: [escalation.agent, escalationTarget.targetAgent]
      }
    });

    // Simulate agent response
    setTimeout(async () => {
      await this.respondToEscalation(escalation.id, true, 'Escalation received and under investigation');
    }, 2000); // 2 second response simulation

    return notification;
  }

  private async blockWorkflow(command: EscalateCommand): Promise<void> {
    // Mark workflow as blocked
    const blockRecord = {
      id: uuidv4(),
      commandId: command.id,
      agent: command.agent,
      stage: command.stage,
      timestamp: new Date(),
      reason: 'Workflow blocked due to escalation',
      severity: command.parameters.severity,
      blocked: true
    };

    await this.contextSystem.create({
      type: 'session_memory',
      title: `Workflow Blocked: ${command.id}`,
      content: JSON.stringify(blockRecord),
      metadata: {
        version: 1,
        tags: ['workflow_blocked', 'escalation', command.agent],
        agents: [command.agent]
      }
    });
  }

  private async generateEscalationEvidence(
    escalationValidation: any,
    escalation: Escalation,
    escalationTarget: any,
    targetNotification: any,
    command: EscalateCommand
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Escalation validation evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'escalate',
      agent: command.agent,
      data: {
        escalationValid: escalationValidation.valid,
        issuePresent: escalationValidation.issueValidation.present,
        contextCount: command.parameters.context.length,
        issuesCount: escalationValidation.issues.length,
        targetDetermined: !!escalationTarget.targetAgent
      },
      timestamp: new Date(),
      confidence: 0.9
    });

    // Escalation creation evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'escalate',
      agent: command.agent,
      data: {
        escalationId: escalation.id,
        severity: escalation.severity,
        hasContext: escalation.context.length > 0,
        targetAutoDetermined: escalationTarget.autoDetermined,
        targetAvailability: escalationTarget.availability.available
      },
      timestamp: new Date(),
      confidence: 0.85
    });

    // Notification evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'escalate',
      agent: command.agent,
      data: {
        notificationSent: !!targetNotification,
        notificationId: targetNotification.id,
        expectedResponseBy: targetNotification.expectedResponseBy,
        priority: targetNotification.priority
      },
      timestamp: new Date(),
      confidence: 0.8
    });

    return evidence;
  }

  private async detectEscalationDeviations(
    escalationValidation: any,
    command: EscalateCommand
  ): Promise<Deviation[]> {
    const deviations: Deviation[] = [];

    // Check for invalid escalation
    if (!escalationValidation.valid) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'escalate',
        agent: command.agent,
        expected: 'Valid escalation prerequisites',
        actual: `Validation failed: ${escalationValidation.issues.join(', ')}`,
        severity: 'major',
        justification: 'Invalid escalations will not be processed properly'
      });
    }

    // Check for insufficient issue description
    if (!escalationValidation.issueValidation.hasKeywords) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'escalate',
        agent: command.agent,
        expected: 'Clear issue description with specific keywords',
        actual: 'Issue description lacks clarity or specific keywords',
        severity: 'minor',
        justification: 'Clear descriptions improve resolution efficiency'
      });
    }

    // Check for missing context
    if (command.parameters.context.length === 0) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'escalate',
        agent: command.agent,
        expected: 'Relevant context provided',
        actual: 'No context provided for escalation',
        severity: 'minor',
        justification: 'Context helps agents understand escalation background'
      });
    }

    // Check for severity mismatches
    const severityIndicators = this.analyzeSeverityIndicators(command.parameters.issue);
    if (severityIndicators.recommendedSeverity !== command.parameters.severity) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'escalate',
        agent: command.agent,
        expected: 'Severity matches issue content',
        actual: `Severity mismatch - recommended: ${severityIndicators.recommendedSeverity}`,
        severity: 'minor',
        justification: 'Appropriate severity ensures proper prioritization'
      });
    }

    return deviations;
  }

  private determineNextStage(escalationValidation: any, command: EscalateCommand): WorkflowStage {
    if (!escalationValidation.valid) {
      return command.stage; // Stay in current stage to fix issues
    }

    if (command.parameters.blockWorkflow) {
      return 'escalate'; // Stay in escalation until resolved
    }

    // Continue to appropriate next stage based on current stage
    const stageProgression: Record<WorkflowStage, WorkflowStage> = {
      'research': 'plan',
      'plan': 'build',
      'build': 'validate',
      'validate': 'complete',
      'complete': 'complete',
      'handoff': 'build', // Retry handoff if needed
      'escalate': 'plan' // Restart from plan after escalation
    };

    return stageProgression[command.stage] || 'plan';
  }

  private hasIssueKeywords(issue: string): boolean {
    const keywords = [
      'error', 'bug', 'issue', 'problem', 'blocker', 'critical',
      'failure', 'crash', 'exception', 'timeout', 'performance',
      'security', 'vulnerability', 'accessibility', 'compatibility'
    ];

    const lower = issue.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  }

  private isValidEscalationTarget(target: AgentType, fromAgent: AgentType): boolean {
    // Define valid escalation paths
    const validEscalations: Record<AgentType, AgentType[]> = {
      'ORCHESTRATOR': [], // Orchestrator typically doesn't escalate
      'DESIGN_SYSTEM': ['ORCHESTRATOR', 'UX_RESEARCH'],
      'COMPONENT_DEVELOPER': ['ORCHESTRATOR', 'DESIGN_SYSTEM', 'PERFORMANCE_OPTIMIZER'],
      'PERFORMANCE_OPTIMIZER': ['ORCHESTRATOR'],
      'ACCESSIBILITY': ['ORCHESTRATOR', 'DESIGN_SYSTEM'],
      'CROSS_PLATFORM': ['ORCHESTRATOR', 'COMPONENT_DEVELOPER'],
      'TESTING_QA': ['ORCHESTRATOR', 'SECURITY'],
      'SECURITY': ['ORCHESTRATOR'],
      'ANIMATION': ['ORCHESTRATOR', 'DESIGN_SYSTEM'],
      'I18N': ['ORCHESTRATOR', 'COMPONENT_DEVELOPER'],
      'UX_RESEARCH': ['ORCHESTRATOR', 'DESIGN_SYSTEM']
    };

    return validEscalations[fromAgent]?.includes(target) || target === 'ORCHESTRATOR';
  }

  private autoDetermineEscalationTarget(issue: string, severity: string, fromAgent: AgentType): AgentType {
    const lower = issue.toLowerCase();

    // High severity escalations always go to orchestrator
    if (severity === 'critical') {
      return 'ORCHESTRATOR';
    }

    // Security issues
    if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('auth')) {
      return 'SECURITY';
    }

    // Performance issues
    if (lower.includes('performance') || lower.includes('slow') || lower.includes('memory')) {
      return 'PERFORMANCE_OPTIMIZER';
    }

    // Accessibility issues
    if (lower.includes('accessibility') || lower.includes('a11y') || lower.includes('screen')) {
      return 'ACCESSIBILITY';
    }

    // Cross-platform issues
    if (lower.includes('browser') || lower.includes('mobile') || lower.includes('compatibility')) {
      return 'CROSS_PLATFORM';
    }

    // Testing issues
    if (lower.includes('test') || lower.includes('quality') || lower.includes('validation')) {
      return 'TESTING_QA';
    }

    // UX/Design issues
    if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
      return 'DESIGN_SYSTEM';
    }

    // Development issues
    if (lower.includes('code') || lower.includes('build') || lower.includes('component')) {
      return 'COMPONENT_DEVELOPER';
    }

    // Default to orchestrator for unknown issues
    return 'ORCHESTRATOR';
  }

  private getEscalationReasoning(targetAgent: AgentType, escalation: Escalation): string {
    const reasoning = {
      'SECURITY': 'Security-related issues require specialized security expertise',
      'PERFORMANCE_OPTIMIZER': 'Performance issues require performance analysis expertise',
      'ACCESSIBILITY': 'Accessibility issues require a11y compliance expertise',
      'CROSS_PLATFORM': 'Cross-platform issues require multi-platform expertise',
      'TESTING_QA': 'Quality issues require testing and validation expertise',
      'DESIGN_SYSTEM': 'Design issues require design system expertise',
      'COMPONENT_DEVELOPER': 'Development issues require component expertise',
      'UX_RESEARCH': 'UX issues require user research expertise',
      'ORCHESTRATOR': 'High severity or complex issues require orchestration oversight',
      'ANIMATION': 'Animation issues require motion design expertise',
      'I18N': 'Internationalization issues require i18n expertise'
    };

    return reasoning[targetAgent] || 'Issue requires specialized expertise';
  }

  private async checkTargetAvailability(targetAgent: AgentType): Promise<{ available: boolean; reason?: string }> {
    // Simulate target agent availability
    const availabilityFactors = {
      'ORCHESTRATOR': 0.95, // 95% availability
      'SECURITY': 0.85,      // 85% availability (busy with security tasks)
      'PERFORMANCE_OPTIMIZER': 0.90,
      'ACCESSIBILITY': 0.90,
      'CROSS_PLATFORM': 0.85,
      'TESTING_QA': 0.80,   // 80% availability (often running tests)
      'DESIGN_SYSTEM': 0.90,
      'COMPONENT_DEVELOPER': 0.85,
      'UX_RESEARCH': 0.85,
      'ANIMATION': 0.90,
      'I18N': 0.95
    };

    const baseAvailability = availabilityFactors[targetAgent] || 0.85;
    const random = Math.random();
    const available = random <= baseAvailability;

    return {
      available,
      reason: available ? undefined : `${targetAgent} is currently busy with high-priority tasks`
    };
  }

  private estimateResolutionTime(targetAgent: AgentType, escalation: Escalation): number {
    // Estimate resolution time in minutes
    const baseTimes = {
      'ORCHESTRATOR': 15,  // Quick decisions and coordination
      'SECURITY': 60,      // Security analysis takes time
      'PERFORMANCE_OPTIMIZER': 45,
      'ACCESSIBILITY': 30,
      'CROSS_PLATFORM': 45,
      'TESTING_QA': 30,
      'DESIGN_SYSTEM': 25,
      'COMPONENT_DEVELOPER': 20,
      'UX_RESEARCH': 40,
      'ANIMATION': 25,
      'I18N': 20
    };

    const baseTime = baseTimes[targetAgent] || 30;

    // Adjust for severity
    const severityMultiplier = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'critical': 2.0
    };

    return Math.round(baseTime * (severityMultiplier[escalation.severity] || 1.0));
  }

  private calculateExpectedResponseTime(severity: string): Date {
    const responseTimes = {
      'low': 60,      // 1 hour
      'medium': 30,    // 30 minutes
      'high': 15,     // 15 minutes
      'critical': 5   // 5 minutes
    };

    const minutes = responseTimes[severity as keyof typeof responseTimes] || 30;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private determineNotificationPriority(severity: string): Priority {
    const priorityMap = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical'
    };

    return priorityMap[severity as keyof typeof priorityMap] || 'medium';
  }

  private async respondToEscalation(escalationId: string, accepted: boolean, message: string): Promise<void> {
    try {
      const searchResult = await this.contextSystem.search({
        query: escalationId,
        types: ['agent_interaction'],
        limit: 5
      });

      for (const entry of searchResult.entries) {
        if (entry.content.includes('Escalation:')) {
          const escalation = JSON.parse(entry.content);
          escalation.resolution = message;
          escalation.resolvedAt = new Date();

          // Update entry
          await this.contextSystem.update(entry.id, {
            ...entry,
            content: JSON.stringify(escalation),
            metadata: {
              ...entry.metadata,
              updatedAt: new Date()
            }
          });

          // Create response entry
          await this.contextSystem.create({
            type: 'agent_interaction',
            title: `Escalation Response: ${escalationId}`,
            content: JSON.stringify({
              escalationId,
              accepted,
              message,
              timestamp: new Date()
            }),
            metadata: {
              version: 1,
              tags: ['escalation_response', escalation.agent, escalation.assignedTo],
              agents: [escalation.agent, escalation.assignedTo!].filter(Boolean)
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to respond to escalation:', error);
    }
  }

  private analyzeSeverityIndicators(issue: string): { recommendedSeverity: string; indicators: string[] } {
    const lower = issue.toLowerCase();
    const indicators: string[] = [];

    // Critical indicators
    if (lower.includes('critical') || lower.includes('production') || lower.includes('data loss') || lower.includes('security')) {
      indicators.push('critical');
      return { recommendedSeverity: 'critical', indicators };
    }

    // High indicators
    if (lower.includes('urgent') || lower.includes('blocking') || lower.includes('showstopper') || lower.includes('crash')) {
      indicators.push('high');
      return { recommendedSeverity: 'high', indicators };
    }

    // Medium indicators
    if (lower.includes('important') || lower.includes('major') || lower.includes('significant')) {
      indicators.push('medium');
      return { recommendedSeverity: 'medium', indicators };
    }

    // Low indicators
    indicators.push('low');
    return { recommendedSeverity: 'low', indicators };
  }
}