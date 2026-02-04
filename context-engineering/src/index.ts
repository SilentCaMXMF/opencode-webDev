import { ContextEngineeringSystem } from './core/context-system';
import { AgentType, SearchQuery } from './types';

// Import AgentType values for use in runtime
const AgentTypes = {
  ORCHESTRATOR: 'ORCHESTRATOR' as const,
  DESIGN_SYSTEM: 'DESIGN_SYSTEM' as const,
  COMPONENT_DEVELOPER: 'COMPONENT_DEVELOPER' as const,
  PERFORMANCE_OPTIMIZER: 'PERFORMANCE_OPTIMIZER' as const,
  ACCESSIBILITY: 'ACCESSIBILITY' as const,
  CROSS_PLATFORM: 'CROSS_PLATFORM' as const,
  TESTING_QA: 'TESTING_QA' as const,
  SECURITY: 'SECURITY' as const,
  ANIMATION: 'ANIMATION' as const,
  I18N: 'I18N' as const,
  UX_RESEARCH: 'UX_RESEARCH' as const
};

// Export all public APIs
export * from './types';
export * from './core/context-system';
export * from './storage/database';
export * from './search/search-engine';

// Main system class for easy import
export { ContextEngineeringSystem };

// Factory function for convenient initialization
export async function createContextSystem(dbPath?: string): Promise<ContextEngineeringSystem> {
  const system = new ContextEngineeringSystem(dbPath);
  await system.initialize();
  return system;
}

// Helper functions for common operations
export class ContextAPI {
  private system: ContextEngineeringSystem;

  constructor(system: ContextEngineeringSystem) {
    this.system = system;
  }

  // Quick search methods
  async quickSearch(query: string, limit: number = 10): Promise<any[]> {
    const searchQuery: SearchQuery = {
      query,
      limit,
      offset: 0
    };
    const result = await this.system.search(searchQuery);
    return result.entries;
  }

  // Get latest context for an agent
  async getAgentContext(agent: AgentType): Promise<any[]> {
    return await this.system.getContextForAgent(agent);
  }

  // Store a quick note/memo
  async storeMemo(title: string, content: string, tags: string[] = []): Promise<any> {
    return await this.system.storeGeneralContext({
      title,
      content,
      type: 'project_context',
      agents: [AgentTypes.ORCHESTRATOR],
      tags: ['memo', ...tags],
      confidence: 0.6
    });
  }

  // Create ADR with simplified interface
  async createDecision(title: string, problem: string, chosen: string, rationale: string): Promise<any> {
    return await this.system.createADR({
      title,
      problem,
      alternatives: [chosen], // Single alternative for simple cases
      chosen,
      rationale,
      consequences: [],
      agents: [AgentTypes.ORCHESTRATOR],
      priority: 'medium'
    });
  }

  // Store pattern with simplified interface
  async storePattern(title: string, description: string, category: any = 'component'): Promise<any> {
    return await this.system.createPattern({
      title,
      description,
      category,
      complexity: 'medium',
      reusability: 'high',
      agents: [AgentTypes.COMPONENT_DEVELOPER],
      tags: ['component', 'pattern']
    });
  }
}

// Default export for easy usage
export default ContextEngineeringSystem;