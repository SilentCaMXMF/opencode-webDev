import { z } from 'zod';
export declare const ContextTypeSchema: z.ZodEnum<["architectural_decision", "pattern", "session_memory", "agent_interaction", "code_knowledge", "project_context"]>;
export type ContextType = z.infer<typeof ContextTypeSchema>;
export declare const AgentTypeSchema: z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>;
export type AgentType = z.infer<typeof AgentTypeSchema>;
export declare const ContextEntrySchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["architectural_decision", "pattern", "session_memory", "agent_interaction", "code_knowledge", "project_context"]>;
    title: z.ZodString;
    content: z.ZodString;
    metadata: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodNumber;
        tags: z.ZodArray<z.ZodString, "many">;
        agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        confidence: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    }, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    }>;
    relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        type: z.ZodEnum<["depends_on", "relates_to", "conflicts_with", "builds_on"]>;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    };
    relationships: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[];
}, {
    type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    };
    relationships?: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[] | undefined;
}>;
export type ContextEntry = z.infer<typeof ContextEntrySchema>;
export declare const ADRSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    metadata: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodNumber;
        tags: z.ZodArray<z.ZodString, "many">;
        agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        confidence: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    }, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    }>;
    relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        type: z.ZodEnum<["depends_on", "relates_to", "conflicts_with", "builds_on"]>;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"architectural_decision">;
    content: z.ZodString;
    decision: z.ZodObject<{
        problem: z.ZodString;
        alternatives: z.ZodArray<z.ZodString, "many">;
        chosen: z.ZodString;
        rationale: z.ZodString;
        consequences: z.ZodArray<z.ZodString, "many">;
        status: z.ZodEnum<["proposed", "accepted", "deprecated", "superseded"]>;
    }, "strip", z.ZodTypeAny, {
        status: "proposed" | "accepted" | "deprecated" | "superseded";
        problem: string;
        alternatives: string[];
        chosen: string;
        rationale: string;
        consequences: string[];
    }, {
        status: "proposed" | "accepted" | "deprecated" | "superseded";
        problem: string;
        alternatives: string[];
        chosen: string;
        rationale: string;
        consequences: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    type: "architectural_decision";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    };
    relationships: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[];
    decision: {
        status: "proposed" | "accepted" | "deprecated" | "superseded";
        problem: string;
        alternatives: string[];
        chosen: string;
        rationale: string;
        consequences: string[];
    };
}, {
    type: "architectural_decision";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    };
    decision: {
        status: "proposed" | "accepted" | "deprecated" | "superseded";
        problem: string;
        alternatives: string[];
        chosen: string;
        rationale: string;
        consequences: string[];
    };
    relationships?: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[] | undefined;
}>;
export type ADR = z.infer<typeof ADRSchema>;
export declare const PatternSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    metadata: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodNumber;
        tags: z.ZodArray<z.ZodString, "many">;
        agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        confidence: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    }, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    }>;
    relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        type: z.ZodEnum<["depends_on", "relates_to", "conflicts_with", "builds_on"]>;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"pattern">;
    content: z.ZodString;
    pattern: z.ZodObject<{
        category: z.ZodEnum<["component", "workflow", "architecture", "performance", "security"]>;
        complexity: z.ZodEnum<["simple", "medium", "complex"]>;
        reusability: z.ZodEnum<["low", "medium", "high"]>;
        dependencies: z.ZodArray<z.ZodString, "many">;
        examples: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        category: "component" | "workflow" | "architecture" | "performance" | "security";
        complexity: "medium" | "simple" | "complex";
        reusability: "low" | "medium" | "high";
        dependencies: string[];
        examples: string[];
    }, {
        category: "component" | "workflow" | "architecture" | "performance" | "security";
        complexity: "medium" | "simple" | "complex";
        reusability: "low" | "medium" | "high";
        dependencies: string[];
        examples: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    pattern: {
        category: "component" | "workflow" | "architecture" | "performance" | "security";
        complexity: "medium" | "simple" | "complex";
        reusability: "low" | "medium" | "high";
        dependencies: string[];
        examples: string[];
    };
    type: "pattern";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    };
    relationships: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[];
}, {
    pattern: {
        category: "component" | "workflow" | "architecture" | "performance" | "security";
        complexity: "medium" | "simple" | "complex";
        reusability: "low" | "medium" | "high";
        dependencies: string[];
        examples: string[];
    };
    type: "pattern";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    };
    relationships?: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[] | undefined;
}>;
export type Pattern = z.infer<typeof PatternSchema>;
export declare const SessionMemorySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    metadata: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodNumber;
        tags: z.ZodArray<z.ZodString, "many">;
        agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        confidence: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    }, {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    }>;
    relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        type: z.ZodEnum<["depends_on", "relates_to", "conflicts_with", "builds_on"]>;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }, {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"session_memory">;
    session: z.ZodObject<{
        id: z.ZodString;
        startTime: z.ZodDate;
        endTime: z.ZodOptional<z.ZodDate>;
        agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
        tasks: z.ZodArray<z.ZodString, "many">;
        outcomes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        startTime: Date;
        tasks: string[];
        outcomes: string[];
        endTime?: Date | undefined;
    }, {
        id: string;
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        startTime: Date;
        tasks: string[];
        outcomes: string[];
        endTime?: Date | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "session_memory";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority: "low" | "medium" | "high" | "critical";
        confidence: number;
    };
    relationships: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[];
    session: {
        id: string;
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        startTime: Date;
        tasks: string[];
        outcomes: string[];
        endTime?: Date | undefined;
    };
}, {
    type: "session_memory";
    id: string;
    title: string;
    content: string;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tags: string[];
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        confidence?: number | undefined;
    };
    session: {
        id: string;
        agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
        startTime: Date;
        tasks: string[];
        outcomes: string[];
        endTime?: Date | undefined;
    };
    relationships?: {
        type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
        targetId: string;
        strength: number;
    }[] | undefined;
}>;
export type SessionMemory = z.infer<typeof SessionMemorySchema>;
export declare const SearchQuerySchema: z.ZodObject<{
    query: z.ZodString;
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<["architectural_decision", "pattern", "session_memory", "agent_interaction", "code_knowledge", "project_context"]>, "many">>;
    agents: z.ZodOptional<z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateRange: z.ZodOptional<z.ZodObject<{
        from: z.ZodOptional<z.ZodDate>;
        to: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        from?: Date | undefined;
        to?: Date | undefined;
    }, {
        from?: Date | undefined;
        to?: Date | undefined;
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
    offset: number;
    tags?: string[] | undefined;
    agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
    types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
    dateRange?: {
        from?: Date | undefined;
        to?: Date | undefined;
    } | undefined;
}, {
    query: string;
    tags?: string[] | undefined;
    agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
    types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
    dateRange?: {
        from?: Date | undefined;
        to?: Date | undefined;
    } | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export declare const SearchResultSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["architectural_decision", "pattern", "session_memory", "agent_interaction", "code_knowledge", "project_context"]>;
        title: z.ZodString;
        content: z.ZodString;
        metadata: z.ZodObject<{
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            version: z.ZodNumber;
            tags: z.ZodArray<z.ZodString, "many">;
            agents: z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">;
            priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
            confidence: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority: "low" | "medium" | "high" | "critical";
            confidence: number;
        }, {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority?: "low" | "medium" | "high" | "critical" | undefined;
            confidence?: number | undefined;
        }>;
        relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
            targetId: z.ZodString;
            type: z.ZodEnum<["depends_on", "relates_to", "conflicts_with", "builds_on"]>;
            strength: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }, {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
        id: string;
        title: string;
        content: string;
        metadata: {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority: "low" | "medium" | "high" | "critical";
            confidence: number;
        };
        relationships: {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }[];
    }, {
        type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
        id: string;
        title: string;
        content: string;
        metadata: {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority?: "low" | "medium" | "high" | "critical" | undefined;
            confidence?: number | undefined;
        };
        relationships?: {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    query: z.ZodObject<{
        query: z.ZodString;
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<["architectural_decision", "pattern", "session_memory", "agent_interaction", "code_knowledge", "project_context"]>, "many">>;
        agents: z.ZodOptional<z.ZodArray<z.ZodEnum<["ORCHESTRATOR", "DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "PERFORMANCE_OPTIMIZER", "ACCESSIBILITY", "CROSS_PLATFORM", "TESTING_QA", "SECURITY", "ANIMATION", "I18N", "UX_RESEARCH"]>, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        dateRange: z.ZodOptional<z.ZodObject<{
            from: z.ZodOptional<z.ZodDate>;
            to: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            from?: Date | undefined;
            to?: Date | undefined;
        }, {
            from?: Date | undefined;
            to?: Date | undefined;
        }>>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        limit: number;
        offset: number;
        tags?: string[] | undefined;
        agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
        types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
        dateRange?: {
            from?: Date | undefined;
            to?: Date | undefined;
        } | undefined;
    }, {
        query: string;
        tags?: string[] | undefined;
        agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
        types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
        dateRange?: {
            from?: Date | undefined;
            to?: Date | undefined;
        } | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>;
    executionTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    entries: {
        type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
        id: string;
        title: string;
        content: string;
        metadata: {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority: "low" | "medium" | "high" | "critical";
            confidence: number;
        };
        relationships: {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }[];
    }[];
    query: {
        query: string;
        limit: number;
        offset: number;
        tags?: string[] | undefined;
        agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
        types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
        dateRange?: {
            from?: Date | undefined;
            to?: Date | undefined;
        } | undefined;
    };
    total: number;
    executionTime: number;
}, {
    entries: {
        type: "architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context";
        id: string;
        title: string;
        content: string;
        metadata: {
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tags: string[];
            agents: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[];
            priority?: "low" | "medium" | "high" | "critical" | undefined;
            confidence?: number | undefined;
        };
        relationships?: {
            type: "depends_on" | "relates_to" | "conflicts_with" | "builds_on";
            targetId: string;
            strength: number;
        }[] | undefined;
    }[];
    query: {
        query: string;
        tags?: string[] | undefined;
        agents?: ("ORCHESTRATOR" | "DESIGN_SYSTEM" | "COMPONENT_DEVELOPER" | "PERFORMANCE_OPTIMIZER" | "ACCESSIBILITY" | "CROSS_PLATFORM" | "TESTING_QA" | "SECURITY" | "ANIMATION" | "I18N" | "UX_RESEARCH")[] | undefined;
        types?: ("architectural_decision" | "pattern" | "session_memory" | "agent_interaction" | "code_knowledge" | "project_context")[] | undefined;
        dateRange?: {
            from?: Date | undefined;
            to?: Date | undefined;
        } | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    };
    total: number;
    executionTime: number;
}>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export declare const ContextStatsSchema: z.ZodObject<{
    totalEntries: z.ZodNumber;
    entriesByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    entriesByAgent: z.ZodRecord<z.ZodString, z.ZodNumber>;
    averageConfidence: z.ZodNumber;
    lastUpdated: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    totalEntries: number;
    entriesByType: Record<string, number>;
    entriesByAgent: Record<string, number>;
    averageConfidence: number;
    lastUpdated: Date;
}, {
    totalEntries: number;
    entriesByType: Record<string, number>;
    entriesByAgent: Record<string, number>;
    averageConfidence: number;
    lastUpdated: Date;
}>;
export type ContextStats = z.infer<typeof ContextStatsSchema>;
//# sourceMappingURL=index.d.ts.map