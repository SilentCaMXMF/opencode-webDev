import { z } from 'zod';
import { AgentType, AgentStatus } from '../../../monitoring/types/monitoring';

// ============================================
// LAYER 1: AUTOMATIC HOOKS
// ============================================

export const HookTypeSchema = z.enum([
  'preTaskValidation',
  'contextVerification',
  'securityScan',
  'preHandoffValidation',
  'postTaskAudit'
]);

export type HookType = z.infer<typeof HookTypeSchema>;

export const HookStatusSchema = z.enum([
  'pending',
  'running',
  'passed',
  'failed',
  'skipped'
]);

export type HookStatus = z.infer<typeof HookStatusSchema>;

export const HookResultSchema = z.object({
  hookType: HookTypeSchema,
  status: HookStatusSchema,
  agent: z.string(), // AgentType as string
  timestamp: z.date(),
  executionTime: z.number(), // milliseconds
  message: z.string(),
  details: z.record(z.any()).optional(),
  blockers: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional()
});

export type HookResult = z.infer<typeof HookResultSchema>;

export const HookContextSchema = z.object({
  taskId: z.string(),
  agentType: z.string(), // AgentType as string
  workflowId: z.string(),
  stage: z.string(),
  timestamp: z.date(),
  context: z.record(z.any()),
  previousResults: z.array(HookResultSchema).optional()
});

export type HookContext = z.infer<typeof HookContextSchema>;

// Hook execution configuration
export interface HookConfig {
  enabled: boolean;
  timeoutMs: number;
  blocking: boolean; // If true, failure blocks task execution
  retries: number;
}

// Default hook configurations
export const DefaultHookConfigs: Record<HookType, HookConfig> = {
  preTaskValidation: { enabled: true, timeoutMs: 5000, blocking: true, retries: 1 },
  contextVerification: { enabled: true, timeoutMs: 3000, blocking: true, retries: 2 },
  securityScan: { enabled: true, timeoutMs: 10000, blocking: true, retries: 1 },
  preHandoffValidation: { enabled: true, timeoutMs: 5000, blocking: true, retries: 1 },
  postTaskAudit: { enabled: true, timeoutMs: 8000, blocking: false, retries: 1 }
};

// ============================================
// LAYER 2: USER COMMANDS
// ============================================

export const CommandTypeSchema = z.enum([
  'start-work',
  'handoff',
  'escalate',
  'validate',
  'complete',
  'research',
  'plan'
]);

export type CommandType = z.infer<typeof CommandTypeSchema>;

export const CommandStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'escalated'
]);

export type CommandStatus = z.infer<typeof CommandStatusSchema>;

export const CommandResultSchema = z.object({
  commandType: CommandTypeSchema,
  status: CommandStatusSchema,
  agent: z.string(),
  timestamp: z.date(),
  executionTime: z.number(),
  success: z.boolean(),
  message: z.string(),
  artifacts: z.array(z.string()).optional(),
  nextCommand: CommandTypeSchema.optional(),
  escalatedTo: z.string().optional(), // AgentType
  metadata: z.record(z.any()).optional()
});

export type CommandResult = z.infer<typeof CommandResultSchema>;

export interface CommandContext {
  workflowId: string;
  agentType: AgentType;
  initiatedBy: string;
  parameters: Record<string, any>;
  timestamp: Date;
  requiresApproval: boolean;
  authorityLevel: number; // 1-4
}

// ============================================
// LAYER 3: MODEL-INVOKED SKILLS
// ============================================

export const SkillTypeSchema = z.enum([
  'patternDiscovery',
  'architecturalReview',
  'complianceCheck',
  'contextGeneration',
  'evidenceCollection',
  'crossReferenceAnalysis',
  'bestPracticeEnforcement'
]);

export type SkillType = z.infer<typeof SkillTypeSchema>;

export const SkillTriggerSchema = z.enum([
  'automatic', // Triggered by model based on context
  'manual',    // Explicitly invoked
  'hook',      // Triggered by hook result
  'command'    // Triggered by command execution
]);

export type SkillTrigger = z.infer<typeof SkillTriggerSchema>;

export const SkillResultSchema = z.object({
  skillType: SkillTypeSchema,
  agent: z.string(),
  timestamp: z.date(),
  executionTime: z.number(),
  success: z.boolean(),
  findings: z.array(z.object({
    type: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
    message: z.string(),
    recommendation: z.string().optional(),
    confidence: z.number().min(0).max(1)
  })),
  artifacts: z.array(z.string()).optional(),
  contextUpdates: z.array(z.record(z.any())).optional()
});

export type SkillResult = z.infer<typeof SkillResultSchema>;

export interface SkillContext {
  workflowId: string;
  agentType: AgentType;
  trigger: SkillTrigger;
  triggerContext: Record<string, any>;
  previousResults: SkillResult[];
  timestamp: Date;
}

// Skill invocation patterns
export interface SkillInvocationPattern {
  skill: SkillType;
  trigger: SkillTrigger;
  conditions: string[]; // Natural language conditions for invocation
  priority: number; // 1-10, higher = more likely to be invoked
}

// Default skill invocation patterns
export const DefaultSkillPatterns: SkillInvocationPattern[] = [
  {
    skill: 'patternDiscovery',
    trigger: 'automatic',
    conditions: ['implementing similar functionality', 'designing new components', 'refactoring existing code'],
    priority: 8
  },
  {
    skill: 'architecturalReview',
    trigger: 'automatic',
    conditions: ['before significant implementation decisions', 'designing system architecture', 'making architectural changes'],
    priority: 9
  },
  {
    skill: 'complianceCheck',
    trigger: 'automatic',
    conditions: ['before task completion', 'during implementation', 'before quality gates'],
    priority: 10
  },
  {
    skill: 'contextGeneration',
    trigger: 'automatic',
    conditions: ['after significant decisions', 'completing major milestones', 'discovering new patterns'],
    priority: 7
  },
  {
    skill: 'evidenceCollection',
    trigger: 'command',
    conditions: ['during validate command', 'before quality gates', 'for compliance reporting'],
    priority: 8
  },
  {
    skill: 'crossReferenceAnalysis',
    trigger: 'automatic',
    conditions: ['during architectural decisions', 'identifying dependencies', 'planning integrations'],
    priority: 6
  },
  {
    skill: 'bestPracticeEnforcement',
    trigger: 'automatic',
    conditions: ['during code reviews', 'implementing features', 'refactoring code'],
    priority: 7
  }
];

// ============================================
// THREE-LAYER EXECUTION CONTEXT
// ============================================

export const ThreeLayerContextSchema = z.object({
  workflowId: z.string(),
  agentType: z.string(),
  timestamp: z.date(),
  
  // Layer 1: Hooks
  hooks: z.object({
    results: z.array(HookResultSchema),
    config: z.record(z.any()) // Hook configs
  }),
  
  // Layer 2: Commands
  commands: z.object({
    history: z.array(CommandResultSchema),
    current: CommandResultSchema.optional()
  }),
  
  // Layer 3: Skills
  skills: z.object({
    results: z.array(SkillResultSchema),
    invoked: z.array(SkillTypeSchema)
  }),
  
  // Execution state
  state: z.object({
    currentLayer: z.enum(['hooks', 'commands', 'skills']),
    status: z.enum(['idle', 'running', 'paused', 'completed', 'failed']),
    blockers: z.array(z.string()),
    pendingApprovals: z.array(z.string())
  })
});

export type ThreeLayerContext = z.infer<typeof ThreeLayerContextSchema>;

// ============================================
// ESCALATION AND AUTHORITY
// ============================================

export const AuthorityLevelSchema = z.enum([
  'level_1', // Self-resolution
  'level_2', // Escalate to role authority
  'level_3', // Escalate to Program Manager
  'level_4'  // Executive/human stakeholder
]);

export type AuthorityLevel = z.infer<typeof AuthorityLevelSchema>;

export const EscalationTargetSchema = z.enum([
  'system-architect',
  'frontend-specialist',
  'performance-engineer',
  'a11y-specialist',
  'platform-engineer',
  'quality-specialist',
  'security-specialist',
  'ux-motion-specialist',
  'globalization-specialist',
  'product-researcher',
  'program-manager',
  'human-stakeholder'
]);

export type EscalationTarget = z.infer<typeof EscalationTargetSchema>;

export const EscalationRequestSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  fromAgent: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  issue: z.string(),
  context: z.record(z.any()),
  suggestedTargets: z.array(EscalationTargetSchema),
  authorityLevel: AuthorityLevelSchema,
  blocking: z.boolean(), // If true, blocks current work
  resolved: z.boolean().default(false),
  resolution: z.object({
    by: z.string(),
    timestamp: z.date(),
    decision: z.string(),
    rationale: z.string()
  }).optional()
});

export type EscalationRequest = z.infer<typeof EscalationRequestSchema>;

// Escalation routing based on issue type
export const EscalationRoutingRules: Record<string, EscalationTarget[]> = {
  'architectural_conflict': ['system-architect', 'program-manager'],
  'performance_regression': ['performance-engineer', 'program-manager'],
  'accessibility_violation': ['a11y-specialist', 'program-manager'],
  'security_vulnerability': ['security-specialist', 'program-manager'],
  'quality_gate_failure': ['quality-specialist', 'program-manager'],
  'compatibility_issue': ['platform-engineer', 'program-manager'],
  'cultural_sensitivity': ['globalization-specialist', 'program-manager'],
  'ux_critical_issue': ['product-researcher', 'program-manager'],
  'resource_constraint': ['program-manager', 'human-stakeholder'],
  'timeline_conflict': ['program-manager', 'human-stakeholder'],
  'scope_change': ['program-manager', 'human-stakeholder']
};

// ============================================
// INTEGRATION WITH EXISTING SYSTEMS
// ============================================

// Integration with monitoring system
export interface MonitoringIntegration {
  agentType: AgentType;
  hookMetrics: {
    totalExecuted: number;
    passRate: number;
    avgExecutionTime: number;
    blockingFailures: number;
  };
  commandMetrics: {
    totalExecuted: number;
    successRate: number;
    avgExecutionTime: number;
    escalationsTriggered: number;
  };
  skillMetrics: {
    totalInvoked: number;
    successRate: number;
    avgExecutionTime: number;
    findingsGenerated: number;
  };
}

// Integration with context engineering system
export interface ContextEngineeringIntegration {
  contextId: string;
  hookResults: string[]; // Context entry IDs
  commandResults: string[];
  skillResults: string[];
  escalationHistory: string[];
  patternLibrary: string[];
}

// Export all types
export {
  AgentType,
  AgentStatus
};
