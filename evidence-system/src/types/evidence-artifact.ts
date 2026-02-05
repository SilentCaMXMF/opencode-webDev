/**
 * Evidence Artifact Types
 * Phase 3: Advanced Orchestration - Evidence-Based Delivery System
 * 
 * Defines types for evidence artifacts and collection
 */

import { AgentType } from '../../monitoring/types/monitoring';
import { ZenModelTier } from '../../provider-adapter/src/types/zen-provider';

/**
 * Evidence Artifact Types
 */
export type EvidenceArtifactType = 
  | 'test'
  | 'screenshot'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'code_quality'
  | 'coverage'
  | 'documentation'
  | 'manual_verification';

/**
 * Evidence Status
 */
export type EvidenceStatus = 
  | 'pending'
  | 'collecting'
  | 'collected'
  | 'validated'
  | 'rejected'
  | 'expired';

/**
 * Evidence Source
 */
export type EvidenceSource = 
  | 'automated'
  | 'manual'
  | 'external'
  | 'hybrid';

/**
 * Base Evidence Artifact
 */
export interface EvidenceArtifact {
  id: string;
  type: EvidenceArtifactType;
  status: EvidenceStatus;
  source: EvidenceSource;
  
  // Metadata
  agentType: AgentType;
  agentId: string;
  providerTier: ZenModelTier;
  timestamp: Date;
  
  // Content
  title: string;
  description: string;
  url?: string; // Storage location
  content?: string; // For text-based evidence
  
  // Validation
  criteria: string[]; // Criteria this evidence satisfies
  validatedBy?: string;
  validatedAt?: Date;
  validationScore?: number; // 0-1
  
  // Artifacts
  attachments: string[]; // File paths or URLs
  
  // Context
  workflowId?: string;
  stage?: string;
  taskId?: string;
  
  // Expiration
  expiresAt?: Date;
  
  // Additional metadata
  metadata: Record<string, any>;
}

/**
 * Test Evidence
 */
export interface TestEvidence extends EvidenceArtifact {
  type: 'test';
  testResults: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    coverage: number;
  };
  testFiles: string[];
  testSuites: string[];
  failedTests: Array<{
    name: string;
    error: string;
    stack?: string;
  }>;
}

/**
 * Screenshot Evidence
 */
export interface ScreenshotEvidence extends EvidenceArtifact {
  type: 'screenshot';
  screenshots: Array<{
    path: string;
    viewport: { width: number; height: number };
    device: string;
    timestamp: Date;
    description: string;
  }>;
  comparisonResults?: {
    baseline: string;
    diff: string;
    similarity: number;
    passed: boolean;
  };
}

/**
 * Performance Evidence
 */
export interface PerformanceEvidence extends EvidenceArtifact {
  type: 'performance';
  metrics: {
    // Core Web Vitals
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    tti?: number;
    
    // Custom metrics
    ttfb?: number;
    fcp?: number;
    fmp?: number;
    
    // Resource metrics
    totalRequests?: number;
    totalSize?: number;
    
    // JavaScript metrics
    mainThreadTime?: number;
    jsExecutionTime?: number;
  };
  benchmarks: {
    metric: string;
    value: number;
    threshold: number;
    passed: boolean;
  }[];
  profile?: string; // Path to performance profile
}

/**
 * Security Evidence
 */
export interface SecurityEvidence extends EvidenceArtifact {
  type: 'security';
  scanResults: {
    vulnerabilities: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      title: string;
      description: string;
      file?: string;
      line?: number;
      cve?: string;
      remediation?: string;
    }>;
    dependencyVulnerabilities: number;
    codeVulnerabilities: number;
    secretsFound: number;
  };
  scanTool: string;
  scanDuration: number;
}

/**
 * Accessibility Evidence
 */
export interface AccessibilityEvidence extends EvidenceArtifact {
  type: 'accessibility';
  auditResults: {
    violations: Array<{
      id: string;
      impact: 'critical' | 'serious' | 'moderate' | 'minor';
      description: string;
      help: string;
      helpUrl: string;
      nodes: Array<{
        target: string[];
        html: string;
        failureSummary?: string;
      }>;
    }>;
    passes: number;
    incomplete: number;
    score: number; // 0-100
  };
  standard: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
  auditTool: string;
}

/**
 * Code Quality Evidence
 */
export interface CodeQualityEvidence extends EvidenceArtifact {
  type: 'code_quality';
  analysis: {
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      rule: string;
      message: string;
      file: string;
      line: number;
      column: number;
    }>;
    complexity: {
      average: number;
      max: number;
      files: Array<{
        path: string;
        complexity: number;
      }>;
    };
    duplication: {
      percentage: number;
      duplicates: Array<{
        lines: number;
        files: string[];
      }>;
    };
    maintainability: number; // 0-100
  };
  tools: string[];
}

/**
 * Coverage Evidence
 */
export interface CoverageEvidence extends EvidenceArtifact {
  type: 'coverage';
  coverage: {
    statements: { total: number; covered: number; percentage: number };
    branches: { total: number; covered: number; percentage: number };
    functions: { total: number; covered: number; percentage: number };
    lines: { total: number; covered: number; percentage: number };
    overall: number;
  };
  uncoveredFiles: string[];
  threshold: number;
  passed: boolean;
}

/**
 * Documentation Evidence
 */
export interface DocumentationEvidence extends EvidenceArtifact {
  type: 'documentation';
  documentation: {
    files: Array<{
      path: string;
      type: 'api' | 'guide' | 'readme' | 'changelog';
      completeness: number;
      lastUpdated: Date;
    }>;
    coverage: {
      api: number;
      guides: number;
      examples: number;
    };
    quality: number; // 0-100
  };
}

/**
 * Manual Verification Evidence
 */
export interface ManualVerificationEvidence extends EvidenceArtifact {
  type: 'manual_verification';
  verification: {
    verifiedBy: string;
    verifiedAt: Date;
    checkList: Array<{
      item: string;
      passed: boolean;
      notes?: string;
    }>;
    overallResult: 'passed' | 'failed' | 'partial';
    signOff?: {
      name: string;
      role: string;
      signature: string;
      date: Date;
    };
  };
}

/**
 * Union type for all evidence types
 */
export type AnyEvidence = 
  | TestEvidence 
  | ScreenshotEvidence 
  | PerformanceEvidence 
  | SecurityEvidence 
  | AccessibilityEvidence 
  | CodeQualityEvidence 
  | CoverageEvidence 
  | DocumentationEvidence 
  | ManualVerificationEvidence;

/**
 * Evidence Collection Request
 */
export interface EvidenceCollectionRequest {
  id: string;
  workflowId: string;
  stage: string;
  agentType: AgentType;
  agentId: string;
  
  // What to collect
  requiredTypes: EvidenceArtifactType[];
  optionalTypes: EvidenceArtifactType[];
  
  // Criteria to satisfy
  criteria: string[];
  
  // Configuration
  autoCollect: boolean;
  validateImmediately: boolean;
  timeout: number; // milliseconds
  
  // Sources
  sources: EvidenceSource[];
  
  // Context
  artifacts: string[];
  context: Record<string, any>;
}

/**
 * Evidence Collection Result
 */
export interface EvidenceCollectionResult {
  requestId: string;
  success: boolean;
  timestamp: Date;
  duration: number;
  
  evidence: {
    required: AnyEvidence[];
    optional: AnyEvidence[];
    failed: Array<{
      type: EvidenceArtifactType;
      error: string;
    }>;
  };
  
  validation: {
    passed: boolean;
    score: number;
    missingCriteria: string[];
    failedCriteria: string[];
  };
  
  summary: {
    totalCollected: number;
    totalRequired: number;
    coverage: number;
  };
}

/**
 * Evidence Validation Result
 */
export interface EvidenceValidationResult {
  evidenceId: string;
  valid: boolean;
  score: number;
  timestamp: Date;
  
  checks: Array<{
    criteria: string;
    passed: boolean;
    score: number;
    message?: string;
  }>;
  
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
  }>;
}

/**
 * Evidence Collection Configuration
 */
export interface EvidenceCollectionConfig {
  // Storage
  storageType: 'database' | 'filesystem' | 'hybrid';
  storagePath?: string;
  retentionDays: number;
  
  // Collection
  parallelCollection: boolean;
  maxConcurrentCollections: number;
  defaultTimeout: number;
  retryAttempts: number;
  
  // Validation
  autoValidate: boolean;
  validationThreshold: number;
  requireManualVerification: boolean;
  
  // Tools
  enabledTools: {
    test: boolean;
    screenshot: boolean;
    performance: boolean;
    security: boolean;
    accessibility: boolean;
    codeQuality: boolean;
    coverage: boolean;
  };
  
  // Criteria mapping
  criteriaMappings: Record<string, EvidenceArtifactType[]>;
}

/**
 * Compliance Report
 */
export interface ComplianceReport {
  id: string;
  workflowId: string;
  timestamp: Date;
  generatedBy: string;
  
  summary: {
    totalCriteria: number;
    satisfiedCriteria: number;
    partialCriteria: number;
    failedCriteria: number;
    overallScore: number;
    status: 'compliant' | 'partial' | 'non_compliant';
  };
  
  criteria: Array<{
    id: string;
    description: string;
    status: 'satisfied' | 'partial' | 'failed' | 'not_applicable';
    evidence: string[];
    score: number;
  }>;
  
  evidence: AnyEvidence[];
  
  recommendations: string[];
}

/**
 * Pull Request Evidence Context
 */
export interface PREvidenceContext {
  prId: string;
  prNumber: number;
  repository: string;
  branch: string;
  baseBranch: string;
  
  changes: {
    files: string[];
    additions: number;
    deletions: number;
  };
  
  requiredEvidence: EvidenceArtifactType[];
  collectedEvidence: AnyEvidence[];
  
  status: 'pending' | 'in_progress' | 'ready' | 'blocked';
}
