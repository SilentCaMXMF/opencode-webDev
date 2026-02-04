"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextStatsSchema = exports.SearchResultSchema = exports.SearchQuerySchema = exports.SessionMemorySchema = exports.PatternSchema = exports.ADRSchema = exports.ContextEntrySchema = exports.AgentTypeSchema = exports.ContextTypeSchema = void 0;
const zod_1 = require("zod");
// Core Context Types
exports.ContextTypeSchema = zod_1.z.enum([
    'architectural_decision',
    'pattern',
    'session_memory',
    'agent_interaction',
    'code_knowledge',
    'project_context'
]);
// Agent Types (matching existing system)
exports.AgentTypeSchema = zod_1.z.enum([
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
// Core Context Entry
exports.ContextEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.ContextTypeSchema,
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    metadata: zod_1.z.object({
        createdAt: zod_1.z.date(),
        updatedAt: zod_1.z.date(),
        version: zod_1.z.number(),
        tags: zod_1.z.array(zod_1.z.string()),
        agents: zod_1.z.array(exports.AgentTypeSchema),
        priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        confidence: zod_1.z.number().min(0).max(1).default(0.5)
    }),
    relationships: zod_1.z.array(zod_1.z.object({
        targetId: zod_1.z.string(),
        type: zod_1.z.enum(['depends_on', 'relates_to', 'conflicts_with', 'builds_on']),
        strength: zod_1.z.number().min(0).max(1)
    })).default([])
});
// Architectural Decision Record (ADR)
exports.ADRSchema = exports.ContextEntrySchema.extend({
    type: zod_1.z.literal('architectural_decision'),
    content: zod_1.z.string(),
    decision: zod_1.z.object({
        problem: zod_1.z.string(),
        alternatives: zod_1.z.array(zod_1.z.string()),
        chosen: zod_1.z.string(),
        rationale: zod_1.z.string(),
        consequences: zod_1.z.array(zod_1.z.string()),
        status: zod_1.z.enum(['proposed', 'accepted', 'deprecated', 'superseded'])
    })
});
// Pattern Library Entry
exports.PatternSchema = exports.ContextEntrySchema.extend({
    type: zod_1.z.literal('pattern'),
    content: zod_1.z.string(),
    pattern: zod_1.z.object({
        category: zod_1.z.enum(['component', 'workflow', 'architecture', 'performance', 'security']),
        complexity: zod_1.z.enum(['simple', 'medium', 'complex']),
        reusability: zod_1.z.enum(['low', 'medium', 'high']),
        dependencies: zod_1.z.array(zod_1.z.string()),
        examples: zod_1.z.array(zod_1.z.string())
    })
});
// Session Memory
exports.SessionMemorySchema = exports.ContextEntrySchema.extend({
    type: zod_1.z.literal('session_memory'),
    session: zod_1.z.object({
        id: zod_1.z.string(),
        startTime: zod_1.z.date(),
        endTime: zod_1.z.date().optional(),
        agents: zod_1.z.array(exports.AgentTypeSchema),
        tasks: zod_1.z.array(zod_1.z.string()),
        outcomes: zod_1.z.array(zod_1.z.string())
    })
});
// Search Query Schema
exports.SearchQuerySchema = zod_1.z.object({
    query: zod_1.z.string(),
    types: zod_1.z.array(exports.ContextTypeSchema).optional(),
    agents: zod_1.z.array(exports.AgentTypeSchema).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    dateRange: zod_1.z.object({
        from: zod_1.z.date().optional(),
        to: zod_1.z.date().optional()
    }).optional(),
    limit: zod_1.z.number().min(1).max(100).default(20),
    offset: zod_1.z.number().min(0).default(0)
});
// Search Result
exports.SearchResultSchema = zod_1.z.object({
    entries: zod_1.z.array(exports.ContextEntrySchema),
    total: zod_1.z.number(),
    query: exports.SearchQuerySchema,
    executionTime: zod_1.z.number()
});
// Context Statistics
exports.ContextStatsSchema = zod_1.z.object({
    totalEntries: zod_1.z.number(),
    entriesByType: zod_1.z.record(zod_1.z.number()),
    entriesByAgent: zod_1.z.record(zod_1.z.number()),
    averageConfidence: zod_1.z.number(),
    lastUpdated: zod_1.z.date()
});
//# sourceMappingURL=index.js.map