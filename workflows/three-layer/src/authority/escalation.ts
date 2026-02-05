import {
  EscalationRequest,
  EscalationTarget,
  AuthorityLevel,
  EscalationRoutingRules,
  CommandResult
} from '../types/three-layer';
import { AgentType } from '../../../monitoring/types/monitoring';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';

/**
 * Authority Escalation System
 * 
 * Handles escalation routing based on issue type with multiple targets.
 * Implements the four-level escalation path:
 * - Level 1: Self-resolution attempt
 * - Level 2: Escalate to specific role authority
 * - Level 3: Escalate to Program Manager
 * - Level 4: Human stakeholder involvement
 */
export class AuthorityEscalationSystem {
  private contextSystem: ContextSystem;
  private pendingEscalations: Map<string, EscalationRequest>;
  private escalationHistory: Map<string, EscalationRequest[]>;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
    this.pendingEscalations = new Map();
    this.escalationHistory = new Map();
  }

  /**
   * Create an escalation request
   */
  async escalate(
    fromAgent: AgentType,
    issue: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: Record<string, any>,
    blocking: boolean = false
  ): Promise<EscalationRequest> {
    // Determine escalation targets based on issue type
    const issueType = this.classifyIssueType(issue, context);
    const suggestedTargets = EscalationRoutingRules[issueType] || ['program-manager'];
    
    // Determine authority level based on severity and issue type
    const authorityLevel = this.determineAuthorityLevel(severity, issueType);

    const escalation: EscalationRequest = {
      id: `escalation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      fromAgent: fromAgent.toString(),
      severity,
      issue,
      context,
      suggestedTargets,
      authorityLevel,
      blocking,
      resolved: false
    };

    // Store escalation
    this.pendingEscalations.set(escalation.id, escalation);
    
    // Add to history
    const history = this.escalationHistory.get(fromAgent.toString()) || [];
    history.push(escalation);
    this.escalationHistory.set(fromAgent.toString(), history);

    // Store in context system
    await this.storeEscalation(escalation);

    // If critical and blocking, trigger immediate notification
    if (severity === 'critical' && blocking) {
      await this.triggerCriticalEscalation(escalation);
    }

    console.log(`Escalation created: ${escalation.id} - ${issue} (Severity: ${severity})`);
    console.log(`Suggested targets: ${suggestedTargets.join(', ')}`);
    console.log(`Authority level: ${authorityLevel}`);

    return escalation;
  }

  /**
   * Resolve an escalation
   */
  async resolveEscalation(
    escalationId: string,
    resolvedBy: string,
    decision: string,
    rationale: string
  ): Promise<EscalationRequest> {
    const escalation = this.pendingEscalations.get(escalationId);
    if (!escalation) {
      throw new Error(`Escalation not found: ${escalationId}`);
    }

    escalation.resolved = true;
    escalation.resolution = {
      by: resolvedBy,
      timestamp: new Date(),
      decision,
      rationale
    };

    // Remove from pending
    this.pendingEscalations.delete(escalationId);

    // Update in context system
    await this.updateEscalation(escalation);

    console.log(`Escalation resolved: ${escalationId} by ${resolvedBy}`);
    console.log(`Decision: ${decision}`);

    return escalation;
  }

  /**
   * Get pending escalations
   */
  async getPendingEscalations(agentFilter?: AgentType[]): Promise<EscalationRequest[]> {
    let escalations = Array.from(this.pendingEscalations.values());

    if (agentFilter && agentFilter.length > 0) {
      const agentStrings = agentFilter.map(a => a.toString());
      escalations = escalations.filter(e => agentStrings.includes(e.fromAgent));
    }

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return escalations.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Get escalation history for an agent
   */
  async getEscalationHistory(agentType: AgentType): Promise<EscalationRequest[]> {
    return this.escalationHistory.get(agentType.toString()) || [];
  }

  /**
   * Route escalation to appropriate target
   */
  async routeEscalation(escalationId: string): Promise<EscalationTarget> {
    const escalation = this.pendingEscalations.get(escalationId);
    if (!escalation) {
      throw new Error(`Escalation not found: ${escalationId}`);
    }

    // Check if this is a Level 4 escalation
    if (escalation.authorityLevel === 'level_4') {
      return 'human-stakeholder';
    }

    // Get the first suggested target
    const target = escalation.suggestedTargets[0];
    
    // Check if target is available (in real implementation, would check agent status)
    const isAvailable = await this.checkTargetAvailability(target);
    
    if (!isAvailable) {
      // Fall back to next target
      if (escalation.suggestedTargets.length > 1) {
        return escalation.suggestedTargets[1];
      }
      // Fall back to program-manager
      return 'program-manager';
    }

    return target;
  }

  /**
   * Get escalation metrics
   */
  async getEscalationMetrics(): Promise<{
    totalEscalations: number;
    pendingEscalations: number;
    resolvedEscalations: number;
    averageResolutionTime: number;
    bySeverity: Record<string, number>;
    byIssueType: Record<string, number>;
  }> {
    const allEscalations = Array.from(this.escalationHistory.values()).flat();
    
    const resolved = allEscalations.filter(e => e.resolved);
    const resolutionTimes = resolved
      .filter(e => e.resolution)
      .map(e => e.resolution!.timestamp.getTime() - e.timestamp.getTime());
    
    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    const bySeverity = allEscalations.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byIssueType = allEscalations.reduce((acc, e) => {
      const issueType = this.classifyIssueType(e.issue, e.context);
      acc[issueType] = (acc[issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEscalations: allEscalations.length,
      pendingEscalations: this.pendingEscalations.size,
      resolvedEscalations: resolved.length,
      averageResolutionTime,
      bySeverity,
      byIssueType
    };
  }

  /**
   * Check if escalation is needed based on command result
   */
  shouldEscalate(result: CommandResult): { shouldEscalate: boolean; reason?: string } {
    // Check for critical deviations
    const criticalDeviations = result.deviations?.filter(d => d.severity === 'critical') || [];
    if (criticalDeviations.length > 0) {
      return {
        shouldEscalate: true,
        reason: `Critical deviations detected: ${criticalDeviations.length}`
      };
    }

    // Check for failed quality gates
    if (result.qualityGateStatus === 'failed') {
      return {
        shouldEscalate: true,
        reason: 'Quality gate failed'
      };
    }

    // Check for command failure
    if (!result.success) {
      return {
        shouldEscalate: true,
        reason: `Command failed: ${result.message}`
      };
    }

    return { shouldEscalate: false };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private classifyIssueType(issue: string, context: Record<string, any>): string {
    const issueLower = issue.toLowerCase();
    
    // Check for architectural issues
    if (issueLower.includes('architectural') || issueLower.includes('architecture') || 
        issueLower.includes('design') || context.architectural === true) {
      return 'architectural_conflict';
    }

    // Check for performance issues
    if (issueLower.includes('performance') || issueLower.includes('slow') || 
        issueLower.includes('optimization') || context.performance === true) {
      return 'performance_regression';
    }

    // Check for accessibility issues
    if (issueLower.includes('accessibility') || issueLower.includes('a11y') || 
        issueLower.includes('wcag') || context.accessibility === true) {
      return 'accessibility_violation';
    }

    // Check for security issues
    if (issueLower.includes('security') || issueLower.includes('vulnerability') || 
        issueLower.includes('xss') || issueLower.includes('csrf') || context.security === true) {
      return 'security_vulnerability';
    }

    // Check for quality issues
    if (issueLower.includes('quality') || issueLower.includes('testing') || 
        issueLower.includes('coverage') || context.quality === true) {
      return 'quality_gate_failure';
    }

    // Check for compatibility issues
    if (issueLower.includes('compatibility') || issueLower.includes('browser') || 
        issueLower.includes('cross-platform') || context.compatibility === true) {
      return 'compatibility_issue';
    }

    // Check for cultural issues
    if (issueLower.includes('cultural') || issueLower.includes('localization') || 
        issueLower.includes('i18n') || context.cultural === true) {
      return 'cultural_sensitivity';
    }

    // Check for UX issues
    if (issueLower.includes('ux') || issueLower.includes('usability') || 
        issueLower.includes('user experience') || context.ux === true) {
      return 'ux_critical_issue';
    }

    // Check for resource issues
    if (issueLower.includes('resource') || issueLower.includes('budget') || 
        issueLower.includes('constraint') || context.resource === true) {
      return 'resource_constraint';
    }

    // Check for timeline issues
    if (issueLower.includes('timeline') || issueLower.includes('deadline') || 
        issueLower.includes('schedule') || context.timeline === true) {
      return 'timeline_conflict';
    }

    // Check for scope issues
    if (issueLower.includes('scope') || issueLower.includes('requirement') || 
        issueLower.includes('feature') || context.scope === true) {
      return 'scope_change';
    }

    // Default to general escalation
    return 'general';
  }

  private determineAuthorityLevel(
    severity: 'low' | 'medium' | 'high' | 'critical',
    issueType: string
  ): AuthorityLevel {
    // Critical issues always go to Level 3 or 4
    if (severity === 'critical') {
      // Check if human involvement needed
      if (['resource_constraint', 'timeline_conflict', 'scope_change'].includes(issueType)) {
        return 'level_4';
      }
      return 'level_3';
    }

    // High severity goes to Level 2 or 3
    if (severity === 'high') {
      if (['architectural_conflict', 'security_vulnerability'].includes(issueType)) {
        return 'level_2';
      }
      return 'level_3';
    }

    // Medium severity goes to Level 2
    if (severity === 'medium') {
      return 'level_2';
    }

    // Low severity can be Level 1 (self-resolution)
    return 'level_1';
  }

  private async checkTargetAvailability(target: EscalationTarget): Promise<boolean> {
    // In real implementation, would check if agent is online/available
    // For now, assume all agents except human-stakeholder are available
    return target !== 'human-stakeholder';
  }

  private async triggerCriticalEscalation(escalation: EscalationRequest): Promise<void> {
    // In real implementation, would send notifications (email, Slack, etc.)
    console.error('🚨 CRITICAL ESCALATION:', escalation.issue);
    console.error('   From:', escalation.fromAgent);
    console.error('   ID:', escalation.id);
    console.error('   Blocking:', escalation.blocking);
    console.error('   Suggested targets:', escalation.suggestedTargets.join(', '));
    
    // Could integrate with alerting system here
  }

  private async storeEscalation(escalation: EscalationRequest): Promise<void> {
    const entry = {
      type: 'agent_interaction' as const,
      title: `Escalation: ${escalation.issue.substring(0, 50)}...`,
      content: JSON.stringify(escalation),
      metadata: {
        version: 1,
        tags: ['escalation', escalation.severity, escalation.fromAgent],
        agents: [escalation.fromAgent]
      }
    };

    try {
      await this.contextSystem.create(entry);
    } catch (error) {
      console.error('Failed to store escalation:', error);
    }
  }

  private async updateEscalation(escalation: EscalationRequest): Promise<void> {
    try {
      // Search for existing escalation entry
      const searchResult = await this.contextSystem.search({
        query: escalation.id,
        types: ['agent_interaction'],
        limit: 1
      });

      const entry = {
        type: 'agent_interaction' as const,
        title: `Escalation Resolved: ${escalation.issue.substring(0, 50)}...`,
        content: JSON.stringify(escalation),
        metadata: {
          version: 1,
          tags: ['escalation', 'resolved', escalation.fromAgent],
          agents: [escalation.fromAgent]
        }
      };

      if (searchResult.entries.length > 0) {
        await this.contextSystem.update(searchResult.entries[0].id, entry);
      }
    } catch (error) {
      console.error('Failed to update escalation:', error);
    }
  }
}

export default AuthorityEscalationSystem;
