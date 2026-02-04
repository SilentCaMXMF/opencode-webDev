import { z } from 'zod';
import { AgentType, ContextEntry } from '../../../context-engineering/dist/types';

// Workflow stage definitions
export const WorkflowStageSchema = z.enum([
  'research',
  'plan', 
  'build',
  'validate',
  'complete',
  'handoff',
  'escalate'
]);

export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

// Workflow status definitions
export const WorkflowStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'escalated',
  'on_hold'
]);

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

// Priority levels
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export type Priority = z.infer<typeof PrioritySchema>;

// Evidence types for validation
export const EvidenceTypeSchema = z.enum([
  'code_review',
  'test_result',
  'performance_metric',
  'security_scan',
  'accessibility_audit',
  'user_feedback',
  'automated_check',
  'manual_verification'
]);

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

// Deviation tracking
export const DeviationSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  stage: WorkflowStageSchema,
  agent: AgentTypeSchema,
  expected: z.string(),
  actual: z.string(),
  severity: z.enum(['minor', 'major', 'critical']),
  justification: z.string().optional(),
  resolution: z.string().optional(),
  resolved: z.boolean().default(false)
});

export type Deviation = z.infer<typeof DeviationSchema>;

// Evidence collection
export const EvidenceSchema = z.object({
  id: z.string(),
  type: EvidenceTypeSchema,
  stage: WorkflowStageSchema,
  agent: AgentTypeSchema,
  data: z.record(z.any()),
  timestamp: z.date(),
  confidence: z.number().min(0).max(1),
  artifacts: z.array(z.string()).optional()
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// Quality gate definitions
export const QualityGateSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: WorkflowStageSchema,
  criteria: z.array(z.object({
    metric: z.string(),
    threshold: z.number(),
    operator: z.enum(['>', '<', '>=', '<=', '==']),
    weight: z.number().default(1)
  })),
  requiredEvidenceTypes: z.array(EvidenceTypeSchema),
  autoApprove: z.boolean().default(false),
  timeoutMs: z.number().default(300000) // 5 minutes default
});

export type QualityGate = z.infer<typeof QualityGateSchema>;

// Handoff protocol
export const HandoffSchema = z.object({
  id: z.string(),
  fromAgent: AgentTypeSchema,
  toAgent: AgentTypeSchema,
  context: z.array(z.string()), // Context entry IDs
  artifacts: z.array(z.string()),
  instructions: z.string(),
  timestamp: z.date(),
  acknowledged: z.boolean().default(false),
  accepted: z.boolean().optional()
});

export type Handoff = z.infer<typeof HandoffSchema>;

// Escalation protocol
export const EscalationSchema = z.object({
  id: z.string(),
  stage: WorkflowStageSchema,
  agent: AgentTypeSchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  issue: z.string(),
  context: z.array(z.string()),
  timestamp: z.date(),
  assignedTo: AgentTypeSchema.optional(),
  resolution: z.string().optional(),
  resolvedAt: z.date().optional()
});

export type Escalation = z.infer<typeof EscalationSchema>;

// Base workflow command
export const WorkflowCommandSchema = z.object({
  id: z.string(),
  command: z.string(),
  stage: WorkflowStageSchema,
  agent: AgentTypeSchema,
  timestamp: z.date(),
  parameters: z.record(z.any()),
  context: z.array(z.string()), // Context entry IDs
  status: WorkflowStatusSchema.default('pending'),
  priority: PrioritySchema.default('medium'),
  metadata: z.record(z.any()).optional()
});

export type WorkflowCommand = z.infer<typeof WorkflowCommandSchema>;

// Research command
export const ResearchCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.research'),
  parameters: z.object({
    query: z.string(),
    contextTypes: z.array(z.enum([
      'architectural_decision', 
      'pattern', 
      'session_memory', 
      'agent_interaction', 
      'code_knowledge', 
      'project_context'
    ])).optional(),
    agentFilter: z.array(AgentTypeSchema).optional(),
    maxResults: z.number().default(20),
    includeEvidence: z.boolean().default(true)
  })
});

export type ResearchCommand = z.infer<typeof ResearchCommandSchema>;

// Plan command
export const PlanCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.plan'),
  parameters: z.object({
    requirements: z.array(z.string()),
    constraints: z.array(z.string()).optional(),
    deliverables: z.array(z.string()),
    timeline: z.object({
      start: z.date(),
      end: z.date(),
      milestones: z.array(z.object({
        name: z.string(),
        date: z.date(),
        deliverables: z.array(z.string())
      }))
    }),
    resources: z.array(z.object({
      type: z.string(),
      description: z.string(),
      quantity: z.number()
    })).optional()
  })
});

export type PlanCommand = z.infer<typeof PlanCommandSchema>;

// Build command
export const BuildCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.build'),
  parameters: z.object({
    specifications: z.array(z.string()), // Plan IDs or references
    artifacts: z.array(z.object({
      type: z.enum(['component', 'module', 'page', 'service', 'utility']),
      name: z.string(),
      path: z.string(),
      dependencies: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional()
    })),
    trackDeviations: z.boolean().default(true),
    checkpointInterval: z.number().default(300000) // 5 minutes
  })
});

export type BuildCommand = z.infer<typeof BuildCommandSchema>;

// Validate command
export const ValidateCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.validate'),
  parameters: z.object({
    targetArtifacts: z.array(z.string()),
    validationTypes: z.array(z.enum([
      'functional',
      'performance',
      'security',
      'accessibility',
      'compatibility',
      'code_quality'
    ])),
    evidenceRequired: z.boolean().default(true),
    autoApproveThreshold: z.number().default(0.9),
    qualityGates: z.array(z.string()) // Quality gate IDs
  })
});

export type ValidateCommand = z.infer<typeof ValidateCommandSchema>;

// Complete command
export const CompleteCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.complete'),
  parameters: z.object({
    artifacts: z.array(z.string()),
    summary: z.string(),
    outcomes: z.array(z.string()),
    nextSteps: z.array(z.string()).optional(),
    cleanup: z.boolean().default(true),
    archive: z.boolean().default(true)
  })
});

export type CompleteCommand = z.infer<typeof CompleteCommandSchema>;

// Handoff command
export const HandoffCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.handoff'),
  parameters: z.object({
    toAgent: AgentTypeSchema,
    artifacts: z.array(z.string()),
    context: z.array(z.string()),
    instructions: z.string(),
    priority: PrioritySchema.default('medium'),
    expectedDuration: z.number().optional() // in minutes
  })
});

export type HandoffCommand = z.infer<typeof HandoffCommandSchema>;

// Escalate command
export const EscalateCommandSchema = WorkflowCommandSchema.extend({
  command: z.literal('workflow.escalate'),
  parameters: z.object({
    issue: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    context: z.array(z.string()),
    escalateTo: AgentTypeSchema.optional(),
    blockWorkflow: z.boolean().default(false),
    suggestedResolution: z.string().optional()
  })
});

export type EscalateCommand = z.infer<typeof EscalateCommandSchema>;

// Union of all command types
export const AnyWorkflowCommandSchema = z.discriminatedUnion('command', [
  ResearchCommandSchema,
  PlanCommandSchema,
  BuildCommandSchema,
  ValidateCommandSchema,
  CompleteCommandSchema,
  HandoffCommandSchema,
  EscalateCommandSchema
]);

export type AnyWorkflowCommand = z.infer<typeof AnyWorkflowCommandSchema>;

// Workflow execution context
export const WorkflowContextSchema = z.object({
  workflowId: z.string(),
  currentStage: WorkflowStageSchema,
  status: WorkflowStatusSchema,
  startedAt: z.date(),
  updatedAt: z.date(),
  agent: AgentTypeSchema,
  commands: z.array(WorkflowCommandSchema),
  deviations: z.array(DeviationSchema),
  evidence: z.array(EvidenceSchema),
  qualityGates: z.array(QualityGateSchema),
  handoffs: z.array(HandoffSchema),
  escalations: z.array(EscalationSchema),
  metadata: z.record(z.any()).optional()
});

export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;

// Command result
export const CommandResultSchema = z.object({
  commandId: z.string(),
  success: z.boolean(),
  stage: WorkflowStageSchema,
  agent: AgentTypeSchema,
  timestamp: z.date(),
  executionTime: z.number(),
  result: z.any(),
  deviations: z.array(DeviationSchema),
  evidence: z.array(EvidenceSchema),
  nextStage: WorkflowStageSchema.optional(),
  qualityGateStatus: z.enum(['passed', 'failed', 'pending']).optional(),
  message: z.string().optional(),
  artifacts: z.array(z.string()).optional()
});

export type CommandResult = z.infer<typeof CommandResultSchema>;

// Export all agent types from context system
export { AgentTypeSchema, AgentType, ContextEntry };