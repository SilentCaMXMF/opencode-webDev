import { z } from 'zod';

// Core Context Types
export const ContextTypeSchema = z.enum([
  'architectural_decision',
  'pattern',
  'session_memory',
  'agent_interaction',
  'code_knowledge',
  'project_context'
]);

export type ContextType = z.infer<typeof ContextTypeSchema>;

// Agent Types (matching existing system)
export const AgentTypeSchema = z.enum([
  'ORCHESTRATOR',
  'DESIGN_SYSTEM', 
  'COMPONENT_DEVELOPER',
  'PERFORMANCE_OPTIMIZER',
  'ACCESSIBILITY',
  'CROSS_PLATFORM',
  'TESTING_QA',
  'SECURITY',
  'ANIMATION',
  'I18N',
  'UX_RESEARCH'
]);

export type AgentType = z.infer<typeof AgentTypeSchema>;

// Core Context Entry
export const ContextEntrySchema = z.object({
  id: z.string(),
  type: ContextTypeSchema,
  title: z.string(),
  content: z.string(),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    version: z.number(),
    tags: z.array(z.string()),
    agents: z.array(AgentTypeSchema),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    confidence: z.number().min(0).max(1).default(0.5)
  }),
  relationships: z.array(z.object({
    targetId: z.string(),
    type: z.enum(['depends_on', 'relates_to', 'conflicts_with', 'builds_on']),
    strength: z.number().min(0).max(1)
  })).default([])
});

export type ContextEntry = z.infer<typeof ContextEntrySchema>;

// Architectural Decision Record (ADR)
export const ADRSchema = ContextEntrySchema.extend({
  type: z.literal('architectural_decision'),
  content: z.string(),
  decision: z.object({
    problem: z.string(),
    alternatives: z.array(z.string()),
    chosen: z.string(),
    rationale: z.string(),
    consequences: z.array(z.string()),
    status: z.enum(['proposed', 'accepted', 'deprecated', 'superseded'])
  })
});

export type ADR = z.infer<typeof ADRSchema>;

// Pattern Library Entry
export const PatternSchema = ContextEntrySchema.extend({
  type: z.literal('pattern'),
  content: z.string(),
  pattern: z.object({
    category: z.enum(['component', 'workflow', 'architecture', 'performance', 'security']),
    complexity: z.enum(['simple', 'medium', 'complex']),
    reusability: z.enum(['low', 'medium', 'high']),
    dependencies: z.array(z.string()),
    examples: z.array(z.string())
  })
});

export type Pattern = z.infer<typeof PatternSchema>;

// Session Memory
export const SessionMemorySchema = ContextEntrySchema.extend({
  type: z.literal('session_memory'),
  session: z.object({
    id: z.string(),
    startTime: z.date(),
    endTime: z.date().optional(),
    agents: z.array(AgentTypeSchema),
    tasks: z.array(z.string()),
    outcomes: z.array(z.string())
  })
});

export type SessionMemory = z.infer<typeof SessionMemorySchema>;

// Search Query Schema
export const SearchQuerySchema = z.object({
  query: z.string(),
  types: z.array(ContextTypeSchema).optional(),
  agents: z.array(AgentTypeSchema).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Search Result
export const SearchResultSchema = z.object({
  entries: z.array(ContextEntrySchema),
  total: z.number(),
  query: SearchQuerySchema,
  executionTime: z.number()
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Context Statistics
export const ContextStatsSchema = z.object({
  totalEntries: z.number(),
  entriesByType: z.record(z.number()),
  entriesByAgent: z.record(z.number()),
  averageConfidence: z.number(),
  lastUpdated: z.date()
});

export type ContextStats = z.infer<typeof ContextStatsSchema>;

