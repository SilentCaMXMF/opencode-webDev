/**
 * Zen Model Configurations
 * Phase 3: Advanced Orchestration
 * 
 * Pre-configured zen model settings for different tiers
 */

import { ZenModelConfig, ZenCapabilities, ZenToolRestrictions, ZenPerformanceProfile } from '../types/zen-provider';

/**
 * Zen-Small Configuration
 * Lightweight model for simple tasks
 * - Quick responses
 * - Lower cost
 * - Limited context window
 */
export const ZEN_SMALL_CONFIG: ZenModelConfig = {
  tier: 'zen-small',
  name: 'opencode zen-small',
  version: '1.0.0',
  description: 'Lightweight model optimized for quick, simple tasks',
  
  capabilities: {
    // Code Generation
    codeGeneration: true,
    codeRefactoring: true,
    testGeneration: false,
    documentation: true,
    
    // Analysis
    codeReview: true,
    patternRecognition: false,
    architecturalReview: false,
    securityAnalysis: false,
    performanceAnalysis: false,
    
    // Context
    contextUnderstanding: true,
    multiFileAnalysis: false,
    largeContextWindow: false,
    
    // Tool Usage
    fileOperations: true,
    commandExecution: false,
    webSearch: false,
    codeSearch: true,
    
    // Specialized
    imageUnderstanding: false,
    naturalLanguageProcessing: true,
    reasoning: false
  },
  
  toolRestrictions: {
    canReadFiles: true,
    canWriteFiles: true,
    canDeleteFiles: false,
    allowedFileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.css', '.scss'],
    blockedFilePatterns: ['*.config.*', '*.env*', 'package-lock.json', 'yarn.lock'],
    
    canExecuteCommands: false,
    allowedCommands: [],
    blockedCommands: ['rm', 'del', 'format', 'fdisk', 'mkfs'],
    
    canAccessNetwork: false,
    allowedHosts: [],
    blockedHosts: [],
    
    canAccessEnvironment: false,
    allowedEnvironmentVars: [],
    
    toolTimeoutMs: 10000,
    maxConcurrentTools: 3
  },
  
  performanceProfile: {
    averageResponseTime: 500,
    maxContextTokens: 8192,
    maxOutputTokens: 2048,
    tokensPerSecond: 50,
    concurrentRequestLimit: 20,
    queueTimeoutMs: 60000
  },
  
  costPerToken: 0.0001,
  costPerRequest: 0.001
};

/**
 * Zen-Medium Configuration
 * Balanced model for most tasks
 * - Good performance/cost balance
 * - Moderate context window
 * - Broad capabilities
 */
export const ZEN_MEDIUM_CONFIG: ZenModelConfig = {
  tier: 'zen-medium',
  name: 'opencode zen-medium',
  version: '1.0.0',
  description: 'Balanced model for general-purpose development tasks',
  
  capabilities: {
    // Code Generation
    codeGeneration: true,
    codeRefactoring: true,
    testGeneration: true,
    documentation: true,
    
    // Analysis
    codeReview: true,
    patternRecognition: true,
    architecturalReview: true,
    securityAnalysis: true,
    performanceAnalysis: true,
    
    // Context
    contextUnderstanding: true,
    multiFileAnalysis: true,
    largeContextWindow: false,
    
    // Tool Usage
    fileOperations: true,
    commandExecution: true,
    webSearch: true,
    codeSearch: true,
    
    // Specialized
    imageUnderstanding: false,
    naturalLanguageProcessing: true,
    reasoning: true
  },
  
  toolRestrictions: {
    canReadFiles: true,
    canWriteFiles: true,
    canDeleteFiles: true,
    allowedFileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.css', '.scss', '.html', '.svg'],
    blockedFilePatterns: ['*.env*'],
    
    canExecuteCommands: true,
    allowedCommands: ['npm', 'yarn', 'npx', 'git', 'mkdir', 'touch', 'cat', 'echo', 'ls', 'cd'],
    blockedCommands: ['rm -rf /', 'del /', 'format', 'fdisk', 'mkfs', 'sudo', 'chmod 777'],
    
    canAccessNetwork: true,
    allowedHosts: ['npmjs.org', 'github.com', 'unpkg.com', 'jsdelivr.net', 'registry.npmjs.org'],
    blockedHosts: [],
    
    canAccessEnvironment: true,
    allowedEnvironmentVars: ['NODE_ENV', 'PATH', 'HOME', 'USER', 'PWD'],
    
    toolTimeoutMs: 30000,
    maxConcurrentTools: 5
  },
  
  performanceProfile: {
    averageResponseTime: 1500,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    tokensPerSecond: 30,
    concurrentRequestLimit: 10,
    queueTimeoutMs: 120000
  },
  
  costPerToken: 0.0003,
  costPerRequest: 0.005
};

/**
 * Zen-Large Configuration
 * High-capability model for complex tasks
 * - Best quality outputs
 * - Large context window
 * - Full feature set
 */
export const ZEN_LARGE_CONFIG: ZenModelConfig = {
  tier: 'zen-large',
  name: 'opencode zen-large',
  version: '1.0.0',
  description: 'High-capability model for complex architectural and analytical tasks',
  
  capabilities: {
    // Code Generation
    codeGeneration: true,
    codeRefactoring: true,
    testGeneration: true,
    documentation: true,
    
    // Analysis
    codeReview: true,
    patternRecognition: true,
    architecturalReview: true,
    securityAnalysis: true,
    performanceAnalysis: true,
    
    // Context
    contextUnderstanding: true,
    multiFileAnalysis: true,
    largeContextWindow: true,
    
    // Tool Usage
    fileOperations: true,
    commandExecution: true,
    webSearch: true,
    codeSearch: true,
    
    // Specialized
    imageUnderstanding: true,
    naturalLanguageProcessing: true,
    reasoning: true
  },
  
  toolRestrictions: {
    canReadFiles: true,
    canWriteFiles: true,
    canDeleteFiles: true,
    allowedFileExtensions: ['*'], // All file types
    blockedFilePatterns: ['*.env*', '*.key', '*.pem', '*.crt', '.ssh/*'],
    
    canExecuteCommands: true,
    allowedCommands: ['*'], // Most commands allowed with validation
    blockedCommands: ['sudo', 'su', 'passwd', 'useradd', 'usermod', 'mkfs', 'fdisk'],
    
    canAccessNetwork: true,
    allowedHosts: ['*'], // All hosts with validation
    blockedHosts: ['localhost:22', '127.0.0.1:22', '0.0.0.0:22'],
    
    canAccessEnvironment: true,
    allowedEnvironmentVars: ['*'], // Most environment variables
    
    toolTimeoutMs: 60000,
    maxConcurrentTools: 10
  },
  
  performanceProfile: {
    averageResponseTime: 3000,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    tokensPerSecond: 20,
    concurrentRequestLimit: 5,
    queueTimeoutMs: 300000
  },
  
  costPerToken: 0.001,
  costPerRequest: 0.02
};

/**
 * Zen-XLarge Configuration
 * Maximum capability model for enterprise tasks
 * - Unlimited context window
 * - Premium features
 * - Highest quality
 */
export const ZEN_XLARGE_CONFIG: ZenModelConfig = {
  tier: 'zen-xlarge',
  name: 'opencode zen-xlarge',
  version: '1.0.0',
  description: 'Maximum capability model for enterprise-scale projects',
  
  capabilities: {
    // Code Generation
    codeGeneration: true,
    codeRefactoring: true,
    testGeneration: true,
    documentation: true,
    
    // Analysis
    codeReview: true,
    patternRecognition: true,
    architecturalReview: true,
    securityAnalysis: true,
    performanceAnalysis: true,
    
    // Context
    contextUnderstanding: true,
    multiFileAnalysis: true,
    largeContextWindow: true,
    
    // Tool Usage
    fileOperations: true,
    commandExecution: true,
    webSearch: true,
    codeSearch: true,
    
    // Specialized
    imageUnderstanding: true,
    naturalLanguageProcessing: true,
    reasoning: true
  },
  
  toolRestrictions: {
    canReadFiles: true,
    canWriteFiles: true,
    canDeleteFiles: true,
    allowedFileExtensions: ['*'],
    blockedFilePatterns: ['*.env.local', '*.env.production'],
    
    canExecuteCommands: true,
    allowedCommands: ['*'],
    blockedCommands: [],
    
    canAccessNetwork: true,
    allowedHosts: ['*'],
    blockedHosts: [],
    
    canAccessEnvironment: true,
    allowedEnvironmentVars: ['*'],
    
    toolTimeoutMs: 120000,
    maxConcurrentTools: 15
  },
  
  performanceProfile: {
    averageResponseTime: 5000,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    tokensPerSecond: 15,
    concurrentRequestLimit: 3,
    queueTimeoutMs: 600000
  },
  
  costPerToken: 0.003,
  costPerRequest: 0.05
};

/**
 * Get configuration for a specific tier
 */
export function getZenConfig(tier: 'zen-small' | 'zen-medium' | 'zen-large' | 'zen-xlarge'): ZenModelConfig {
  switch (tier) {
    case 'zen-small':
      return { ...ZEN_SMALL_CONFIG };
    case 'zen-medium':
      return { ...ZEN_MEDIUM_CONFIG };
    case 'zen-large':
      return { ...ZEN_LARGE_CONFIG };
    case 'zen-xlarge':
      return { ...ZEN_XLARGE_CONFIG };
    default:
      throw new Error(`Unknown zen model tier: ${tier}`);
  }
}

/**
 * Get all available configurations
 */
export function getAllZenConfigs(): ZenModelConfig[] {
  return [
    { ...ZEN_SMALL_CONFIG },
    { ...ZEN_MEDIUM_CONFIG },
    { ...ZEN_LARGE_CONFIG },
    { ...ZEN_XLARGE_CONFIG }
  ];
}

/**
 * Get default configuration
 */
export function getDefaultZenConfig(): ZenModelConfig {
  return { ...ZEN_MEDIUM_CONFIG };
}
