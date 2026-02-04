import { ContextEntry, ADR, Pattern, SessionMemory, AgentType, SearchQuery, SearchResult, ContextStats } from '../types';
export declare class ContextEngineeringSystem {
    private storage;
    private searchEngine;
    private currentSession;
    private sessionContext;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    createADR(data: {
        title: string;
        problem: string;
        alternatives: string[];
        chosen: string;
        rationale: string;
        consequences: string[];
        agents: AgentType[];
        tags?: string[];
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<ADR>;
    createPattern(data: {
        title: string;
        description: string;
        category: 'component' | 'workflow' | 'architecture' | 'performance' | 'security';
        complexity: 'simple' | 'medium' | 'complex';
        reusability: 'low' | 'medium' | 'high';
        dependencies?: string[];
        examples?: string[];
        agents: AgentType[];
        tags?: string[];
    }): Promise<Pattern>;
    storeSessionMemory(data: {
        sessionTasks: string[];
        sessionOutcomes: string[];
        agents: AgentType[];
        summary: string;
        tags?: string[];
    }): Promise<SessionMemory>;
    storeGeneralContext(data: {
        title: string;
        content: string;
        type: 'agent_interaction' | 'code_knowledge' | 'project_context';
        agents: AgentType[];
        tags?: string[];
        priority?: 'low' | 'medium' | 'high' | 'critical';
        confidence?: number;
        relationships?: Array<{
            targetId: string;
            type: 'depends_on' | 'relates_to' | 'conflicts_with' | 'builds_on';
            strength: number;
        }>;
    }): Promise<ContextEntry>;
    search(query: SearchQuery): Promise<SearchResult>;
    findByAgent(agent: AgentType, limit?: number): Promise<ContextEntry[]>;
    findByType(type: ContextEntry['type'], limit?: number): Promise<ContextEntry[]>;
    findByTags(tags: string[], limit?: number): Promise<ContextEntry[]>;
    findSimilar(entryId: string, limit?: number): Promise<ContextEntry[]>;
    discoverPatterns(limit?: number): Promise<Array<{
        pattern: string;
        confidence: number;
        entries: ContextEntry[];
    }>>;
    getContextForAgent(agent: AgentType, contextType?: ContextEntry['type']): Promise<ContextEntry[]>;
    addAgentInteraction(agent: AgentType, interaction: {
        action: string;
        outcome: string;
        context?: string;
        relatedEntries?: string[];
    }): Promise<ContextEntry>;
    getAgentCollaborationPatterns(): Promise<Array<{
        agents: AgentType[];
        frequency: number;
        contexts: ContextEntry[];
    }>>;
    getStatistics(): Promise<ContextStats>;
    getAgentActivity(agent: AgentType, days?: number): Promise<{
        totalInteractions: number;
        contextsByType: Record<string, number>;
        averageConfidence: number;
        topTags: Array<{
            tag: string;
            count: number;
        }>;
    }>;
    getCurrentSession(): string | null;
    setSessionContext(key: string, value: any): void;
    getSessionContext(key: string): any;
    addRelationship(fromId: string, toId: string, type: 'depends_on' | 'relates_to' | 'conflicts_with' | 'builds_on', strength?: number): Promise<void>;
    cleanupOldEntries(daysOld?: number): Promise<number>;
    close(): Promise<void>;
}
//# sourceMappingURL=context-system.d.ts.map