/**
 * Zen Model Provider Types
 * Phase 3: Advanced Orchestration
 * 
 * Defines types and interfaces for opencode zen model providers
 * Supports multiple zen model variants: small, medium, large
 */

import { AgentType } from '../../monitoring/types/monitoring';

/**
 * Zen Model Tier
 * Different model sizes with varying capabilities
 */
export type ZenModelTier = 'zen-small' | 'zen-medium' | 'zen-large' | 'zen-xlarge';

/**
 * Zen Model Capabilities
 * Feature flags for what each model tier can do
 */
export interface ZenCapabilities {
  // Code Generation
  codeGeneration: boolean;
  codeRefactoring: boolean;
  testGeneration: boolean;
  documentation: boolean;
  
  // Analysis
  codeReview: boolean;
  patternRecognition: boolean;
  architecturalReview: boolean;
  securityAnalysis: boolean;
  performanceAnalysis: boolean;
  
  // Context
  contextUnderstanding: boolean;
  multiFileAnalysis: boolean;
  largeContextWindow: boolean;
  
  // Tool Usage
  fileOperations: boolean;
  commandExecution: boolean;
  webSearch: boolean;
  codeSearch: boolean;
  
  // Specialized
  imageUnderstanding: boolean;
  naturalLanguageProcessing: boolean;
  reasoning: boolean;
}

/**
 * Zen Model Tool Restrictions
 * Security and permission settings per model
 */
export interface ZenToolRestrictions {
  // File operations
  canReadFiles: boolean;
  canWriteFiles: boolean;
  canDeleteFiles: boolean;
  allowedFileExtensions: string[];
  blockedFilePatterns: string[];
  
  // Command execution
  canExecuteCommands: boolean;
  allowedCommands: string[];
  blockedCommands: string[];
  
  // Network access
  canAccessNetwork: boolean;
  allowedHosts: string[];
  blockedHosts: string[];
  
  // System access
  canAccessEnvironment: boolean;
  allowedEnvironmentVars: string[];
  
  // Tool timeouts
  toolTimeoutMs: number;
  maxConcurrentTools: number;
}

/**
 * Zen Model Performance Profile
 * Latency and throughput characteristics
 */
export interface ZenPerformanceProfile {
  averageResponseTime: number; // milliseconds
  maxContextTokens: number;
  maxOutputTokens: number;
  tokensPerSecond: number;
  concurrentRequestLimit: number;
  queueTimeoutMs: number;
}

/**
 * Zen Model Configuration
 * Complete configuration for a zen model tier
 */
export interface ZenModelConfig {
  tier: ZenModelTier;
  name: string;
  version: string;
  description: string;
  capabilities: ZenCapabilities;
  toolRestrictions: ZenToolRestrictions;
  performanceProfile: ZenPerformanceProfile;
  
  // Cost tracking (for future billing)
  costPerToken: number;
  costPerRequest: number;
}

/**
 * Zen Model Provider
 * Main interface for zen model integration
 */
export interface ZenModelProvider {
  id: string;
  name: string;
  tier: ZenModelTier;
  config: ZenModelConfig;
  
  // State
  status: 'active' | 'inactive' | 'error' | 'upgrading';
  lastUsed: Date;
  totalRequests: number;
  errorRate: number; // percentage
  
  // Capabilities check
  hasCapability(capability: keyof ZenCapabilities): boolean;
  canUseTool(tool: string): boolean;
  checkPermission(action: string): boolean;
}

/**
 * Provider Adapter Result
 * Standardized result from provider operations
 */
export interface ProviderAdapterResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    provider: string;
    tier: ZenModelTier;
    duration: number; // milliseconds
    timestamp: Date;
    tokensUsed?: number;
  };
}

/**
 * Model Selection Criteria
 * Criteria for automatically selecting appropriate model
 */
export interface ModelSelectionCriteria {
  taskComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  contextSize: 'small' | 'medium' | 'large' | 'very_large';
  requiredCapabilities: (keyof ZenCapabilities)[];
  maxLatency: number; // milliseconds
  priority: 'speed' | 'quality' | 'cost';
}

/**
 * Model Assignment
 * Assignment of a model to an agent/task
 */
export interface ModelAssignment {
  id: string;
  agentType: AgentType;
  agentId: string;
  providerId: string;
  tier: ZenModelTier;
  taskType: string;
  assignedAt: Date;
  expiresAt?: Date;
  criteria: ModelSelectionCriteria;
}

/**
 * Provider Migration
 * Migration between model versions or tiers
 */
export interface ProviderMigration {
  id: string;
  fromProvider: string;
  fromTier: ZenModelTier;
  toProvider: string;
  toTier: ZenModelTier;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
  contextTransferred: boolean;
  artifactsMigrated: string[];
  error?: string;
}

/**
 * Provider Metrics
 * Runtime metrics for provider monitoring
 */
export interface ProviderMetrics {
  providerId: string;
  tier: ZenModelTier;
  timestamp: Date;
  
  // Usage
  requestsTotal: number;
  requestsSuccess: number;
  requestsFailed: number;
  
  // Performance
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // Resources
  tokensUsed: number;
  tokensGenerated: number;
  
  // Errors
  errorCount: number;
  errorTypes: Record<string, number>;
  
  // Quality
  successRate: number;
  userSatisfaction: number; // if tracked
}

/**
 * Provider Event
 * Events emitted by the provider system
 */
export type ProviderEventType = 
  | 'model_assigned'
  | 'model_released'
  | 'capability_used'
  | 'tool_invoked'
  | 'migration_started'
  | 'migration_completed'
  | 'migration_failed'
  | 'error_occurred'
  | 'performance_threshold_exceeded';

export interface ProviderEvent {
  type: ProviderEventType;
  providerId: string;
  tier: ZenModelTier;
  timestamp: Date;
  data: Record<string, any>;
}
