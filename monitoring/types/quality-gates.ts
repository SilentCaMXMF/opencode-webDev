/**
 * Quality Gate Configuration System
 * Phase 3: Advanced Orchestration
 * 
 * Per-project configurable quality gates
 */

import { EvidenceArtifactType } from '../evidence-system/src/types/evidence-artifact';
import { AgentType } from './monitoring';

/**
 * Quality Gate Criteria
 */
export interface QualityGateCriteria {
  id: string;
  name: string;
  description: string;
  
  // What evidence is required
  requiredEvidence: EvidenceArtifactType[];
  optionalEvidence: EvidenceArtifactType[];
  
  // Validation rules
  validationRules: Array<{
    type: 'threshold' | 'comparison' | 'custom';
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    weight: number; // 0-1, for scoring
  }>;
  
  // Pass conditions
  minScore: number; // 0-1
  requireAllEvidence: boolean;
  autoApproveThreshold: number; // 0-1
  
  // Timing
  timeout: number; // milliseconds
  retryAttempts: number;
}

/**
 * Quality Gate Stage
 */
export interface QualityGateStage {
  id: string;
  name: string;
  order: number; // Execution order
  
  // Criteria for this stage
  criteria: QualityGateCriteria[];
  
  // Stage behavior
  blocking: boolean; // If true, failure blocks workflow
  parallel: boolean; // If true, criteria run in parallel
  
  // Escalation
  autoEscalate: boolean;
  escalationThreshold: number; // Score below which to escalate
}

/**
 * Project Quality Gate Configuration
 */
export interface ProjectQualityGateConfig {
  projectId: string;
  projectName: string;
  version: string;
  
  // Stages
  stages: QualityGateStage[];
  
  // Global settings
  globalSettings: {
    enabled: boolean;
    strictMode: boolean; // If true, all gates must pass
    autoApprove: boolean;
    evidenceRequired: boolean;
    
    // Timing
    defaultTimeout: number;
    maxRetries: number;
    
    // Scoring
    minPassScore: number; // 0-1
    perfectScoreThreshold: number;
    
    // Notifications
    notifyOnFailure: boolean;
    notifyOnSuccess: boolean;
  };
  
  // Agent-specific overrides
  agentOverrides: Partial<Record<AgentType, {
    stages?: QualityGateStage[];
    settings?: Partial<ProjectQualityGateConfig['globalSettings']>;
  }>>;
  
  // Custom validators
  customValidators?: string[]; // Paths to custom validator modules
}

/**
 * Quality Gate Result
 */
export interface QualityGateResult {
  stageId: string;
  criteriaId: string;
  timestamp: Date;
  
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  score: number; // 0-1
  
  // Evidence
  evidence: string[]; // Evidence IDs
  evidenceScore: number;
  
  // Validation
  validations: Array<{
    rule: string;
    passed: boolean;
    score: number;
    message?: string;
  }>;
  
  // Auto-approval
  autoApproved: boolean;
  
  // Failure details
  failures?: Array<{
    rule: string;
    expected: number;
    actual: number;
    message: string;
  }>;
}

/**
 * Quality Gate Execution
 */
export interface QualityGateExecution {
  id: string;
  projectId: string;
  workflowId: string;
  agentType: AgentType;
  timestamp: Date;
  
  stages: Array<{
    stageId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    criteria: QualityGateResult[];
    stageScore: number;
    passed: boolean;
  }>;
  
  overallStatus: 'pending' | 'running' | 'passed' | 'failed' | 'blocked';
  overallScore: number;
  
  duration: number; // milliseconds
}

/**
 * Default Quality Gate Criteria
 */
export const DEFAULT_QUALITY_GATE_CRITERIA: QualityGateCriteria[] = [
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Ensures code meets quality standards',
    requiredEvidence: ['code_quality'],
    optionalEvidence: ['coverage'],
    validationRules: [
      { type: 'threshold', metric: 'maintainability', operator: '>=', value: 70, weight: 0.4 },
      { type: 'threshold', metric: 'no_errors', operator: '==', value: 1, weight: 0.3 },
      { type: 'threshold', metric: 'complexity', operator: '<=', value: 20, weight: 0.3 }
    ],
    minScore: 0.7,
    requireAllEvidence: true,
    autoApproveThreshold: 0.9,
    timeout: 120000,
    retryAttempts: 2
  },
  {
    id: 'test-coverage',
    name: 'Test Coverage',
    description: 'Ensures adequate test coverage',
    requiredEvidence: ['test', 'coverage'],
    optionalEvidence: [],
    validationRules: [
      { type: 'threshold', metric: 'coverage_overall', operator: '>=', value: 80, weight: 0.5 },
      { type: 'threshold', metric: 'tests_passed', operator: '==', value: 1, weight: 0.5 }
    ],
    minScore: 0.8,
    requireAllEvidence: true,
    autoApproveThreshold: 0.95,
    timeout: 300000,
    retryAttempts: 1
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    description: 'Ensures no security vulnerabilities',
    requiredEvidence: ['security'],
    optionalEvidence: [],
    validationRules: [
      { type: 'threshold', metric: 'critical_vulnerabilities', operator: '==', value: 0, weight: 0.6 },
      { type: 'threshold', metric: 'high_vulnerabilities', operator: '<=', value: 0, weight: 0.4 }
    ],
    minScore: 1.0, // Must pass completely
    requireAllEvidence: true,
    autoApproveThreshold: 1.0,
    timeout: 180000,
    retryAttempts: 1
  },
  {
    id: 'accessibility-check',
    name: 'Accessibility Check',
    description: 'Ensures accessibility compliance',
    requiredEvidence: ['accessibility'],
    optionalEvidence: [],
    validationRules: [
      { type: 'threshold', metric: 'accessibility_score', operator: '>=', value: 90, weight: 0.5 },
      { type: 'threshold', metric: 'critical_violations', operator: '==', value: 0, weight: 0.5 }
    ],
    minScore: 0.85,
    requireAllEvidence: true,
    autoApproveThreshold: 0.95,
    timeout: 120000,
    retryAttempts: 2
  },
  {
    id: 'performance-benchmark',
    name: 'Performance Benchmark',
    description: 'Ensures performance requirements are met',
    requiredEvidence: ['performance'],
    optionalEvidence: [],
    validationRules: [
      { type: 'threshold', metric: 'lcp', operator: '<=', value: 2500, weight: 0.3 },
      { type: 'threshold', metric: 'fid', operator: '<=', value: 100, weight: 0.3 },
      { type: 'threshold', metric: 'cls', operator: '<=', value: 0.1, weight: 0.4 }
    ],
    minScore: 0.8,
    requireAllEvidence: true,
    autoApproveThreshold: 0.9,
    timeout: 300000,
    retryAttempts: 2
  }
];

/**
 * Default Quality Gate Stages
 */
export const DEFAULT_QUALITY_GATE_STAGES: QualityGateStage[] = [
  {
    id: 'pre-check',
    name: 'Pre-Check',
    order: 1,
    criteria: [DEFAULT_QUALITY_GATE_CRITERIA[0]], // Code Quality
    blocking: true,
    parallel: true,
    autoEscalate: false,
    escalationThreshold: 0.5
  },
  {
    id: 'testing',
    name: 'Testing',
    order: 2,
    criteria: [DEFAULT_QUALITY_GATE_CRITERIA[1]], // Test Coverage
    blocking: true,
    parallel: false,
    autoEscalate: true,
    escalationThreshold: 0.6
  },
  {
    id: 'security',
    name: 'Security',
    order: 3,
    criteria: [DEFAULT_QUALITY_GATE_CRITERIA[2]], // Security Scan
    blocking: true,
    parallel: true,
    autoEscalate: true,
    escalationThreshold: 1.0
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    order: 4,
    criteria: [
      DEFAULT_QUALITY_GATE_CRITERIA[3], // Accessibility
      DEFAULT_QUALITY_GATE_CRITERIA[4]  // Performance
    ],
    blocking: false,
    parallel: true,
    autoEscalate: false,
    escalationThreshold: 0.7
  }
];

/**
 * Default Project Configuration
 */
export const DEFAULT_PROJECT_QUALITY_GATE_CONFIG: ProjectQualityGateConfig = {
  projectId: 'default',
  projectName: 'Default Project',
  version: '1.0.0',
  stages: DEFAULT_QUALITY_GATE_STAGES,
  globalSettings: {
    enabled: true,
    strictMode: false,
    autoApprove: true,
    evidenceRequired: true,
    defaultTimeout: 300000, // 5 minutes
    maxRetries: 3,
    minPassScore: 0.75,
    perfectScoreThreshold: 0.95,
    notifyOnFailure: true,
    notifyOnSuccess: false
  },
  agentOverrides: {
    'security': {
      settings: {
        strictMode: true,
        minPassScore: 1.0
      }
    },
    'accessibility': {
      stages: [
        {
          id: 'a11y-check',
          name: 'Accessibility Check',
          order: 1,
          criteria: [DEFAULT_QUALITY_GATE_CRITERIA[3]],
          blocking: true,
          parallel: false,
          autoEscalate: false,
          escalationThreshold: 0.9
        }
      ]
    }
  }
};

/**
 * Quality Gate Manager
 */
export class QualityGateManager {
  private configs: Map<string, ProjectQualityGateConfig> = new Map();
  private executions: Map<string, QualityGateExecution> = new Map();

  /**
   * Register a project configuration
   */
  registerProject(config: ProjectQualityGateConfig): void {
    this.configs.set(config.projectId, config);
  }

  /**
   * Get project configuration
   */
  getProjectConfig(projectId: string): ProjectQualityGateConfig {
    return this.configs.get(projectId) || DEFAULT_PROJECT_QUALITY_GATE_CONFIG;
  }

  /**
   * Update project configuration
   */
  updateProjectConfig(
    projectId: string, 
    updates: Partial<ProjectQualityGateConfig>
  ): void {
    const existing = this.getProjectConfig(projectId);
    this.configs.set(projectId, { ...existing, ...updates });
  }

  /**
   * Start quality gate execution
   */
  startExecution(
    projectId: string,
    workflowId: string,
    agentType: AgentType
  ): QualityGateExecution {
    const config = this.getProjectConfig(projectId);
    
    const execution: QualityGateExecution = {
      id: `execution-${Date.now()}`,
      projectId,
      workflowId,
      agentType,
      timestamp: new Date(),
      stages: config.stages.map(stage => ({
        stageId: stage.id,
        status: 'pending',
        criteria: [],
        stageScore: 0,
        passed: false
      })),
      overallStatus: 'pending',
      overallScore: 0,
      duration: 0
    };

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): QualityGateExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Validate project configuration
   */
  validateConfig(config: ProjectQualityGateConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!config.projectId) {
      errors.push('Project ID is required');
    }

    if (!config.stages || config.stages.length === 0) {
      errors.push('At least one stage is required');
    }

    // Validate stages
    config.stages.forEach((stage, index) => {
      if (!stage.id) {
        errors.push(`Stage ${index} is missing ID`);
      }
      if (!stage.criteria || stage.criteria.length === 0) {
        errors.push(`Stage '${stage.id}' has no criteria`);
      }

      // Check for duplicate stage orders
      const duplicateOrder = config.stages.filter(s => s.order === stage.order).length > 1;
      if (duplicateOrder) {
        warnings.push(`Stage '${stage.id}' has duplicate order ${stage.order}`);
      }
    });

    // Validate settings
    if (config.globalSettings.minPassScore < 0 || config.globalSettings.minPassScore > 1) {
      errors.push('minPassScore must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Export configuration to JSON
   */
  exportConfig(projectId: string): string {
    const config = this.getProjectConfig(projectId);
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(json: string): ProjectQualityGateConfig {
    const config = JSON.parse(json) as ProjectQualityGateConfig;
    const validation = this.validateConfig(config);
    
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    return config;
  }
}

// Export singleton instance
export const qualityGateManager = new QualityGateManager();
