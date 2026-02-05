/**
 * Evidence System Tests
 * Phase 3: Advanced Orchestration
 * 
 * Tests for evidence-based delivery system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EvidenceCollector,
  evidenceCollector,
  DEFAULT_EVIDENCE_CONFIG,
  EvidenceArtifactType,
  EvidenceCollectionRequest,
  PREvidenceContext
} from '../src';

describe('EvidenceCollector', () => {
  let collector: EvidenceCollector;

  beforeEach(() => {
    collector = new EvidenceCollector();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = collector.getConfig();
      expect(config.storageType).toBe('database');
      expect(config.retentionDays).toBe(90);
      expect(config.autoValidate).toBe(true);
      expect(config.validationThreshold).toBe(0.8);
    });

    it('should update configuration', () => {
      collector.updateConfig({ retentionDays: 180, validationThreshold: 0.9 });
      const config = collector.getConfig();
      expect(config.retentionDays).toBe(180);
      expect(config.validationThreshold).toBe(0.9);
    });

    it('should accept custom configuration on initialization', () => {
      const customCollector = new EvidenceCollector({
        retentionDays: 30,
        parallelCollection: false,
        validationThreshold: 0.95
      });

      const config = customCollector.getConfig();
      expect(config.retentionDays).toBe(30);
      expect(config.parallelCollection).toBe(false);
      expect(config.validationThreshold).toBe(0.95);
    });
  });

  describe('Evidence Collection', () => {
    it('should collect test evidence', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-1',
        workflowId: 'workflow-1',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-001',
        requiredTypes: ['test'],
        optionalTypes: [],
        criteria: ['test_coverage', 'all_tests_pass'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: ['src/component.ts'],
        context: {}
      };

      const result = await collector.collectForWorkflow(request);
      
      expect(result.success).toBe(true);
      expect(result.evidence.required).toHaveLength(1);
      expect(result.evidence.required[0].type).toBe('test');
      expect(result.summary.totalCollected).toBe(1);
    });

    it('should collect multiple evidence types', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-2',
        workflowId: 'workflow-2',
        stage: 'validate',
        agentType: 'component-developer' as any,
        agentId: 'agent-002',
        requiredTypes: ['code_quality', 'test'],
        optionalTypes: ['coverage'],
        criteria: ['code_quality', 'test_coverage'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: ['src/component.ts'],
        context: {}
      };

      const result = await collector.collectForWorkflow(request);
      
      expect(result.success).toBe(true);
      expect(result.evidence.required).toHaveLength(2);
      expect(result.summary.totalCollected).toBeGreaterThanOrEqual(2);
    });

    it('should handle disabled tools gracefully', async () => {
      const customCollector = new EvidenceCollector({
        enabledTools: {
          test: true,
          screenshot: false,
          performance: false,
          security: false,
          accessibility: false,
          codeQuality: false,
          coverage: false
        }
      });

      const request: EvidenceCollectionRequest = {
        id: 'test-request-3',
        workflowId: 'workflow-3',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-003',
        requiredTypes: ['test'],
        optionalTypes: ['screenshot'], // Disabled
        criteria: ['test_coverage'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const result = await customCollector.collectForWorkflow(request);
      
      expect(result.success).toBe(true);
      expect(result.evidence.failed).toHaveLength(0); // Test is enabled
    });

    it('should fail when required evidence cannot be collected', async () => {
      const customCollector = new EvidenceCollector({
        enabledTools: {
          test: false, // Disabled
          screenshot: false,
          performance: false,
          security: false,
          accessibility: false,
          codeQuality: false,
          coverage: false
        }
      });

      const request: EvidenceCollectionRequest = {
        id: 'test-request-4',
        workflowId: 'workflow-4',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-004',
        requiredTypes: ['test'], // Required but disabled
        optionalTypes: [],
        criteria: ['test_coverage'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const result = await customCollector.collectForWorkflow(request);
      
      expect(result.success).toBe(false);
      expect(result.evidence.failed).toHaveLength(1);
      expect(result.evidence.failed[0].type).toBe('test');
    });
  });

  describe('PR Evidence Collection', () => {
    it('should collect evidence for PR', async () => {
      const prContext: PREvidenceContext = {
        prId: 'pr-123',
        prNumber: 123,
        repository: 'my-repo',
        branch: 'feature-branch',
        baseBranch: 'main',
        changes: {
          files: ['src/component.ts', 'test/component.test.ts'],
          additions: 100,
          deletions: 20
        },
        requiredEvidence: ['code_quality', 'test', 'security'],
        collectedEvidence: [],
        status: 'pending'
      };

      const result = await collector.collectForPR(
        prContext,
        'component-developer' as any,
        'agent-005',
        'zen-medium'
      );

      expect(result.workflowId).toBe('pr-123');
      expect(result.evidence).toHaveLength(3);
      expect(result.summary.totalCriteria).toBeGreaterThan(0);
    });
  });

  describe('Evidence Storage and Retrieval', () => {
    it('should store and retrieve evidence by ID', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-5',
        workflowId: 'workflow-5',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-006',
        requiredTypes: ['test'],
        optionalTypes: [],
        criteria: ['test_coverage'],
        autoCollect: true,
        validateImmediately: false,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const result = await collector.collectForWorkflow(request);
      const evidenceId = result.evidence.required[0].id;
      
      const retrieved = collector.getEvidence(evidenceId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(evidenceId);
      expect(retrieved?.type).toBe('test');
    });

    it('should retrieve evidence by workflow', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-6',
        workflowId: 'workflow-6',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-007',
        requiredTypes: ['test', 'coverage'],
        optionalTypes: [],
        criteria: ['test_coverage', 'minimum_coverage'],
        autoCollect: true,
        validateImmediately: false,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      await collector.collectForWorkflow(request);
      
      const evidence = collector.getEvidenceForWorkflow('workflow-6');
      expect(evidence).toHaveLength(2);
    });

    it('should retrieve evidence by type', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-7',
        workflowId: 'workflow-7',
        stage: 'validate',
        agentType: 'component-developer' as any,
        agentId: 'agent-008',
        requiredTypes: ['test', 'performance'],
        optionalTypes: [],
        criteria: ['test_coverage', 'performance_requirements'],
        autoCollect: true,
        validateImmediately: false,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      await collector.collectForWorkflow(request);
      
      const testEvidence = collector.getEvidenceByType('test');
      expect(testEvidence.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate evidence against criteria', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-8',
        workflowId: 'workflow-8',
        stage: 'testing',
        agentType: 'testing-qa' as any,
        agentId: 'agent-009',
        requiredTypes: ['test'],
        optionalTypes: [],
        criteria: ['test_coverage'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const result = await collector.collectForWorkflow(request);
      const evidence = result.evidence.required[0];
      
      const validation = await collector.validateEvidence(evidence, ['test_coverage']);
      expect(validation).toBeDefined();
      expect(validation.checks).toHaveLength(1);
    });
  });

  describe('Compliance Report', () => {
    it('should generate compliance report', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-9',
        workflowId: 'workflow-9',
        stage: 'validate',
        agentType: 'component-developer' as any,
        agentId: 'agent-010',
        requiredTypes: ['code_quality', 'test', 'security'],
        optionalTypes: [],
        criteria: ['code_quality', 'test_coverage', 'security_compliance'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const collectionResult = await collector.collectForWorkflow(request);
      
      const report = collector.generateComplianceReport(
        'workflow-9',
        collectionResult,
        request.criteria
      );

      expect(report.workflowId).toBe('workflow-9');
      expect(report.criteria).toHaveLength(3);
      expect(report.evidence).toHaveLength(3);
      expect(report.summary.totalCriteria).toBe(3);
      expect(report.recommendations).toBeDefined();
    });

    it('should include recommendations for failed criteria', async () => {
      const request: EvidenceCollectionRequest = {
        id: 'test-request-10',
        workflowId: 'workflow-10',
        stage: 'validate',
        agentType: 'component-developer' as any,
        agentId: 'agent-011',
        requiredTypes: [], // No evidence collected
        optionalTypes: [],
        criteria: ['code_quality', 'test_coverage'],
        autoCollect: true,
        validateImmediately: true,
        timeout: 300000,
        sources: ['automated'],
        artifacts: [],
        context: {}
      };

      const collectionResult = await collector.collectForWorkflow(request);
      
      const report = collector.generateComplianceReport(
        'workflow-10',
        collectionResult,
        request.criteria
      );

      expect(report.summary.failedCriteria).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });
});

describe('Default Configuration', () => {
  it('should have sensible defaults', () => {
    const config = DEFAULT_EVIDENCE_CONFIG;
    
    expect(config.storageType).toBe('database');
    expect(config.retentionDays).toBe(90);
    expect(config.parallelCollection).toBe(true);
    expect(config.maxConcurrentCollections).toBe(5);
    expect(config.defaultTimeout).toBe(300000);
    expect(config.retryAttempts).toBe(3);
    expect(config.autoValidate).toBe(true);
    expect(config.validationThreshold).toBe(0.8);
    expect(config.requireManualVerification).toBe(false);
  });

  it('should have all tools enabled by default', () => {
    const config = DEFAULT_EVIDENCE_CONFIG;
    
    expect(config.enabledTools.test).toBe(true);
    expect(config.enabledTools.screenshot).toBe(true);
    expect(config.enabledTools.performance).toBe(true);
    expect(config.enabledTools.security).toBe(true);
    expect(config.enabledTools.accessibility).toBe(true);
    expect(config.enabledTools.codeQuality).toBe(true);
    expect(config.enabledTools.coverage).toBe(true);
  });

  it('should have criteria mappings', () => {
    const config = DEFAULT_EVIDENCE_CONFIG;
    
    expect(config.criteriaMappings['functional_correctness']).toContain('test');
    expect(config.criteriaMappings['code_quality']).toContain('code_quality');
    expect(config.criteriaMappings['security_compliance']).toContain('security');
  });
});
