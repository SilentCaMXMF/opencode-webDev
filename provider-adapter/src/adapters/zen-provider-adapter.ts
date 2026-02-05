/**
 * Zen Provider Adapter Implementation
 * Phase 3: Advanced Orchestration
 * 
 * Main adapter for opencode zen model providers
 */

import {
  ZenModelProvider,
  ZenModelConfig,
  ZenModelTier,
  ProviderAdapterResult,
  ModelSelectionCriteria,
  ModelAssignment,
  ProviderMigration,
  ProviderMetrics,
  ProviderEvent,
  ZenCapabilities,
  ProviderEventType
} from '../types/zen-provider';

import {
  ProviderAdapter,
  AdaptedProvider,
  AdapterConfig,
  MigrationOptions,
  ModelRegistry,
  CapabilityMatcher,
  AdapterState,
  ProviderTask,
  DEFAULT_ADAPTER_CONFIG
} from '../types/provider-adapter';

import { AgentType } from '../../monitoring/types/monitoring';
import { getZenConfig, getAllZenConfigs } from './zen-model-config';

/**
 * Zen Provider Adapter
 * Main implementation of the provider adapter interface
 */
export class ZenProviderAdapter implements ProviderAdapter {
  private config: AdapterConfig;
  private state: AdapterState;
  private modelRegistry: ModelRegistry;
  private capabilityMatcher: CapabilityMatcher;
  private initialized: boolean = false;

  constructor() {
    this.config = DEFAULT_ADAPTER_CONFIG;
    this.state = {
      initialized: false,
      providers: new Map(),
      assignments: new Map(),
      migrations: new Map(),
      metrics: new Map(),
      eventSubscribers: []
    };

    this.modelRegistry = this.createModelRegistry();
    this.capabilityMatcher = this.createCapabilityMatcher();
  }

  /**
   * Initialize the adapter
   */
  async initialize(config: AdapterConfig): Promise<ProviderAdapterResult<void>> {
    try {
      this.config = { ...this.config, ...config };
      
      // Register all zen model configurations
      const configs = getAllZenConfigs();
      configs.forEach(cfg => this.modelRegistry.register(cfg));

      // Create provider instances for each tier
      configs.forEach(cfg => {
        const provider = this.createProviderInstance(cfg);
        this.state.providers.set(provider.id, provider);
      });

      this.initialized = true;
      this.state.initialized = true;

      this.emitEvent({
        type: 'model_assigned',
        providerId: 'system',
        tier: 'zen-medium',
        timestamp: new Date(),
        data: { event: 'adapter_initialized', config: this.config }
      });

      return {
        success: true,
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INIT_ERROR',
          message: error instanceof Error ? error.message : 'Initialization failed',
          details: { error }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Get all available providers
   */
  getProviders(): ProviderAdapterResult<ZenModelProvider[]> {
    this.ensureInitialized();
    
    const providers = Array.from(this.state.providers.values());
    
    return {
      success: true,
      data: providers,
      metadata: {
        provider: 'zen-adapter',
        tier: 'zen-medium',
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Get a specific provider by ID
   */
  getProvider(id: string): ProviderAdapterResult<ZenModelProvider> {
    this.ensureInitialized();
    
    const provider = this.state.providers.get(id);
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: `Provider with ID '${id}' not found`,
          details: { availableProviders: Array.from(this.state.providers.keys()) }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    return {
      success: true,
      data: provider,
      metadata: {
        provider: 'zen-adapter',
        tier: provider.tier,
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Create a new provider instance
   */
  createProvider(config: ZenModelConfig): ProviderAdapterResult<ZenModelProvider> {
    this.ensureInitialized();
    
    try {
      const provider = this.createProviderInstance(config);
      this.state.providers.set(provider.id, provider);
      
      this.emitEvent({
        type: 'model_assigned',
        providerId: provider.id,
        tier: provider.tier,
        timestamp: new Date(),
        data: { event: 'provider_created', config }
      });

      return {
        success: true,
        data: provider,
        metadata: {
          provider: 'zen-adapter',
          tier: provider.tier,
          duration: 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create provider',
          details: { error }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: config.tier,
          duration: 0,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Adapt a provider to the standardized interface
   */
  adapt(provider: ZenModelProvider): ProviderAdapterResult<AdaptedProvider> {
    this.ensureInitialized();
    
    const adapted: AdaptedProvider = {
      id: provider.id,
      name: provider.name,
      tier: provider.tier,
      capabilities: provider.config.capabilities,
      
      execute: async <T>(task: ProviderTask): Promise<ProviderAdapterResult<T>> => {
        return this.executeTask<T>(provider.id, task);
      },
      
      checkCapability: (capability: keyof ZenCapabilities): boolean => {
        return provider.hasCapability(capability);
      },
      
      getStatus: () => ({
        status: provider.status,
        lastUsed: provider.lastUsed,
        errorRate: provider.errorRate
      })
    };

    return {
      success: true,
      data: adapted,
      metadata: {
        provider: provider.id,
        tier: provider.tier,
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Select the best model for a task
   */
  selectModel(
    agentType: AgentType,
    criteria: ModelSelectionCriteria
  ): ProviderAdapterResult<ZenModelProvider> {
    this.ensureInitialized();
    
    const allModels = this.modelRegistry.getAll();
    const ranked = this.capabilityMatcher.rankModels(allModels, criteria);
    
    if (ranked.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_MATCHING_MODEL',
          message: 'No model found matching the specified criteria',
          details: { criteria }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    const bestMatch = ranked[0];
    const providerId = `zen-${bestMatch.model.tier}`;
    const provider = this.state.providers.get(providerId);
    
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_NOT_AVAILABLE',
          message: `Best matching provider '${providerId}' is not available`,
          details: { ranked }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: bestMatch.model.tier,
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    return {
      success: true,
      data: provider,
      metadata: {
        provider: providerId,
        tier: bestMatch.model.tier,
        duration: 0,
        timestamp: new Date(),
        tokensUsed: 0
      }
    };
  }

  /**
   * Assign a model to an agent
   */
  assignModel(
    agentType: AgentType,
    agentId: string,
    providerId: string,
    criteria: ModelSelectionCriteria
  ): ProviderAdapterResult<ModelAssignment> {
    this.ensureInitialized();
    
    const provider = this.state.providers.get(providerId);
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: `Provider '${providerId}' not found`
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    const assignment: ModelAssignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentType,
      agentId,
      providerId,
      tier: provider.tier,
      taskType: criteria.requiredCapabilities.join(','),
      assignedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
      criteria
    };

    this.state.assignments.set(assignment.id, assignment);
    provider.lastUsed = new Date();

    this.emitEvent({
      type: 'model_assigned',
      providerId,
      tier: provider.tier,
      timestamp: new Date(),
      data: { assignment }
    });

    return {
      success: true,
      data: assignment,
      metadata: {
        provider: providerId,
        tier: provider.tier,
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Release a model assignment
   */
  releaseModel(assignmentId: string): ProviderAdapterResult<void> {
    this.ensureInitialized();
    
    const assignment = this.state.assignments.get(assignmentId);
    if (!assignment) {
      return {
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: `Assignment '${assignmentId}' not found`
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    this.state.assignments.delete(assignmentId);

    this.emitEvent({
      type: 'model_released',
      providerId: assignment.providerId,
      tier: assignment.tier,
      timestamp: new Date(),
      data: { assignment }
    });

    return {
      success: true,
      metadata: {
        provider: 'zen-adapter',
        tier: assignment.tier,
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Migrate between providers
   */
  async migrate(
    fromProviderId: string,
    toProviderId: string,
    options: MigrationOptions = {
      preserveContext: true,
      migrateArtifacts: true,
      dryRun: false,
      rollbackOnError: true,
      timeout: 300000
    }
  ): Promise<ProviderAdapterResult<ProviderMigration>> {
    this.ensureInitialized();
    
    const fromProvider = this.state.providers.get(fromProviderId);
    const toProvider = this.state.providers.get(toProviderId);

    if (!fromProvider || !toProvider) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: 'One or both providers not found',
          details: { fromProviderId, toProviderId }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    const migration: ProviderMigration = {
      id: `migration-${Date.now()}`,
      fromProvider: fromProviderId,
      fromTier: fromProvider.tier,
      toProvider: toProviderId,
      toTier: toProvider.tier,
      status: 'pending',
      startedAt: new Date(),
      contextTransferred: false,
      artifactsMigrated: []
    };

    this.state.migrations.set(migration.id, migration);

    try {
      migration.status = 'in_progress';
      
      // Simulate migration logic
      if (!options.dryRun) {
        // Transfer context
        if (options.preserveContext) {
          migration.contextTransferred = true;
        }
        
        // Migrate artifacts
        if (options.migrateArtifacts) {
          migration.artifactsMigrated = ['context', 'history', 'metrics'];
        }

        migration.status = 'completed';
        migration.completedAt = new Date();
      } else {
        migration.status = 'completed';
        migration.completedAt = new Date();
      }

      this.emitEvent({
        type: 'migration_completed',
        providerId: toProviderId,
        tier: toProvider.tier,
        timestamp: new Date(),
        data: { migration }
      });

      return {
        success: true,
        data: migration,
        metadata: {
          provider: 'zen-adapter',
          tier: toProvider.tier,
          duration: Date.now() - migration.startedAt.getTime(),
          timestamp: new Date()
        }
      };
    } catch (error) {
      migration.status = 'failed';
      migration.error = error instanceof Error ? error.message : 'Migration failed';

      if (options.rollbackOnError) {
        migration.status = 'rolled_back';
      }

      this.emitEvent({
        type: 'migration_failed',
        providerId: toProviderId,
        tier: toProvider.tier,
        timestamp: new Date(),
        data: { migration, error }
      });

      return {
        success: false,
        error: {
          code: 'MIGRATION_FAILED',
          message: migration.error,
          details: { migration }
        },
        metadata: {
          provider: 'zen-adapter',
          tier: toProvider.tier,
          duration: Date.now() - migration.startedAt.getTime(),
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Get metrics for a provider
   */
  getMetrics(providerId: string): ProviderAdapterResult<ProviderMetrics> {
    this.ensureInitialized();
    
    const metrics = this.state.metrics.get(providerId);
    if (!metrics) {
      // Return empty metrics
      const emptyMetrics: ProviderMetrics = {
        providerId,
        tier: 'zen-medium',
        timestamp: new Date(),
        requestsTotal: 0,
        requestsSuccess: 0,
        requestsFailed: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        tokensUsed: 0,
        tokensGenerated: 0,
        errorCount: 0,
        errorTypes: {},
        successRate: 100,
        userSatisfaction: 0
      };

      return {
        success: true,
        data: emptyMetrics,
        metadata: {
          provider: providerId,
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    return {
      success: true,
      data: metrics,
      metadata: {
        provider: providerId,
        tier: metrics.tier,
        duration: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Subscribe to provider events
   */
  onEvent(callback: (event: ProviderEvent) => void): () => void {
    this.state.eventSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.state.eventSubscribers.indexOf(callback);
      if (index > -1) {
        this.state.eventSubscribers.splice(index, 1);
      }
    };
  }

  /**
   * Shutdown the adapter
   */
  async shutdown(): Promise<ProviderAdapterResult<void>> {
    try {
      // Release all assignments
      for (const [id] of this.state.assignments) {
        await this.releaseModel(id);
      }

      // Clear all providers
      this.state.providers.clear();
      this.initialized = false;
      this.state.initialized = false;

      return {
        success: true,
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SHUTDOWN_ERROR',
          message: error instanceof Error ? error.message : 'Shutdown failed'
        },
        metadata: {
          provider: 'zen-adapter',
          tier: 'zen-medium',
          duration: 0,
          timestamp: new Date()
        }
      };
    }
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('ZenProviderAdapter not initialized. Call initialize() first.');
    }
  }

  private createProviderInstance(config: ZenModelConfig): ZenModelProvider {
    const id = `zen-${config.tier}`;
    
    return {
      id,
      name: config.name,
      tier: config.tier,
      config,
      status: 'active',
      lastUsed: new Date(),
      totalRequests: 0,
      errorRate: 0,
      
      hasCapability(capability: keyof ZenCapabilities): boolean {
        return config.capabilities[capability] ?? false;
      },
      
      canUseTool(tool: string): boolean {
        return config.toolRestrictions.allowedCommands.includes(tool) ||
               config.toolRestrictions.allowedCommands.includes('*');
      },
      
      checkPermission(action: string): boolean {
        // Implement permission checking logic
        return true;
      }
    };
  }

  private createModelRegistry(): ModelRegistry {
    const models = new Map<ZenModelTier, ZenModelConfig>();
    
    return {
      register(config: ZenModelConfig): void {
        models.set(config.tier, config);
      },
      
      unregister(tier: ZenModelTier): void {
        models.delete(tier);
      },
      
      get(tier: ZenModelTier): ZenModelConfig | undefined {
        return models.get(tier);
      },
      
      getAll(): ZenModelConfig[] {
        return Array.from(models.values());
      },
      
      findByCapability(capability: keyof ZenCapabilities): ZenModelConfig[] {
        return this.getAll().filter(m => m.capabilities[capability]);
      },
      
      findByCriteria(criteria: ModelSelectionCriteria): ZenModelConfig[] {
        return this.getAll().filter(m => 
          criteria.requiredCapabilities.every(cap => m.capabilities[cap])
        );
      },
      
      getLatestVersion(tier: ZenModelTier): string {
        return models.get(tier)?.version || '1.0.0';
      },
      
      isVersionSupported(tier: ZenModelTier, version: string): boolean {
        const model = models.get(tier);
        return model ? model.version === version : false;
      }
    };
  }

  private createCapabilityMatcher(): CapabilityMatcher {
    return {
      matches(
        modelCapabilities: ZenCapabilities,
        requiredCapabilities: (keyof ZenCapabilities)[]
      ): boolean {
        return requiredCapabilities.every(cap => modelCapabilities[cap]);
      },
      
      calculateScore(
        modelCapabilities: ZenCapabilities,
        criteria: ModelSelectionCriteria
      ): number {
        let score = 0;
        
        // Check required capabilities
        const requiredMet = criteria.requiredCapabilities.filter(
          cap => modelCapabilities[cap]
        ).length;
        score += (requiredMet / criteria.requiredCapabilities.length) * 0.6;
        
        // Check performance
        const perfProfile = getZenConfig('zen-medium').performanceProfile;
        if (criteria.maxLatency && perfProfile.averageResponseTime <= criteria.maxLatency) {
          score += 0.2;
        }
        
        // Check context size
        if (criteria.contextSize === 'large' && modelCapabilities.largeContextWindow) {
          score += 0.2;
        }
        
        return score;
      },
      
      rankModels(
        models: ZenModelConfig[],
        criteria: ModelSelectionCriteria
      ): Array<{ model: ZenModelConfig; score: number }> {
        return models
          .map(model => ({
            model,
            score: this.calculateScore(model.capabilities, criteria)
          }))
          .sort((a, b) => b.score - a.score);
      }
    };
  }

  private async executeTask<T>(
    providerId: string,
    task: ProviderTask
  ): Promise<ProviderAdapterResult<T>> {
    // Simulate task execution
    const startTime = Date.now();
    
    try {
      // This would integrate with the actual zen model API
      const result = {} as T;
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        metadata: {
          provider: providerId,
          tier: 'zen-medium',
          duration,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Task execution failed'
        },
        metadata: {
          provider: providerId,
          tier: 'zen-medium',
          duration: Date.now() - startTime,
          timestamp: new Date()
        }
      };
    }
  }

  private emitEvent(event: ProviderEvent): void {
    this.state.eventSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event subscriber:', error);
      }
    });
  }
}

// Export singleton instance
export const zenProviderAdapter = new ZenProviderAdapter();
