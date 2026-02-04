import { ContextEngineeringSystem } from './core/context-system';
import { AgentType } from './types';
export * from './types';
export * from './core/context-system';
export * from './storage/database';
export * from './search/search-engine';
export { ContextEngineeringSystem };
export declare function createContextSystem(dbPath?: string): Promise<ContextEngineeringSystem>;
export declare class ContextAPI {
    private system;
    constructor(system: ContextEngineeringSystem);
    quickSearch(query: string, limit?: number): Promise<any[]>;
    getAgentContext(agent: AgentType): Promise<any[]>;
    storeMemo(title: string, content: string, tags?: string[]): Promise<any>;
    createDecision(title: string, problem: string, chosen: string, rationale: string): Promise<any>;
    storePattern(title: string, description: string, category?: any): Promise<any>;
}
export default ContextEngineeringSystem;
//# sourceMappingURL=index.d.ts.map