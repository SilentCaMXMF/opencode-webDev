/**
 * Evidence Collector
 * Phase 3: Advanced Orchestration - Evidence-Based Delivery System
 * 
 * Collects and manages evidence artifacts for compliance
 */

import {
  EvidenceArtifact,
  EvidenceArtifactType,
  EvidenceStatus,
  EvidenceSource,
  AnyEvidence,
  EvidenceCollectionRequest,
  EvidenceCollectionResult,
  EvidenceValidationResult,
  EvidenceCollectionConfig,
  ComplianceReport,
  PREvidenceContext,
  TestEvidence,
  ScreenshotEvidence,
  PerformanceEvidence,
  SecurityEvidence,
  AccessibilityEvidence,
  CodeQualityEvidence,
  CoverageEvidence
} from '../types/evidence-artifact';

import { AgentType } from '../../monitoring/types/monitoring';
import { ZenModelTier } from '../../provider-adapter/src/types/zen-provider';

/**
 * Default evidence collection configuration
 */
export const DEFAULT_EVIDENCE_CONFIG: EvidenceCollectionConfig = {
  storageType: 'database',
  retentionDays: 90,
  parallelCollection: true,
  maxConcurrentCollections: 5,
  defaultTimeout: 300000, // 5 minutes
  retryAttempts: 3,
  autoValidate: true,
  validationThreshold: 0.8,
  requireManualVerification: false,
  enabledTools: {
    test: true,
    screenshot: true,
    performance: true,
    security: true,
    accessibility: true,
    codeQuality: true,
    coverage: true
  },
  criteriaMappings: {
    'functional_correctness': ['test'],
    'ui_consistency': ['screenshot'],
    'performance_requirements': ['performance'],
    'security_compliance': ['security'],
    'accessibility_standards': ['accessibility'],
    'code_quality': ['code_quality', 'coverage'],
    'documentation_complete': ['documentation']
  }
};

/**
 * Evidence Collector
 * Main class for collecting and managing evidence
 */
export class EvidenceCollector {
  private config: EvidenceCollectionConfig;
  private activeCollections: Map<string, EvidenceCollectionRequest>;
  private evidenceStore: Map<string, AnyEvidence>;
  private validators: Map<EvidenceArtifactType, EvidenceValidator>;

  constructor(config: Partial<EvidenceCollectionConfig> = {}) {
    this.config = { ...DEFAULT_EVIDENCE_CONFIG, ...config };
    this.activeCollections = new Map();
    this.evidenceStore = new Map();
    this.validators = this.initializeValidators();
  }

  /**
   * Collect evidence for a workflow stage
   */
  async collectForWorkflow(
    request: EvidenceCollectionRequest
  ): Promise<EvidenceCollectionResult> {
    const startTime = Date.now();
    this.activeCollections.set(request.id, request);

    try {
      const requiredEvidence: AnyEvidence[] = [];
      const optionalEvidence: AnyEvidence[] = [];
      const failed: Array<{ type: EvidenceArtifactType; error: string }> = [];

      // Collect required evidence
      for (const type of request.requiredTypes) {
        try {
          if (!this.config.enabledTools[type]) {
            throw new Error(`Tool '${type}' is disabled`);
          }

          const evidence = await this.collectEvidence(type, request);
          requiredEvidence.push(evidence);

          // Validate immediately if configured
          if (this.config.autoValidate) {
            await this.validateEvidence(evidence, request.criteria);
          }
        } catch (error) {
          failed.push({
            type,
            error: error instanceof Error ? error.message : 'Collection failed'
          });
        }
      }

      // Collect optional evidence
      if (this.config.parallelCollection) {
        const optionalPromises = request.optionalTypes.map(async (type) => {
          try {
            if (!this.config.enabledTools[type]) {
              return null;
            }
            return await this.collectEvidence(type, request);
          } catch (error) {
            return null;
          }
        });

        const optionalResults = await Promise.all(optionalPromises);
        optionalEvidence.push(...optionalResults.filter((e): e is AnyEvidence => e !== null));
      } else {
        for (const type of request.optionalTypes) {
          try {
            if (!this.config.enabledTools[type]) {
              continue;
            }
            const evidence = await this.collectEvidence(type, request);
            optionalEvidence.push(evidence);
          } catch (error) {
            // Optional evidence failures are not critical
          }
        }
      }

      // Calculate validation results
      const allEvidence = [...requiredEvidence, ...optionalEvidence];
      const validation = this.calculateValidation(allEvidence, request.criteria);

      // Store evidence
      allEvidence.forEach(evidence => {
        this.evidenceStore.set(evidence.id, evidence);
      });

      const duration = Date.now() - startTime;
      this.activeCollections.delete(request.id);

      return {
        requestId: request.id,
        success: requiredEvidence.length === request.requiredTypes.length,
        timestamp: new Date(),
        duration,
        evidence: {
          required: requiredEvidence,
          optional: optionalEvidence,
          failed
        },
        validation,
        summary: {
          totalCollected: allEvidence.length,
          totalRequired: request.requiredTypes.length,
          coverage: allEvidence.length / request.requiredTypes.length
        }
      };
    } catch (error) {
      this.activeCollections.delete(request.id);
      throw error;
    }
  }

  /**
   * Collect evidence for a Pull Request
   */
  async collectForPR(
    prContext: PREvidenceContext,
    agentType: AgentType,
    agentId: string,
    providerTier: ZenModelTier
  ): Promise<ComplianceReport> {
    const request: EvidenceCollectionRequest = {
      id: `pr-${prContext.prId}-${Date.now()}`,
      workflowId: prContext.prId,
      stage: 'pull_request',
      agentType,
      agentId,
      requiredTypes: prContext.requiredEvidence,
      optionalTypes: [],
      criteria: ['code_quality', 'test_coverage', 'security_check'],
      autoCollect: true,
      validateImmediately: true,
      timeout: this.config.defaultTimeout,
      sources: ['automated'],
      artifacts: prContext.changes.files,
      context: {
        prNumber: prContext.prNumber,
        repository: prContext.repository,
        branch: prContext.branch,
        baseBranch: prContext.baseBranch
      }
    };

    const result = await this.collectForWorkflow(request);

    // Generate compliance report
    return this.generateComplianceReport(
      prContext.prId,
      result,
      request.criteria
    );
  }

  /**
   * Validate evidence against criteria
   */
  async validateEvidence(
    evidence: AnyEvidence,
    criteria: string[]
  ): Promise<EvidenceValidationResult> {
    const validator = this.validators.get(evidence.type);
    
    if (!validator) {
      return {
        evidenceId: evidence.id,
        valid: false,
        score: 0,
        timestamp: new Date(),
        checks: criteria.map(c => ({
          criteria: c,
          passed: false,
          score: 0,
          message: `No validator available for evidence type '${evidence.type}'`
        })),
        issues: [{
          severity: 'error',
          message: `No validator available for evidence type '${evidence.type}'`
        }]
      };
    }

    return validator.validate(evidence, criteria);
  }

  /**
   * Get evidence by ID
   */
  getEvidence(id: string): AnyEvidence | undefined {
    return this.evidenceStore.get(id);
  }

  /**
   * Get all evidence for a workflow
   */
  getEvidenceForWorkflow(workflowId: string): AnyEvidence[] {
    return Array.from(this.evidenceStore.values())
      .filter(e => e.workflowId === workflowId);
  }

  /**
   * Get evidence by type
   */
  getEvidenceByType(type: EvidenceArtifactType): AnyEvidence[] {
    return Array.from(this.evidenceStore.values())
      .filter(e => e.type === type);
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(
    workflowId: string,
    collectionResult: EvidenceCollectionResult,
    criteria: string[]
  ): ComplianceReport {
    const allEvidence = [
      ...collectionResult.evidence.required,
      ...collectionResult.evidence.optional
    ];

    const criteriaResults = criteria.map(criterion => {
      const mappedTypes = this.config.criteriaMappings[criterion] || [];
      const relevantEvidence = allEvidence.filter(e => mappedTypes.includes(e.type));
      const scores = relevantEvidence.map(e => e.validationScore || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      let status: 'satisfied' | 'partial' | 'failed' | 'not_applicable' = 'failed';
      if (avgScore >= this.config.validationThreshold) {
        status = 'satisfied';
      } else if (avgScore > 0) {
        status = 'partial';
      }

      return {
        id: criterion,
        description: criterion,
        status,
        evidence: relevantEvidence.map(e => e.id),
        score: avgScore
      };
    });

    const satisfiedCount = criteriaResults.filter(c => c.status === 'satisfied').length;
    const partialCount = criteriaResults.filter(c => c.status === 'partial').length;
    const failedCount = criteriaResults.filter(c => c.status === 'failed').length;
    const overallScore = satisfiedCount / criteria.length;

    let status: 'compliant' | 'partial' | 'non_compliant' = 'non_compliant';
    if (overallScore >= this.config.validationThreshold) {
      status = 'compliant';
    } else if (overallScore > 0.5) {
      status = 'partial';
    }

    return {
      id: `compliance-${workflowId}-${Date.now()}`,
      workflowId,
      timestamp: new Date(),
      generatedBy: 'EvidenceCollector',
      summary: {
        totalCriteria: criteria.length,
        satisfiedCriteria: satisfiedCount,
        partialCriteria: partialCount,
        failedCriteria: failedCount,
        overallScore,
        status
      },
      criteria: criteriaResults,
      evidence: allEvidence,
      recommendations: this.generateRecommendations(criteriaResults)
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EvidenceCollectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): EvidenceCollectionConfig {
    return { ...this.config };
  }

  // Private methods

  private initializeValidators(): Map<EvidenceArtifactType, EvidenceValidator> {
    const validators = new Map<EvidenceArtifactType, EvidenceValidator>();

    // Test validator
    validators.set('test', {
      validate: (evidence, criteria) => {
        const testEvidence = evidence as TestEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'test_coverage' && testEvidence.testResults) {
            score = testEvidence.testResults.coverage / 100;
            passed = score >= this.config.validationThreshold;
          } else if (c === 'all_tests_pass' && testEvidence.testResults) {
            passed = testEvidence.testResults.failed === 0;
            score = passed ? 1 : 0;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Screenshot validator
    validators.set('screenshot', {
      validate: (evidence, criteria) => {
        const screenshotEvidence = evidence as ScreenshotEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'visual_regression' && screenshotEvidence.comparisonResults) {
            score = screenshotEvidence.comparisonResults.similarity;
            passed = screenshotEvidence.comparisonResults.passed;
          } else if (c === 'screenshots_captured') {
            passed = screenshotEvidence.screenshots.length > 0;
            score = passed ? 1 : 0;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Performance validator
    validators.set('performance', {
      validate: (evidence, criteria) => {
        const perfEvidence = evidence as PerformanceEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'core_web_vitals' && perfEvidence.metrics) {
            const lcp = perfEvidence.metrics.lcp || 0;
            const fid = perfEvidence.metrics.fid || 0;
            const cls = perfEvidence.metrics.cls || 0;
            
            passed = lcp < 2500 && fid < 100 && cls < 0.1;
            score = passed ? 1 : 0.5;
          } else if (c === 'performance_benchmarks') {
            passed = perfEvidence.benchmarks.every(b => b.passed);
            score = perfEvidence.benchmarks.filter(b => b.passed).length / perfEvidence.benchmarks.length;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Security validator
    validators.set('security', {
      validate: (evidence, criteria) => {
        const secEvidence = evidence as SecurityEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'no_critical_vulnerabilities' && secEvidence.scanResults) {
            const criticalCount = secEvidence.scanResults.vulnerabilities
              .filter(v => v.severity === 'critical').length;
            passed = criticalCount === 0;
            score = passed ? 1 : 0;
          } else if (c === 'security_scan_complete') {
            passed = secEvidence.scanResults.vulnerabilities !== undefined;
            score = passed ? 1 : 0;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Accessibility validator
    validators.set('accessibility', {
      validate: (evidence, criteria) => {
        const a11yEvidence = evidence as AccessibilityEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'accessibility_score' && a11yEvidence.auditResults) {
            score = a11yEvidence.auditResults.score / 100;
            passed = score >= this.config.validationThreshold;
          } else if (c === 'no_critical_violations') {
            const criticalCount = a11yEvidence.auditResults.violations
              .filter(v => v.impact === 'critical').length;
            passed = criticalCount === 0;
            score = passed ? 1 : 0.5;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Code quality validator
    validators.set('code_quality', {
      validate: (evidence, criteria) => {
        const qualityEvidence = evidence as CodeQualityEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'code_quality_score' && qualityEvidence.analysis) {
            score = qualityEvidence.analysis.maintainability / 100;
            passed = score >= this.config.validationThreshold;
          } else if (c === 'no_errors') {
            const errorCount = qualityEvidence.analysis.issues
              .filter(i => i.severity === 'error').length;
            passed = errorCount === 0;
            score = passed ? 1 : 0;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    // Coverage validator
    validators.set('coverage', {
      validate: (evidence, criteria) => {
        const coverageEvidence = evidence as CoverageEvidence;
        const checks = criteria.map(c => {
          let passed = false;
          let score = 0;

          if (c === 'coverage_threshold' && coverageEvidence.coverage) {
            score = coverageEvidence.coverage.overall / 100;
            passed = coverageEvidence.coverage.overall >= coverageEvidence.threshold;
          } else if (c === 'minimum_coverage') {
            passed = coverageEvidence.passed;
            score = coverageEvidence.coverage.overall / 100;
          }

          return { criteria: c, passed, score };
        });

        const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

        return {
          evidenceId: evidence.id,
          valid: avgScore >= this.config.validationThreshold,
          score: avgScore,
          timestamp: new Date(),
          checks,
          issues: []
        };
      }
    });

    return validators;
  }

  private async collectEvidence(
    type: EvidenceArtifactType,
    request: EvidenceCollectionRequest
  ): Promise<AnyEvidence> {
    const baseEvidence: Partial<EvidenceArtifact> = {
      id: `evidence-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'collecting',
      source: 'automated',
      agentType: request.agentType,
      agentId: request.agentId,
      providerTier: 'zen-medium', // Default tier
      timestamp: new Date(),
      title: `${type} Evidence`,
      description: `Automated ${type} evidence collection`,
      criteria: request.criteria,
      attachments: [],
      workflowId: request.workflowId,
      stage: request.stage,
      taskId: request.taskId,
      metadata: {
        collectionContext: request.context
      }
    };

    // Simulate evidence collection based on type
    // In real implementation, this would integrate with actual tools
    switch (type) {
      case 'test':
        return this.createTestEvidence(baseEvidence);
      case 'screenshot':
        return this.createScreenshotEvidence(baseEvidence);
      case 'performance':
        return this.createPerformanceEvidence(baseEvidence);
      case 'security':
        return this.createSecurityEvidence(baseEvidence);
      case 'accessibility':
        return this.createAccessibilityEvidence(baseEvidence);
      case 'code_quality':
        return this.createCodeQualityEvidence(baseEvidence);
      case 'coverage':
        return this.createCoverageEvidence(baseEvidence);
      default:
        throw new Error(`Evidence type '${type}' not implemented`);
    }
  }

  private createTestEvidence(base: Partial<EvidenceArtifact>): TestEvidence {
    return {
      ...base,
      type: 'test',
      status: 'collected',
      testResults: {
        total: 100,
        passed: 95,
        failed: 2,
        skipped: 3,
        duration: 15000,
        coverage: 85
      },
      testFiles: ['test/unit/component.test.ts', 'test/integration/api.test.ts'],
      testSuites: ['Unit Tests', 'Integration Tests'],
      failedTests: [
        { name: 'should handle error', error: 'Expected error to be thrown' },
        { name: 'should validate input', error: 'Validation failed' }
      ]
    } as TestEvidence;
  }

  private createScreenshotEvidence(base: Partial<EvidenceArtifact>): ScreenshotEvidence {
    return {
      ...base,
      type: 'screenshot',
      status: 'collected',
      screenshots: [
        {
          path: '/evidence/screenshots/desktop-home.png',
          viewport: { width: 1920, height: 1080 },
          device: 'Desktop Chrome',
          timestamp: new Date(),
          description: 'Homepage on desktop'
        },
        {
          path: '/evidence/screenshots/mobile-home.png',
          viewport: { width: 375, height: 812 },
          device: 'Mobile Safari',
          timestamp: new Date(),
          description: 'Homepage on mobile'
        }
      ],
      comparisonResults: {
        baseline: '/baseline/home.png',
        diff: '/evidence/diffs/home-diff.png',
        similarity: 0.98,
        passed: true
      }
    } as ScreenshotEvidence;
  }

  private createPerformanceEvidence(base: Partial<EvidenceArtifact>): PerformanceEvidence {
    return {
      ...base,
      type: 'performance',
      status: 'collected',
      metrics: {
        lcp: 1800,
        fid: 45,
        cls: 0.05,
        fcp: 900,
        tti: 2500,
        totalRequests: 45,
        totalSize: 1024000
      },
      benchmarks: [
        { metric: 'LCP', value: 1800, threshold: 2500, passed: true },
        { metric: 'FID', value: 45, threshold: 100, passed: true },
        { metric: 'CLS', value: 0.05, threshold: 0.1, passed: true }
      ],
      profile: '/evidence/profiles/profile.json'
    } as PerformanceEvidence;
  }

  private createSecurityEvidence(base: Partial<EvidenceArtifact>): SecurityEvidence {
    return {
      ...base,
      type: 'security',
      status: 'collected',
      scanResults: {
        vulnerabilities: [
          { severity: 'medium', title: 'Outdated dependency', description: 'Package needs update' }
        ],
        dependencyVulnerabilities: 1,
        codeVulnerabilities: 0,
        secretsFound: 0
      },
      scanTool: 'security-scanner',
      scanDuration: 5000
    } as SecurityEvidence;
  }

  private createAccessibilityEvidence(base: Partial<EvidenceArtifact>): AccessibilityEvidence {
    return {
      ...base,
      type: 'accessibility',
      status: 'collected',
      auditResults: {
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Elements must have sufficient color contrast',
            help: 'Ensure proper contrast ratios',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
            nodes: [{ target: ['.button-primary'], html: '<button class="button-primary">Click</button>' }]
          }
        ],
        passes: 50,
        incomplete: 2,
        score: 92
      },
      standard: 'WCAG2AA',
      auditTool: 'axe-core'
    } as AccessibilityEvidence;
  }

  private createCodeQualityEvidence(base: Partial<EvidenceArtifact>): CodeQualityEvidence {
    return {
      ...base,
      type: 'code_quality',
      status: 'collected',
      analysis: {
        issues: [
          { severity: 'warning', rule: 'complexity', message: 'Function too complex', file: 'src/utils.ts', line: 45, column: 10 }
        ],
        complexity: {
          average: 8,
          max: 25,
          files: [{ path: 'src/utils.ts', complexity: 25 }]
        },
        duplication: {
          percentage: 2.5,
          duplicates: []
        },
        maintainability: 85
      },
      tools: ['eslint', 'sonarqube']
    } as CodeQualityEvidence;
  }

  private createCoverageEvidence(base: Partial<EvidenceArtifact>): CoverageEvidence {
    return {
      ...base,
      type: 'coverage',
      status: 'collected',
      coverage: {
        statements: { total: 1000, covered: 850, percentage: 85 },
        branches: { total: 400, covered: 320, percentage: 80 },
        functions: { total: 100, covered: 90, percentage: 90 },
        lines: { total: 1000, covered: 850, percentage: 85 },
        overall: 85
      },
      uncoveredFiles: ['src/legacy.ts'],
      threshold: 80,
      passed: true
    } as CoverageEvidence;
  }

  private calculateValidation(
    evidence: AnyEvidence[],
    criteria: string[]
  ): { passed: boolean; score: number; missingCriteria: string[]; failedCriteria: string[] } {
    const satisfiedCriteria = new Set<string>();
    const failedCriteria: string[] = [];

    for (const criterion of criteria) {
      const mappedTypes = this.config.criteriaMappings[criterion] || [];
      const relevantEvidence = evidence.filter(e => mappedTypes.includes(e.type));
      
      if (relevantEvidence.length === 0) {
        failedCriteria.push(criterion);
        continue;
      }

      const avgScore = relevantEvidence.reduce((sum, e) => sum + (e.validationScore || 0), 0) 
        / relevantEvidence.length;
      
      if (avgScore >= this.config.validationThreshold) {
        satisfiedCriteria.add(criterion);
      } else {
        failedCriteria.push(criterion);
      }
    }

    const score = satisfiedCriteria.size / criteria.length;
    const missingCriteria = criteria.filter(c => !satisfiedCriteria.has(c) && !failedCriteria.includes(c));

    return {
      passed: score >= this.config.validationThreshold,
      score,
      missingCriteria,
      failedCriteria
    };
  }

  private generateRecommendations(
    criteriaResults: Array<{ id: string; status: string; score: number }>
  ): string[] {
    const recommendations: string[] = [];

    for (const result of criteriaResults) {
      if (result.status === 'failed') {
        recommendations.push(`Improve ${result.id} - currently failing with score ${(result.score * 100).toFixed(1)}%`);
      } else if (result.status === 'partial') {
        recommendations.push(`Strengthen ${result.id} - partially satisfied with score ${(result.score * 100).toFixed(1)}%`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All criteria satisfied - no immediate action required');
    }

    return recommendations;
  }
}

/**
 * Evidence Validator Interface
 */
interface EvidenceValidator {
  validate(evidence: AnyEvidence, criteria: string[]): Promise<EvidenceValidationResult>;
}

// Export singleton instance
export const evidenceCollector = new EvidenceCollector();
