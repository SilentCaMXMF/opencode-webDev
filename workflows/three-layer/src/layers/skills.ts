import {
  SkillType,
  SkillResult,
  SkillContext,
  SkillInvocationPattern,
  DefaultSkillPatterns
} from '../types/three-layer';
import { AgentType } from '../../../monitoring/types/monitoring';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';

/**
 * Layer 3: Model-Invoked Skills
 * 
 * Skills invoked automatically by the model based on context:
 * - patternDiscovery: Detect reusable patterns
 * - architecturalReview: Validate against ADRs
 * - complianceCheck: Role-specific validation
 * - contextGeneration: Create persistent context
 * - evidenceCollection: Gather compliance evidence
 * - crossReferenceAnalysis: Analyze dependencies
 * - bestPracticeEnforcement: Validate against standards
 */
export class SkillSystem {
  private contextSystem: ContextSystem;
  private skillHandlers: Map<SkillType, Function>;
  private invocationPatterns: SkillInvocationPattern[];

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
    this.skillHandlers = new Map();
    this.invocationPatterns = [...DefaultSkillPatterns];
    this.initializeDefaultHandlers();
  }

  /**
   * Invoke a skill with the given context
   */
  async invokeSkill(
    skillType: SkillType,
    context: SkillContext
  ): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      const handler = this.skillHandlers.get(skillType);
      if (!handler) {
        throw new Error(`No handler registered for skill: ${skillType}`);
      }

      const result = await handler(context);
      const executionTime = Date.now() - startTime;

      // Store skill result in context system
      await this.storeSkillResult(context, result, executionTime);

      return {
        ...result,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const failedResult: SkillResult = {
        skillType,
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime,
        success: false,
        findings: [{
          type: 'error',
          severity: 'critical',
          message: `Skill invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confidence: 1.0
        }]
      };

      await this.storeSkillResult(context, failedResult, executionTime);
      return failedResult;
    }
  }

  /**
   * Automatically determine which skills to invoke based on context
   */
  async determineSkillsToInvoke(
    agentType: AgentType,
    workflowId: string,
    currentContext: Record<string, any>,
    triggerType: 'automatic' | 'hook' | 'command' = 'automatic'
  ): Promise<SkillType[]> {
    const skillsToInvoke: SkillType[] = [];

    // Filter patterns by trigger type
    const relevantPatterns = this.invocationPatterns.filter(
      pattern => pattern.trigger === triggerType || pattern.trigger === 'automatic'
    );

    // Sort by priority (highest first)
    relevantPatterns.sort((a, b) => b.priority - a.priority);

    // Check each pattern's conditions
    for (const pattern of relevantPatterns) {
      const shouldInvoke = await this.evaluateConditions(
        pattern.conditions,
        currentContext,
        agentType
      );

      if (shouldInvoke && !skillsToInvoke.includes(pattern.skill)) {
        skillsToInvoke.push(pattern.skill);
      }
    }

    return skillsToInvoke;
  }

  /**
   * Invoke all applicable skills for a given context
   */
  async invokeApplicableSkills(
    agentType: AgentType,
    workflowId: string,
    currentContext: Record<string, any>,
    triggerType: 'automatic' | 'hook' | 'command' = 'automatic'
  ): Promise<SkillResult[]> {
    const skillsToInvoke = await this.determineSkillsToInvoke(
      agentType,
      workflowId,
      currentContext,
      triggerType
    );

    const skillContext: SkillContext = {
      workflowId,
      agentType,
      trigger: triggerType,
      triggerContext: currentContext,
      previousResults: [],
      timestamp: new Date()
    };

    const results: SkillResult[] = [];

    for (const skillType of skillsToInvoke) {
      const result = await this.invokeSkill(skillType, skillContext);
      results.push(result);
      skillContext.previousResults = results;
    }

    return results;
  }

  /**
   * Register a custom skill handler
   */
  registerSkillHandler(skillType: SkillType, handler: (context: SkillContext) => Promise<SkillResult>): void {
    this.skillHandlers.set(skillType, handler);
  }

  /**
   * Register a custom invocation pattern
   */
  registerInvocationPattern(pattern: SkillInvocationPattern): void {
    this.invocationPatterns.push(pattern);
  }

  /**
   * Get skill results for a workflow
   */
  async getSkillResults(workflowId: string): Promise<SkillResult[]> {
    try {
      const searchResult = await this.contextSystem.search({
        query: workflowId,
        types: ['agent_interaction'],
        limit: 100
      });

      return searchResult.entries
        .filter(entry => entry.metadata?.tags?.includes('skill'))
        .map(entry => JSON.parse(entry.content));
    } catch (error) {
      console.error('Failed to get skill results:', error);
      return [];
    }
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async storeSkillResult(
    context: SkillContext,
    result: SkillResult,
    executionTime: number
  ): Promise<void> {
    const entry = {
      type: 'agent_interaction' as const,
      title: `Skill Invocation: ${result.skillType}`,
      content: JSON.stringify({
        ...result,
        executionTime,
        workflowId: context.workflowId,
        agentType: context.agentType
      }),
      metadata: {
        version: 1,
        tags: ['skill', result.skillType, context.agentType.toString(), result.success ? 'success' : 'failure'],
        agents: [context.agentType.toString()]
      }
    };

    try {
      await this.contextSystem.create(entry);
    } catch (error) {
      console.error('Failed to store skill result:', error);
    }
  }

  private async evaluateConditions(
    conditions: string[],
    context: Record<string, any>,
    agentType: AgentType
  ): Promise<boolean> {
    // Simple keyword matching for now
    // In a real implementation, this would use NLP or more sophisticated matching
    const contextString = JSON.stringify(context).toLowerCase();
    
    return conditions.some(condition => {
      const keywords = condition.toLowerCase().split(' ');
      return keywords.some(keyword => contextString.includes(keyword));
    });
  }

  private initializeDefaultHandlers(): void {
    // patternDiscovery: Detect reusable patterns
    this.skillHandlers.set('patternDiscovery', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];
      const artifacts: string[] = [];

      try {
        // Search for existing patterns in codebase
        const patternSearch = await this.contextSystem.search({
          query: context.triggerContext.taskDescription || 'component pattern',
          types: ['pattern'],
          limit: 10
        });

        if (patternSearch.entries.length > 0) {
          findings.push({
            type: 'pattern_match',
            severity: 'info',
            message: `Found ${patternSearch.entries.length} existing patterns that may be relevant`,
            recommendation: 'Review existing patterns before implementing new ones',
            confidence: 0.8
          });

          // Check for exact matches
          const exactMatches = patternSearch.entries.filter(entry => 
            entry.title.toLowerCase().includes(context.triggerContext.taskDescription?.toLowerCase() || '')
          );

          if (exactMatches.length > 0) {
            findings.push({
              type: 'exact_pattern_match',
              severity: 'warning',
              message: `Exact pattern match found: ${exactMatches[0].title}`,
              recommendation: 'Consider reusing existing pattern instead of creating new one',
              confidence: 0.95
            });
          }
        }

        // Check for anti-patterns
        const antiPatterns = this.detectAntiPatterns(context.triggerContext);
        if (antiPatterns.length > 0) {
          findings.push({
            type: 'anti_pattern',
            severity: 'warning',
            message: `Potential anti-patterns detected: ${antiPatterns.join(', ')}`,
            recommendation: 'Review and refactor to follow best practices',
            confidence: 0.7
          });
        }

        artifacts.push(...patternSearch.entries.map(e => e.id));

      } catch (error) {
        findings.push({
          type: 'error',
          severity: 'warning',
          message: 'Failed to search for patterns: ' + (error instanceof Error ? error.message : 'Unknown error'),
          confidence: 0.5
        });
      }

      return {
        skillType: 'patternDiscovery',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: true,
        findings,
        artifacts: artifacts.length > 0 ? artifacts : undefined
      };
    });

    // architecturalReview: Validate against ADRs
    this.skillHandlers.set('architecturalReview', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];

      try {
        // Search for relevant ADRs
        const adrSearch = await this.contextSystem.search({
          query: 'architectural decision',
          types: ['architectural_decision'],
          limit: 10
        });

        if (adrSearch.entries.length > 0) {
          findings.push({
            type: 'adr_found',
            severity: 'info',
            message: `Found ${adrSearch.entries.length} architectural decision records`,
            recommendation: 'Review ADRs to ensure alignment with system architecture',
            confidence: 0.9
          });

          // Check for alignment with proposed changes
          if (context.triggerContext.proposedChanges) {
            const relevantADRs = adrSearch.entries.filter(adr =>
              adr.content.toLowerCase().includes(context.triggerContext.proposedChanges.toLowerCase())
            );

            if (relevantADRs.length > 0) {
              findings.push({
                type: 'adr_alignment',
                severity: 'info',
                message: `Found ${relevantADRs.length} relevant ADRs for proposed changes`,
                recommendation: 'Ensure changes align with existing architectural decisions',
                confidence: 0.85
              });
            } else {
              findings.push({
                type: 'no_adr_alignment',
                severity: 'warning',
                message: 'No existing ADRs found for proposed changes',
                recommendation: 'Consider creating new ADR for significant architectural changes',
                confidence: 0.6
              });
            }
          }
        } else {
          findings.push({
            type: 'no_adrs',
            severity: 'warning',
            message: 'No architectural decision records found',
            recommendation: 'Consider documenting architectural decisions',
            confidence: 0.5
          });
        }

      } catch (error) {
        findings.push({
          type: 'error',
          severity: 'warning',
          message: 'Failed to review architecture: ' + (error instanceof Error ? error.message : 'Unknown error'),
          confidence: 0.5
        });
      }

      return {
        skillType: 'architecturalReview',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: true,
        findings
      };
    });

    // complianceCheck: Role-specific validation
    this.skillHandlers.set('complianceCheck', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];

      // Get compliance requirements based on agent type
      const complianceRequirements = this.getComplianceRequirements(context.agentType);

      for (const requirement of complianceRequirements) {
        // Check if requirement is met
        const isCompliant = await this.checkCompliance(context, requirement);
        
        if (!isCompliant) {
          findings.push({
            type: 'compliance_gap',
            severity: requirement.critical ? 'critical' : 'warning',
            message: `Compliance gap: ${requirement.name}`,
            recommendation: requirement.recommendation,
            confidence: 0.8
          });
        }
      }

      // Check for deviations from standards
      if (context.triggerContext.deviations) {
        findings.push({
          type: 'deviation_detected',
          severity: 'warning',
          message: `${context.triggerContext.deviations.length} deviations from standards detected`,
          recommendation: 'Review and address deviations before completion',
          confidence: 0.9
        });
      }

      return {
        skillType: 'complianceCheck',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: findings.filter(f => f.severity === 'critical').length === 0,
        findings
      };
    });

    // contextGeneration: Create persistent context
    this.skillHandlers.set('contextGeneration', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];
      const contextUpdates: any[] = [];

      try {
        // Generate context artifacts based on work completed
        if (context.triggerContext.workCompleted) {
          // Create pattern entry if applicable
          if (context.triggerContext.newPattern) {
            const patternEntry = await this.contextSystem.create({
              type: 'pattern',
              title: context.triggerContext.newPattern.title,
              content: JSON.stringify(context.triggerContext.newPattern),
              metadata: {
                version: 1,
                tags: ['pattern', context.agentType.toString(), 'auto-generated'],
                agents: [context.agentType.toString()]
              }
            });
            contextUpdates.push({ type: 'pattern', id: patternEntry.id });
            findings.push({
              type: 'pattern_created',
              severity: 'info',
              message: `New pattern documented: ${context.triggerContext.newPattern.title}`,
              recommendation: 'Pattern added to pattern library',
              confidence: 0.9
            });
          }

          // Create ADR if significant decision made
          if (context.triggerContext.architecturalDecision) {
            const adrEntry = await this.contextSystem.create({
              type: 'architectural_decision',
              title: `ADR: ${context.triggerContext.architecturalDecision.title}`,
              content: JSON.stringify(context.triggerContext.architecturalDecision),
              metadata: {
                version: 1,
                tags: ['adr', context.agentType.toString(), 'auto-generated'],
                agents: [context.agentType.toString()]
              }
            });
            contextUpdates.push({ type: 'adr', id: adrEntry.id });
            findings.push({
              type: 'adr_created',
              severity: 'info',
              message: `Architectural decision recorded: ${context.triggerContext.architecturalDecision.title}`,
              recommendation: 'ADR added to decision records',
              confidence: 0.95
            });
          }

          // Create session memory for learnings
          if (context.triggerContext.learnings) {
            const learningEntry = await this.contextSystem.create({
              type: 'session_memory',
              title: `Learnings: ${context.workflowId}`,
              content: JSON.stringify(context.triggerContext.learnings),
              metadata: {
                version: 1,
                tags: ['learning', context.agentType.toString()],
                agents: [context.agentType.toString()]
              }
            });
            contextUpdates.push({ type: 'learning', id: learningEntry.id });
          }
        }

      } catch (error) {
        findings.push({
          type: 'error',
          severity: 'warning',
          message: 'Failed to generate context: ' + (error instanceof Error ? error.message : 'Unknown error'),
          confidence: 0.5
        });
      }

      return {
        skillType: 'contextGeneration',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: true,
        findings,
        contextUpdates: contextUpdates.length > 0 ? contextUpdates : undefined
      };
    });

    // evidenceCollection: Gather compliance evidence
    this.skillHandlers.set('evidenceCollection', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];
      const artifacts: string[] = [];

      try {
        // Collect test results
        if (context.triggerContext.testResults) {
          artifacts.push('test_results');
          findings.push({
            type: 'test_evidence',
            severity: 'info',
            message: `Test results collected: ${context.triggerContext.testResults.passed}/${context.triggerContext.testResults.total} passed`,
            recommendation: 'Test evidence documented',
            confidence: 0.95
          });
        }

        // Collect performance metrics
        if (context.triggerContext.performanceMetrics) {
          artifacts.push('performance_metrics');
          const metrics = context.triggerContext.performanceMetrics;
          
          if (metrics.lcp > 2.5) {
            findings.push({
              type: 'performance_issue',
              severity: 'warning',
              message: `LCP ${metrics.lcp}s exceeds threshold of 2.5s`,
              recommendation: 'Optimize largest contentful paint',
              confidence: 0.9
            });
          }

          if (metrics.cls > 0.1) {
            findings.push({
              type: 'performance_issue',
              severity: 'warning',
              message: `CLS ${metrics.cls} exceeds threshold of 0.1`,
              recommendation: 'Reduce cumulative layout shift',
              confidence: 0.9
            });
          }
        }

        // Collect accessibility audit results
        if (context.triggerContext.accessibilityAudit) {
          artifacts.push('accessibility_audit');
          const audit = context.triggerContext.accessibilityAudit;
          
          if (audit.violations > 0) {
            findings.push({
              type: 'accessibility_issue',
              severity: audit.critical > 0 ? 'critical' : 'warning',
              message: `${audit.violations} accessibility violations found (${audit.critical} critical)`,
              recommendation: 'Address accessibility violations before release',
              confidence: 0.95
            });
          }
        }

        // Collect security scan results
        if (context.triggerContext.securityScan) {
          artifacts.push('security_scan');
          const scan = context.triggerContext.securityScan;
          
          if (scan.vulnerabilities > 0) {
            findings.push({
              type: 'security_issue',
              severity: scan.critical > 0 ? 'critical' : 'warning',
              message: `${scan.vulnerabilities} security vulnerabilities found (${scan.critical} critical)`,
              recommendation: 'Address security vulnerabilities immediately',
              confidence: 0.95
            });
          }
        }

      } catch (error) {
        findings.push({
          type: 'error',
          severity: 'warning',
          message: 'Failed to collect evidence: ' + (error instanceof Error ? error.message : 'Unknown error'),
          confidence: 0.5
        });
      }

      return {
        skillType: 'evidenceCollection',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: findings.filter(f => f.severity === 'critical').length === 0,
        findings,
        artifacts: artifacts.length > 0 ? artifacts : undefined
      };
    });

    // crossReferenceAnalysis: Analyze dependencies
    this.skillHandlers.set('crossReferenceAnalysis', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];

      // Analyze dependencies
      if (context.triggerContext.dependencies) {
        const deps = context.triggerContext.dependencies;
        
        // Check for circular dependencies
        const circular = this.detectCircularDependencies(deps);
        if (circular.length > 0) {
          findings.push({
            type: 'circular_dependency',
            severity: 'critical',
            message: `Circular dependencies detected: ${circular.join(', ')}`,
            recommendation: 'Refactor to eliminate circular dependencies',
            confidence: 0.9
          });
        }

        // Check for high coupling
        const highCoupling = deps.filter((d: any) => d.dependents > 10);
        if (highCoupling.length > 0) {
          findings.push({
            type: 'high_coupling',
            severity: 'warning',
            message: `High coupling detected in ${highCoupling.length} modules`,
            recommendation: 'Consider breaking down highly coupled modules',
            confidence: 0.7
          });
        }
      }

      // Check for potential conflicts
      if (context.triggerContext.proposedChanges) {
        findings.push({
          type: 'conflict_analysis',
          severity: 'info',
          message: 'Cross-reference analysis completed for proposed changes',
          recommendation: 'Review identified dependencies and integration points',
          confidence: 0.8
        });
      }

      return {
        skillType: 'crossReferenceAnalysis',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: true,
        findings
      };
    });

    // bestPracticeEnforcement: Validate against standards
    this.skillHandlers.set('bestPracticeEnforcement', async (context: SkillContext): Promise<SkillResult> => {
      const findings: any[] = [];

      // Check code quality
      if (context.triggerContext.codeQuality) {
        const quality = context.triggerContext.codeQuality;
        
        if (quality.coverage < 80) {
          findings.push({
            type: 'coverage_gap',
            severity: 'warning',
            message: `Code coverage ${quality.coverage}% below threshold of 80%`,
            recommendation: 'Add tests to improve coverage',
            confidence: 0.9
          });
        }

        if (quality.issues > 10) {
          findings.push({
            type: 'code_quality',
            severity: 'warning',
            message: `${quality.issues} code quality issues found`,
            recommendation: 'Address code quality issues',
            confidence: 0.8
          });
        }
      }

      // Check for best practice violations
      const violations = this.checkBestPractices(context.triggerContext);
      violations.forEach(violation => {
        findings.push({
          type: 'best_practice_violation',
          severity: violation.severity,
          message: violation.message,
          recommendation: violation.recommendation,
          confidence: violation.confidence
        });
      });

      return {
        skillType: 'bestPracticeEnforcement',
        agent: context.agentType.toString(),
        timestamp: new Date(),
        executionTime: 0,
        success: findings.filter(f => f.severity === 'critical').length === 0,
        findings
      };
    });
  }

  private detectAntiPatterns(context: Record<string, any>): string[] {
    const antiPatterns: string[] = [];
    
    // Simple pattern detection
    if (context.code) {
      if (context.code.includes('console.log')) {
        antiPatterns.push('console-logging');
      }
      if (context.code.includes('any')) {
        antiPatterns.push('explicit-any');
      }
      if (context.code.includes('TODO') || context.code.includes('FIXME')) {
        antiPatterns.push('unfinished-code');
      }
    }

    return antiPatterns;
  }

  private getComplianceRequirements(agentType: AgentType): any[] {
    const requirements: Record<string, any[]> = {
      'frontend-specialist': [
        { name: 'TypeScript Usage', critical: true, recommendation: 'Use TypeScript for type safety' },
        { name: 'Component Testing', critical: true, recommendation: 'Add tests for all components' },
        { name: 'Documentation', critical: false, recommendation: 'Document component APIs' }
      ],
      'quality-specialist': [
        { name: 'Coverage Threshold', critical: true, recommendation: 'Maintain 80%+ coverage' },
        { name: 'Test Quality', critical: true, recommendation: 'Ensure test reliability' },
        { name: 'CI/CD Integration', critical: false, recommendation: 'Integrate tests in CI/CD' }
      ],
      'security-specialist': [
        { name: 'Vulnerability Scan', critical: true, recommendation: 'Scan for vulnerabilities' },
        { name: 'Secure Coding', critical: true, recommendation: 'Follow secure coding practices' },
        { name: 'Dependency Audit', critical: true, recommendation: 'Audit dependencies regularly' }
      ],
      'default': [
        { name: 'Code Review', critical: false, recommendation: 'Get code review approval' },
        { name: 'Documentation', critical: false, recommendation: 'Document changes' }
      ]
    };

    return requirements[agentType.toString()] || requirements['default'];
  }

  private async checkCompliance(context: SkillContext, requirement: any): Promise<boolean> {
    // Simple compliance check
    // In real implementation, this would check actual state
    return context.triggerContext.compliance?.[requirement.name] === true;
  }

  private detectCircularDependencies(deps: any[]): string[] {
    // Simplified circular dependency detection
    const circular: string[] = [];
    // Real implementation would use graph algorithms
    return circular;
  }

  private checkBestPractices(context: Record<string, any>): any[] {
    const violations: any[] = [];
    
    if (context.code) {
      if (context.code.includes('var ')) {
        violations.push({
          severity: 'warning',
          message: 'Usage of var detected - use const or let instead',
          recommendation: 'Replace var with const or let',
          confidence: 0.9
        });
      }
    }

    return violations;
  }
}

export default SkillSystem;
