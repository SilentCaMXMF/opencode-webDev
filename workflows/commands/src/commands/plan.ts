import { v4 as uuidv4 } from 'uuid';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { 
  PlanCommand, 
  CommandResult,
  WorkflowStage,
  AgentType,
  Deviation,
  Evidence,
  QualityGate
} from '@types/workflow';

export class PlanCommandHandler {
  private contextSystem: ContextSystem;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
  }

  async execute(command: PlanCommand): Promise<CommandResult> {
    const startTime = Date.now();
    const deviations: Deviation[] = [];
    const evidence: Evidence[] = [];

    try {
      // Analyze requirements and constraints
      const requirementAnalysis = await this.analyzeRequirements(command.parameters.requirements);
      
      // Create structured specifications
      const specifications = await this.createSpecifications(command.parameters);
      
      // Generate resource allocation plan
      const resourcePlan = await this.createResourcePlan(
        command.parameters.resources,
        command.parameters.requirements
      );
      
      // Create timeline validation
      const timelineValidation = await this.validateTimeline(command.parameters.timeline);
      
      // Generate quality gates for validation stage
      const qualityGates = await this.generateQualityGates(command.parameters.deliverables);

      // Generate planning evidence
      evidence.push(...await this.generatePlanningEvidence(
        requirementAnalysis,
        specifications,
        resourcePlan,
        timelineValidation,
        command
      ));

      // Detect planning deviations
      const planningDeviations = await this.detectPlanningDeviations(
        command.parameters,
        specifications,
        timelineValidation
      );
      deviations.push(...planningDeviations);

      // Store plan in context system
      await this.storePlanInContext(command, specifications, qualityGates);

      const executionTime = Date.now() - startTime;

      return {
        commandId: command.id,
        success: true,
        stage: 'plan',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: {
          requirementAnalysis,
          specifications,
          resourcePlan,
          timelineValidation,
          qualityGates,
          artifacts: await this.generatePlanningArtifacts(specifications)
        },
        deviations,
        evidence,
        nextStage: 'build',
        artifacts: await this.generatePlanningArtifacts(specifications)
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        commandId: command.id,
        success: false,
        stage: 'plan',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: null,
        deviations,
        evidence,
        message: `Planning command failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async analyzeRequirements(requirements: string[]): Promise<any> {
    const analysis = {
      total: requirements.length,
      categories: this.categorizeRequirements(requirements),
      complexity: this.assessComplexity(requirements),
      dependencies: this.identifyRequirementDependencies(requirements),
      risks: this.identifyRequirementRisks(requirements)
    };

    return analysis;
  }

  private categorizeRequirements(requirements: string[]): Record<string, string[]> {
    const categories = {
      functional: [] as string[],
      non_functional: [] as string[],
      technical: [] as string[],
      business: [] as string[],
      ux: [] as string[]
    };

    const functionalKeywords = ['should', 'shall', 'must', 'user can', 'allow'];
    const nonFunctionalKeywords = ['performance', 'security', 'accessibility', 'scalable', 'reliable'];
    const technicalKeywords = ['api', 'database', 'integration', 'system', 'architecture'];
    const businessKeywords = ['business', 'revenue', 'cost', 'market', 'customer'];
    const uxKeywords = ['ui', 'ux', 'interface', 'experience', 'usability', 'design'];

    for (const requirement of requirements) {
      const lower = requirement.toLowerCase();
      
      if (functionalKeywords.some(keyword => lower.includes(keyword))) {
        categories.functional.push(requirement);
      }
      if (nonFunctionalKeywords.some(keyword => lower.includes(keyword))) {
        categories.non_functional.push(requirement);
      }
      if (technicalKeywords.some(keyword => lower.includes(keyword))) {
        categories.technical.push(requirement);
      }
      if (businessKeywords.some(keyword => lower.includes(keyword))) {
        categories.business.push(requirement);
      }
      if (uxKeywords.some(keyword => lower.includes(keyword))) {
        categories.ux.push(requirement);
      }
    }

    // Uncategorized requirements
    const categorized = Object.values(categories).flat();
    const uncategorized = requirements.filter(req => !categorized.includes(req));
    if (uncategorized.length > 0) {
      categories.functional.push(...uncategorized); // Default to functional
    }

    return categories;
  }

  private assessComplexity(requirements: string[]): { level: string; score: number; factors: string[] } {
    let score = 0;
    const factors: string[] = [];

    // Base complexity from requirement count
    if (requirements.length > 20) {
      score += 30;
      factors.push('High requirement count');
    } else if (requirements.length > 10) {
      score += 15;
      factors.push('Medium requirement count');
    }

    // Complexity from keywords
    const complexKeywords = [
      { keywords: ['integration', 'multiple', 'complex'], weight: 25 },
      { keywords: ['real-time', 'live', 'streaming'], weight: 20 },
      { keywords: ['scalable', 'distributed', 'microservices'], weight: 20 },
      { keywords: ['ai', 'machine learning', 'ml'], weight: 30 },
      { keywords: ['blockchain', 'crypto', 'security'], weight: 15 }
    ];

    for (const { keywords, weight } of complexKeywords) {
      const matches = requirements.some(req => 
        keywords.some(keyword => req.toLowerCase().includes(keyword))
      );
      if (matches) {
        score += weight;
        factors.push(`Complex requirement detected: ${keywords[0]}`);
      }
    }

    let level = 'simple';
    if (score >= 60) level = 'complex';
    else if (score >= 30) level = 'medium';

    return { level, score, factors };
  }

  private identifyRequirementDependencies(requirements: string[]): Array<{from: string; to: string; type: string}> {
    const dependencies: Array<{from: string; to: string; type: string}> = [];
    
    const dependencyIndicators = [
      { pattern: /requires|depends on|needs/g, type: 'functional' },
      { pattern: /after|following|once/g, type: 'sequence' },
      { pattern: /conflicts with|incompatible with/g, type: 'conflict' }
    ];

    for (let i = 0; i < requirements.length; i++) {
      const requirement = requirements[i].toLowerCase();
      
      for (const { pattern, type } of dependencyIndicators) {
        const matches = requirement.match(pattern);
        if (matches) {
          // Look for other requirement numbers or references
          const reqNumbers = requirement.match(/\d+/g);
          if (reqNumbers) {
            for (const num of reqNumbers) {
              const targetIndex = parseInt(num) - 1;
              if (targetIndex >= 0 && targetIndex < requirements.length && targetIndex !== i) {
                dependencies.push({
                  from: requirements[i],
                  to: requirements[targetIndex],
                  type
                });
              }
            }
          }
        }
      }
    }

    return dependencies;
  }

  private identifyRequirementRisks(requirements: string[]): Array<{risk: string; severity: string; mitigation: string}> {
    const risks: Array<{risk: string; severity: string; mitigation: string}> = [];

    const riskPatterns = [
      {
        indicators: ['new', 'novel', 'first time', 'innovative'],
        risk: 'Innovation risk - untested approach',
        severity: 'medium',
        mitigation: 'Prototype early, conduct proof of concept'
      },
      {
        indicators: ['tight deadline', 'aggressive timeline', 'short timeframe'],
        risk: 'Timeline risk - insufficient time for development',
        severity: 'high',
        mitigation: 'Scope prioritization, phased delivery'
      },
      {
        indicators: ['multiple teams', 'cross-functional', 'distributed'],
        risk: 'Coordination risk - team dependencies',
        severity: 'medium',
        mitigation: 'Clear interfaces, regular sync points'
      },
      {
        indicators: ['integration', 'external', 'third-party'],
        risk: 'Integration risk - external dependencies',
        severity: 'medium',
        mitigation: 'Early integration testing, fallback plans'
      }
    ];

    for (const requirement of requirements) {
      const lower = requirement.toLowerCase();
      
      for (const { indicators, risk, severity, mitigation } of riskPatterns) {
        if (indicators.some(indicator => lower.includes(indicator))) {
          risks.push({ risk, severity, mitigation });
        }
      }
    }

    return risks;
  }

  private async createSpecifications(parameters: any): Promise<any> {
    const specifications = {
      id: uuidv4(),
      requirements: parameters.requirements,
      constraints: parameters.constraints || [],
      deliverables: parameters.deliverables,
      timeline: parameters.timeline,
      created: new Date(),
      agent: 'DESIGN_SYSTEM', // Typically created by design system agent
      breakdown: this.breakdownSpecifications(parameters.requirements),
      acceptanceCriteria: this.generateAcceptanceCriteria(parameters.requirements)
    };

    return specifications;
  }

  private breakdownSpecifications(requirements: string[]): any[] {
    return requirements.map((req, index) => ({
      id: `REQ-${index + 1}`,
      title: req.split('.')[0] || `Requirement ${index + 1}`,
      description: req,
      priority: this.assessRequirementPriority(req),
      effort: this.estimateEffort(req),
      dependencies: []
    }));
  }

  private assessRequirementPriority(requirement: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['security', 'critical', 'essential', 'must', 'shall'];
    const highKeywords = ['important', 'primary', 'main', 'key'];
    const lowKeywords = ['nice to have', 'optional', 'could', 'should consider'];

    const lower = requirement.toLowerCase();
    
    if (criticalKeywords.some(keyword => lower.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => lower.includes(keyword))) return 'high';
    if (lowKeywords.some(keyword => lower.includes(keyword))) return 'low';
    
    return 'medium';
  }

  private estimateEffort(requirement: string): number {
    // Simple effort estimation based on complexity indicators
    let effort = 3; // Base effort in story points

    const complexityIndicators = [
      { keywords: ['integration', 'multiple', 'complex'], multiplier: 1.5 },
      { keywords: ['simple', 'basic', 'straightforward'], multiplier: 0.8 },
      { keywords: ['research', 'investigate', 'explore'], multiplier: 1.3 },
      { keywords: ['ui', 'interface', 'design'], multiplier: 1.2 }
    ];

    const lower = requirement.toLowerCase();
    
    for (const { keywords, multiplier } of complexityIndicators) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        effort *= multiplier;
      }
    }

    return Math.round(effort);
  }

  private generateAcceptanceCriteria(requirements: string[]): string[] {
    return requirements.map(req => {
      const criteria = [];
      criteria.push(`Requirement is implemented: ${req}`);
      criteria.push('Unit tests written and passing');
      criteria.push('Code review completed');
      criteria.push('Documentation updated');
      return criteria.join('; ');
    });
  }

  private async createResourcePlan(resources: any[], requirements: string[]): Promise<any> {
    const resourcePlan = {
      resources: resources || this.estimateResources(requirements),
      allocation: this.allocateResources(requirements),
      conflicts: this.identifyResourceConflicts(resources || []),
      timeline: this.generateResourceTimeline(requirements)
    };

    return resourcePlan;
  }

  private estimateResources(requirements: string[]): any[] {
    const totalEffort = requirements.reduce((sum, req) => 
      sum + this.estimateEffort(req), 0
    );

    return [
      {
        type: 'development',
        description: 'Frontend development resources',
        quantity: Math.ceil(totalEffort / 20) // Assume 20 points per developer
      },
      {
        type: 'design',
        description: 'UI/UX design resources',
        quantity: Math.ceil(requirements.filter(req => 
          req.toLowerCase().includes('ui') || req.toLowerCase().includes('design')
        ).length / 5)
      },
      {
        type: 'testing',
        description: 'QA and testing resources',
        quantity: Math.ceil(totalEffort / 15)
      }
    ];
  }

  private allocateResources(requirements: string[]): any {
    const allocation = {
      development: 0.6, // 60% of effort
      design: 0.2,      // 20% of effort
      testing: 0.15,    // 15% of effort
      coordination: 0.05 // 5% of effort
    };

    return allocation;
  }

  private identifyResourceConflicts(resources: any[]): any[] {
    const conflicts: any[] = [];
    
    if (!resources) return conflicts;

    const resourceTypes = resources.map(r => r.type);
    const duplicates = resourceTypes.filter((type, index) => 
      resourceTypes.indexOf(type) !== index
    );

    for (const duplicate of [...new Set(duplicates)]) {
      conflicts.push({
        type: 'duplicate_resource',
        description: `Multiple resources of type ${duplicate}`,
        severity: 'low',
        resolution: 'Consider consolidation or role clarification'
      });
    }

    return conflicts;
  }

  private generateResourceTimeline(requirements: string[]): any {
    const phases = [
      { name: 'Research & Planning', duration: 2, units: 'days' },
      { name: 'Design', duration: 3, units: 'days' },
      { name: 'Development', duration: Math.ceil(requirements.length * 1.5), units: 'days' },
      { name: 'Testing', duration: 2, units: 'days' },
      { name: 'Deployment', duration: 1, units: 'days' }
    ];

    return phases;
  }

  private async validateTimeline(timeline: any): Promise<any> {
    const validation = {
      realistic: true,
      issues: [],
      suggestions: []
    };

    // Check if start date is in the future
    if (new Date(timeline.start) < new Date()) {
      validation.realistic = false;
      validation.issues.push('Start date is in the past');
    }

    // Check if end date is after start date
    if (new Date(timeline.end) <= new Date(timeline.start)) {
      validation.realistic = false;
      validation.issues.push('End date must be after start date');
    }

    // Check milestone timing
    const sortedMilestones = timeline.milestones.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 1; i < sortedMilestones.length; i++) {
      const prev = new Date(sortedMilestones[i - 1].date);
      const curr = new Date(sortedMilestones[i].date);
      
      if (curr <= prev) {
        validation.realistic = false;
        validation.issues.push(`Milestone "${sortedMilestones[i].name}" is not properly sequenced`);
      }
    }

    // Check if overall timeline is reasonable
    const totalDuration = Math.ceil(
      (new Date(timeline.end).getTime() - new Date(timeline.start).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (totalDuration < 5) {
      validation.suggestions.push('Consider extending timeline for adequate development time');
    } else if (totalDuration > 90) {
      validation.suggestions.push('Consider breaking down into smaller releases');
    }

    return validation;
  }

  private async generateQualityGates(deliverables: string[]): Promise<QualityGate[]> {
    const gates: QualityGate[] = [];

    // Code quality gate
    gates.push({
      id: uuidv4(),
      name: 'Code Quality Gate',
      stage: 'validate',
      criteria: [
        { metric: 'code_coverage', threshold: 80, operator: '>=', weight: 1 },
        { metric: 'eslint_errors', threshold: 0, operator: '==', weight: 2 },
        { metric: 'typescript_errors', threshold: 0, operator: '==', weight: 2 }
      ],
      requiredEvidenceTypes: ['code_review', 'automated_check'],
      autoApprove: true,
      timeoutMs: 300000
    });

    // Performance gate
    gates.push({
      id: uuidv4(),
      name: 'Performance Gate',
      stage: 'validate',
      criteria: [
        { metric: 'lighthouse_performance', threshold: 90, operator: '>=', weight: 1 },
        { metric: 'bundle_size', threshold: 250, operator: '<=', weight: 1 }
      ],
      requiredEvidenceTypes: ['performance_metric', 'automated_check'],
      autoApprove: false,
      timeoutMs: 600000
    });

    // Accessibility gate
    gates.push({
      id: uuidv4(),
      name: 'Accessibility Gate',
      stage: 'validate',
      criteria: [
        { metric: 'a11y_score', threshold: 95, operator: '>=', weight: 2 }
      ],
      requiredEvidenceTypes: ['accessibility_audit'],
      autoApprove: false,
      timeoutMs: 300000
    });

    return gates;
  }

  private async generatePlanningEvidence(
    requirementAnalysis: any,
    specifications: any,
    resourcePlan: any,
    timelineValidation: any,
    command: PlanCommand
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Requirements coverage evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'plan',
      agent: command.agent,
      data: {
        requirementCount: requirementAnalysis.total,
        requirementCategories: Object.keys(requirementAnalysis.categories),
        complexityLevel: requirementAnalysis.complexity.level,
        complexityScore: requirementAnalysis.complexity.score
      },
      timestamp: new Date(),
      confidence: 0.9
    });

    // Specification completeness evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'plan',
      agent: command.agent,
      data: {
        specificationId: specifications.id,
        specificationBreakdown: specifications.breakdown.length,
        acceptanceCriteriaCount: specifications.acceptanceCriteria.length,
        constraintsCount: specifications.constraints.length
      },
      timestamp: new Date(),
      confidence: 0.85
    });

    // Timeline validation evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'plan',
      agent: command.agent,
      data: {
        timelineRealistic: timelineValidation.realistic,
        timelineIssues: timelineValidation.issues,
        timelineSuggestions: timelineValidation.suggestions
      },
      timestamp: new Date(),
      confidence: 0.8
    });

    return evidence;
  }

  private async detectPlanningDeviations(
    parameters: any,
    specifications: any,
    timelineValidation: any
  ): Promise<Deviation[]> {
    const deviations: Deviation[] = [];

    // Check for unrealistic timeline
    if (!timelineValidation.realistic) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'plan',
        agent: 'ORCHESTRATOR',
        expected: 'Realistic timeline with proper sequencing',
        actual: 'Timeline validation failed',
        severity: 'major',
        justification: 'Unrealistic timelines risk project failure'
      });
    }

    // Check for insufficient requirements detail
    if (parameters.requirements.length < 3) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'plan',
        agent: 'ORCHESTRATOR',
        expected: 'Detailed requirements breakdown',
        actual: 'Insufficient requirements detail',
        severity: 'minor',
        justification: 'Better requirements lead to better outcomes'
      });
    }

    return deviations;
  }

  private async storePlanInContext(command: PlanCommand, specifications: any, qualityGates: QualityGate[]): Promise<void> {
    // Store specifications in context system
    await this.contextSystem.create({
      type: 'project_context',
      title: `Plan: ${command.id}`,
      content: JSON.stringify(specifications),
      metadata: {
        version: 1,
        tags: ['plan', 'specifications', command.agent],
        agents: [command.agent]
      }
    });

    // Store quality gates
    for (const gate of qualityGates) {
      await this.contextSystem.create({
        type: 'architectural_decision',
        title: `Quality Gate: ${gate.name}`,
        content: JSON.stringify(gate),
        metadata: {
          version: 1,
          tags: ['quality_gate', 'validation', command.agent],
          agents: [command.agent]
        }
      });
    }
  }

  private async generatePlanningArtifacts(specifications: any): Promise<string[]> {
    const artifacts: string[] = [];

    // Generate specification document
    artifacts.push(`specifications/${specifications.id}.json`);
    
    // Generate breakdown documents
    artifacts.push(`breakdown/${specifications.id}-breakdown.json`);
    
    // Generate acceptance criteria
    artifacts.push(`criteria/${specifications.id}-acceptance.md`);

    return artifacts;
  }
}