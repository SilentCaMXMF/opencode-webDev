/**
 * Provider Adapter Types
 * Phase 3: Advanced Orchestration
 * 
 * Defines the adapter pattern for zen model providers
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
  ZenCapabilities
} from './zen-provider';
import { AgentType } from '../../monitoring/types/monitoring';

/**
 * Provider Adapter Interface
 * Main adapter for zen model providers
 */
export interface ProviderAdapter {
  /**
   * Initialize the adapter with configuration
   */
  initialize(config: AdapterConfig): Promise<ProviderAdapterResult<void>>;
  
  /**
   * Get all available providers
   */
  getProviders(): ProviderAdapterResult<ZenModelProvider[]>;
  
  /**
   * Get a specific provider by ID
   */
  getProvider(id: string): ProviderAdapterResult<ZenModelProvider>;
  
  /**
   * Create a new provider instance
   */
  createProvider(config: ZenModelConfig): ProviderAdapterResult<ZenModelProvider>;
  
  /**
   * Adapt a provider to the standardized interface
   */
  adapt(provider: ZenModelProvider): ProviderAdapterResult<AdaptedProvider>;
  
  /**
   * Select the best model for a task based on criteria
   */
  selectModel(
    agentType: AgentType,
    criteria: ModelSelectionCriteria
  ): ProviderAdapterResult<ZenModelProvider>;
  
  /**
   * Assign a model to an agent for a specific task
   */
  assignModel(
    agentType: AgentType,
    agentId: string,
    providerId: string,
    criteria: ModelSelectionCriteria
  ): ProviderAdapterResult<ModelAssignment>;
  
  /**
   * Release a model assignment
   */
  releaseModel(assignmentId: string): ProviderAdapterResult<void>;
  
  /**
   * Migrate from one provider to another
   */
  migrate(
    fromProviderId: string,
    toProviderId: string,
    options?: MigrationOptions
  ): Promise<ProviderAdapterResult<ProviderMigration>>;
  
  /**
   * Get metrics for a provider
   */
  getMetrics(providerId: string): ProviderAdapterResult<ProviderMetrics>;
  
  /**
   * Subscribe to provider events
   */
  onEvent(callback: (event: ProviderEvent) => void): () => void;
  
  /**
   * Shutdown the adapter
   */
  shutdown(): Promise<ProviderAdapterResult<void>>;
}

/**
 * Adapted Provider
 * Standardized provider interface after adaptation
 */
export interface AdaptedProvider {
  id: string;
  name: string;
  tier: ZenModelTier;
  capabilities: ZenCapabilities;
  
  // Core methods
  execute<T = unknown>(
    task: ProviderTask
  ): Promise<ProviderAdapterResult<T>>;
  
  checkCapability(capability: keyof ZenCapabilities): boolean;
  
  getStatus(): {
    status: 'active' | 'inactive' | 'error' | 'upgrading';
    lastUsed: Date;
    errorRate: number;
  };
}

/**
 * Provider Task
 * Task to be executed by a provider
 */
export interface ProviderTask {
  id: string;
  type: string;
  agentType: AgentType;
  agentId: string;
  
  // Input
  prompt: string;
  context?: string[];
  attachments?: Array<{
    type: 'file' | 'image' | 'code' | 'url';
    content: string;
    metadata?: Record<string, any>;
  }>;
  
  // Configuration
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  
  // Expected outputs
  expectedOutput?: {
    format: 'text' | 'json' | 'code' | 'markdown';
    schema?: Record<string, any>;
  };
}

/**
 * Adapter Configuration
 */
export interface AdapterConfig {
  // Provider settings
  defaultTier: ZenModelTier;
  fallbackTier: ZenModelTier;
  
  // Performance settings
  requestTimeout: number;
  maxConcurrentRequests: number;
  queueSize: number;
  
  // Model selection
  selectionStrategy: 'performance' | 'cost' | 'balanced';
  autoUpgradeThreshold: number; // Error rate threshold for auto-upgrade
  
  // Migration settings
  migrationEnabled: boolean;
  migrationAutoRollback: boolean;
  migrationTimeout: number;
  
  // Monitoring
  metricsEnabled: boolean;
  metricsRetention: number; // days
  eventLogging: boolean;
}

/**
 * Migration Options
 */
export interface MigrationOptions {
  preserveContext: boolean;
  migrateArtifacts: boolean;
  dryRun: boolean;
  rollbackOnError: boolean;
  timeout: number;
  onProgress?: (progress: number) => void;
}

/**
 * Model Registry
 * Registry of available models and their configurations
 */
export interface ModelRegistry {
  // Registry operations
  register(config: ZenModelConfig): void;
  unregister(tier: ZenModelTier): void;
  get(tier: ZenModelTier): ZenModelConfig | undefined;
  getAll(): ZenModelConfig[];
  
  // Query operations
  findByCapability(capability: keyof ZenCapabilities): ZenModelConfig[];
  findByCriteria(criteria: ModelSelectionCriteria): ZenModelConfig[];
  
  // Version management
  getLatestVersion(tier: ZenModelTier): string;
  isVersionSupported(tier: ZenModelTier, version: string): boolean;
}

/**
 * Capability Matcher
 * Matches task requirements to model capabilities
 */
export interface CapabilityMatcher {
  /**
   * Check if a model meets task requirements
   */
  matches(
    modelCapabilities: ZenCapabilities,
    requiredCapabilities: (keyof ZenCapabilities)[]
  ): boolean;
  
  /**
   * Calculate match score (0-1)
   */
  calculateScore(
    modelCapabilities: ZenCapabilities,
    criteria: ModelSelectionCriteria
  ): number;
  
  /**
   * Rank models by suitability
   */
  rankModels(
    models: ZenModelConfig[],
    criteria: ModelSelectionCriteria
  ): Array<{ model: ZenModelConfig; score: number }>;
}

/**
 * Adapter State
 */
export interface AdapterState {
  initialized: boolean;
  providers: Map<string, ZenModelProvider>;
  assignments: Map<string, ModelAssignment>;
  migrations: Map<string, ProviderMigration>;
  metrics: Map<string, ProviderMetrics>;
  eventSubscribers: Array<(event: ProviderEvent) => void>;
}

/**
 * Default Adapter Configuration
 */
export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  defaultTier: 'zen-medium',
  fallbackTier: 'zen-small',
  requestTimeout: 30000,
  maxConcurrentRequests: 10,
  queueSize: 100,
  selectionStrategy: 'balanced',
  autoUpgradeThreshold: 0.1, // 10% error rate
  migrationEnabled: true,
  migrationAutoRollback: true,
  migrationTimeout: 300000, // 5 minutes
  metricsEnabled: true,
  metricsRetention: 90,
  eventLogging: true
};
