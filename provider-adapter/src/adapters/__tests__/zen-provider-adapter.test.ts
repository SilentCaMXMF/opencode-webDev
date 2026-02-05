/**
 * Provider Adapter Tests
 * Phase 3: Advanced Orchestration
 * 
 * Tests for zen model provider adapter compatibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ZenProviderAdapter,
  zenProviderAdapter,
  getZenConfig,
  getAllZenConfigs,
  getDefaultZenConfig,
  ZenModelTier,
  AdapterConfig
} from '../src';

describe('ZenProviderAdapter', () => {
  let adapter: ZenProviderAdapter;

  beforeEach(async () => {
    adapter = new ZenProviderAdapter();
    await adapter.initialize({
      defaultTier: 'zen-medium',
      fallbackTier: 'zen-small',
      requestTimeout: 30000,
      maxConcurrentRequests: 10,
      queueSize: 100,
      selectionStrategy: 'balanced',
      autoUpgradeThreshold: 0.1,
      migrationEnabled: true,
      migrationAutoRollback: true,
      migrationTimeout: 300000,
      metricsEnabled: true,
      metricsRetention: 90,
      eventLogging: true
    });
  });

  afterEach(async () => {
    await adapter.shutdown();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', async () => {
      const newAdapter = new ZenProviderAdapter();
      const result = await newAdapter.initialize({} as AdapterConfig);
      expect(result.success).toBe(true);
      await newAdapter.shutdown();
    });

    it('should register all zen model tiers', async () => {
      const providers = adapter.getProviders();
      expect(providers.success).toBe(true);
      expect(providers.data).toHaveLength(4); // small, medium, large, xlarge
    });

    it('should create provider instances for each tier', () => {
      const providers = adapter.getProviders();
      expect(providers.success).toBe(true);
      
      const tiers = providers.data?.map(p => p.tier);
      expect(tiers).toContain('zen-small');
      expect(tiers).toContain('zen-medium');
      expect(tiers).toContain('zen-large');
      expect(tiers).toContain('zen-xlarge');
    });
  });

  describe('Provider Management', () => {
    it('should get provider by ID', () => {
      const result = adapter.getProvider('zen-medium');
      expect(result.success).toBe(true);
      expect(result.data?.tier).toBe('zen-medium');
    });

    it('should return error for unknown provider', () => {
      const result = adapter.getProvider('unknown-provider');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PROVIDER_NOT_FOUND');
    });

    it('should adapt provider to standardized interface', () => {
      const providerResult = adapter.getProvider('zen-medium');
      expect(providerResult.success).toBe(true);
      
      const adaptedResult = adapter.adapt(providerResult.data!);
      expect(adaptedResult.success).toBe(true);
      expect(adaptedResult.data?.execute).toBeDefined();
      expect(adaptedResult.data?.checkCapability).toBeDefined();
    });
  });

  describe('Model Selection', () => {
    it('should select appropriate model based on criteria', () => {
      const result = adapter.selectModel('component-developer' as any, {
        taskComplexity: 'moderate',
        contextSize: 'medium',
        requiredCapabilities: ['codeGeneration', 'testGeneration'],
        maxLatency: 2000,
        priority: 'balanced'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error when no matching model found', () => {
      const result = adapter.selectModel('component-developer' as any, {
        taskComplexity: 'very_complex',
        contextSize: 'very_large',
        requiredCapabilities: ['nonexistentCapability' as any],
        maxLatency: 100,
        priority: 'speed'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NO_MATCHING_MODEL');
    });
  });

  describe('Model Assignment', () => {
    it('should assign model to agent', () => {
      const result = adapter.assignModel(
        'component-developer' as any,
        'agent-001',
        'zen-medium',
        {
          taskComplexity: 'moderate',
          contextSize: 'medium',
          requiredCapabilities: ['codeGeneration'],
          maxLatency: 2000,
          priority: 'balanced'
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.agentId).toBe('agent-001');
      expect(result.data?.tier).toBe('zen-medium');
    });

    it('should release model assignment', () => {
      const assignResult = adapter.assignModel(
        'component-developer' as any,
        'agent-002',
        'zen-small',
        {
          taskComplexity: 'simple',
          contextSize: 'small',
          requiredCapabilities: ['codeGeneration'],
          maxLatency: 1000,
          priority: 'speed'
        }
      );

      expect(assignResult.success).toBe(true);
      
      const releaseResult = adapter.releaseModel(assignResult.data!.id);
      expect(releaseResult.success).toBe(true);
    });

    it('should return error when releasing non-existent assignment', () => {
      const result = adapter.releaseModel('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ASSIGNMENT_NOT_FOUND');
    });
  });

  describe('Model Migration', () => {
    it('should migrate between providers', async () => {
      const result = await adapter.migrate('zen-small', 'zen-medium', {
        preserveContext: true,
        migrateArtifacts: true,
        dryRun: false,
        rollbackOnError: true,
        timeout: 300000
      });

      expect(result.success).toBe(true);
      expect(result.data?.fromTier).toBe('zen-small');
      expect(result.data?.toTier).toBe('zen-medium');
      expect(result.data?.status).toBe('completed');
    });

    it('should support dry run migration', async () => {
      const result = await adapter.migrate('zen-medium', 'zen-large', {
        preserveContext: true,
        migrateArtifacts: true,
        dryRun: true,
        rollbackOnError: true,
        timeout: 300000
      });

      expect(result.success).toBe(true);
    });

    it('should return error for non-existent provider', async () => {
      const result = await adapter.migrate('zen-medium', 'non-existent', {
        preserveContext: true,
        migrateArtifacts: true,
        dryRun: false,
        rollbackOnError: true,
        timeout: 300000
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PROVIDER_NOT_FOUND');
    });
  });

  describe('Metrics', () => {
    it('should return metrics for provider', () => {
      const result = adapter.getMetrics('zen-medium');
      expect(result.success).toBe(true);
      expect(result.data?.providerId).toBe('zen-medium');
    });

    it('should return empty metrics for unknown provider', () => {
      const result = adapter.getMetrics('unknown');
      expect(result.success).toBe(true);
      expect(result.data?.requestsTotal).toBe(0);
    });
  });

  describe('Events', () => {
    it('should emit events', (done) => {
      const unsubscribe = adapter.onEvent((event) => {
        expect(event).toBeDefined();
        expect(event.type).toBeDefined();
        expect(event.timestamp).toBeDefined();
        unsubscribe();
        done();
      });

      // Trigger an event by assigning a model
      adapter.assignModel(
        'component-developer' as any,
        'agent-003',
        'zen-small',
        {
          taskComplexity: 'simple',
          contextSize: 'small',
          requiredCapabilities: ['codeGeneration'],
          maxLatency: 1000,
          priority: 'speed'
        }
      );
    });
  });
});

describe('Zen Model Configurations', () => {
  it('should return configuration for each tier', () => {
    const small = getZenConfig('zen-small');
    const medium = getZenConfig('zen-medium');
    const large = getZenConfig('zen-large');
    const xlarge = getZenConfig('zen-xlarge');

    expect(small.tier).toBe('zen-small');
    expect(medium.tier).toBe('zen-medium');
    expect(large.tier).toBe('zen-large');
    expect(xlarge.tier).toBe('zen-xlarge');
  });

  it('should return all configurations', () => {
    const configs = getAllZenConfigs();
    expect(configs).toHaveLength(4);
  });

  it('should return default configuration', () => {
    const config = getDefaultZenConfig();
    expect(config.tier).toBe('zen-medium');
  });

  it('should have increasing capabilities by tier', () => {
    const small = getZenConfig('zen-small');
    const medium = getZenConfig('zen-medium');
    const large = getZenConfig('zen-large');

    // Medium should have more capabilities than small
    const smallCaps = Object.values(small.capabilities).filter(Boolean).length;
    const mediumCaps = Object.values(medium.capabilities).filter(Boolean).length;
    const largeCaps = Object.values(large.capabilities).filter(Boolean).length;

    expect(mediumCaps).toBeGreaterThanOrEqual(smallCaps);
    expect(largeCaps).toBeGreaterThanOrEqual(mediumCaps);
  });

  it('should have increasing context windows by tier', () => {
    const small = getZenConfig('zen-small');
    const medium = getZenConfig('zen-medium');
    const large = getZenConfig('zen-large');

    expect(medium.performanceProfile.maxContextTokens)
      .toBeGreaterThan(small.performanceProfile.maxContextTokens);
    expect(large.performanceProfile.maxContextTokens)
      .toBeGreaterThan(medium.performanceProfile.maxContextTokens);
  });
});

describe('Capability Matching', () => {
  let adapter: ZenProviderAdapter;

  beforeEach(async () => {
    adapter = new ZenProviderAdapter();
    await adapter.initialize({} as AdapterConfig);
  });

  afterEach(async () => {
    await adapter.shutdown();
  });

  it('should match capabilities correctly', () => {
    const result = adapter.selectModel('component-developer' as any, {
      taskComplexity: 'complex',
      contextSize: 'large',
      requiredCapabilities: [
        'codeGeneration',
        'testGeneration',
        'patternRecognition',
        'architecturalReview',
        'largeContextWindow'
      ],
      maxLatency: 5000,
      priority: 'quality'
    });

    expect(result.success).toBe(true);
    // Should select large or xlarge for complex tasks with all capabilities
    expect(['zen-large', 'zen-xlarge']).toContain(result.data?.tier);
  });

  it('should select small model for simple tasks', () => {
    const result = adapter.selectModel('component-developer' as any, {
      taskComplexity: 'simple',
      contextSize: 'small',
      requiredCapabilities: ['codeGeneration', 'documentation'],
      maxLatency: 1000,
      priority: 'speed'
    });

    expect(result.success).toBe(true);
    // Small model can handle simple code generation
    expect(result.data?.tier).toBe('zen-small');
  });
});
