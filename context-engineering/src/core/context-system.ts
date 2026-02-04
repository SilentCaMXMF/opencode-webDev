import { v4 as uuidv4 } from 'uuid';
import { 
  ContextEntry, 
  ADR, 
  Pattern, 
  SessionMemory, 
  AgentType, 
  SearchQuery, 
  SearchResult,
  ContextStats
} from '../types';
import { ContextStorage } from '../storage/database';
import { ContextSearch } from '../search/search-engine';

export class ContextEngineeringSystem {
  private storage: ContextStorage;
  private searchEngine: ContextSearch;
  private currentSession: string | null = null;
  private sessionContext: Map<string, any> = new Map();

  constructor(dbPath?: string) {
    this.storage = new ContextStorage(dbPath);
    this.searchEngine = new ContextSearch(this.storage);
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.searchEngine.initialize();
    this.currentSession = uuidv4();
  }

  // Context Creation Methods
  async createADR(data: {
    title: string;
    problem: string;
    alternatives: string[];
    chosen: string;
    rationale: string;
    consequences: string[];
    agents: AgentType[];
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ADR> {
    const id = `adr-${uuidv4()}`;
    
    const adr: ADR = {
      id,
      type: 'architectural_decision',
      title: data.title,
      content: `Problem: ${data.problem}\\n\\nAlternatives:\\n${data.alternatives.map(alt => `- ${alt}`).join('\\n')}\\n\\nChosen: ${data.chosen}\\n\\nRationale: ${data.rationale}\\n\\nConsequences:\\n${data.consequences.map(cons => `- ${cons}`).join('\\n')}`,
      decision: {
        problem: data.problem,
        alternatives: data.alternatives,
        chosen: data.chosen,
        rationale: data.rationale,
        consequences: data.consequences,
        status: 'accepted'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: data.tags || ['adr', 'architecture'],
        agents: data.agents,
        priority: data.priority || 'medium',
        confidence: 0.8
      },
      relationships: []
    };

    await this.storage.store(adr);
    return adr;
  }

  async createPattern(data: {
    title: string;
    description: string;
    category: 'component' | 'workflow' | 'architecture' | 'performance' | 'security';
    complexity: 'simple' | 'medium' | 'complex';
    reusability: 'low' | 'medium' | 'high';
    dependencies?: string[];
    examples?: string[];
    agents: AgentType[];
    tags?: string[];
  }): Promise<Pattern> {
    const id = `pattern-${uuidv4()}`;
    
    const pattern: Pattern = {
      id,
      type: 'pattern',
      title: data.title,
      content: data.description,
      pattern: {
        category: data.category,
        complexity: data.complexity,
        reusability: data.reusability,
        dependencies: data.dependencies || [],
        examples: data.examples || []
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: data.tags || ['pattern', data.category],
        agents: data.agents,
        priority: 'medium',
        confidence: 0.7
      },
      relationships: []
    };

    await this.storage.store(pattern);
    return pattern;
  }

  async storeSessionMemory(data: {
    sessionTasks: string[];
    sessionOutcomes: string[];
    agents: AgentType[];
    summary: string;
    tags?: string[];
  }): Promise<SessionMemory> {
    if (!this.currentSession) {
      this.currentSession = uuidv4();
    }

    const id = `session-${this.currentSession}`;
    
    const sessionMemory: SessionMemory = {
      id,
      type: 'session_memory',
      title: `Session ${this.currentSession}`,
      content: data.summary,
      session: {
        id: this.currentSession,
        startTime: new Date(),
        agents: data.agents,
        tasks: data.sessionTasks,
        outcomes: data.sessionOutcomes
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: data.tags || ['session', 'memory'],
        agents: data.agents,
        priority: 'medium',
        confidence: 0.9
      },
      relationships: []
    };

    await this.storage.store(sessionMemory);
    return sessionMemory;
  }

  async storeGeneralContext(data: {
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
  }): Promise<ContextEntry> {
    const id = `${data.type}-${uuidv4()}`;
    
    const entry: ContextEntry = {
      id,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: data.tags || [data.type],
        agents: data.agents,
        priority: data.priority || 'medium',
        confidence: data.confidence || 0.5
      },
      relationships: data.relationships || []
    };

    await this.storage.store(entry);
    return entry;
  }

  // Search and Retrieval Methods
  async search(query: SearchQuery): Promise<SearchResult> {
    return await this.searchEngine.search(query);
  }

  async findByAgent(agent: AgentType, limit: number = 20): Promise<ContextEntry[]> {
    const query: SearchQuery = {
      query: '',
      agents: [agent],
      limit,
      offset: 0
    };
    
    const result = await this.searchEngine.search(query);
    return result.entries;
  }

  async findByType(type: ContextEntry['type'], limit: number = 20): Promise<ContextEntry[]> {
    const query: SearchQuery = {
      query: '',
      types: [type],
      limit,
      offset: 0
    };
    
    const result = await this.searchEngine.search(query);
    return result.entries;
  }

  async findByTags(tags: string[], limit: number = 20): Promise<ContextEntry[]> {
    const query: SearchQuery = {
      query: '',
      tags,
      limit,
      offset: 0
    };
    
    const result = await this.searchEngine.search(query);
    return result.entries;
  }

  async findSimilar(entryId: string, limit: number = 10): Promise<ContextEntry[]> {
    return await this.searchEngine.findRelated(entryId, limit);
  }

  async discoverPatterns(limit: number = 20): Promise<Array<{ pattern: string, confidence: number, entries: ContextEntry[] }>> {
    return await this.searchEngine.discoverPatterns(limit);
  }

  // Agent-Specific Methods
  async getContextForAgent(agent: AgentType, contextType?: ContextEntry['type']): Promise<ContextEntry[]> {
    let entries: ContextEntry[];
    
    if (contextType) {
      const query: SearchQuery = {
        query: '',
        agents: [agent],
        types: [contextType],
        limit: 50,
        offset: 0
      };
      const result = await this.searchEngine.search(query);
      entries = result.entries;
    } else {
      entries = await this.findByAgent(agent, 50);
    }

    // Filter for high-confidence, recent entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return entries
      .filter(entry => entry.metadata.confidence > 0.6)
      .filter(entry => entry.metadata.updatedAt > thirtyDaysAgo)
      .sort((a, b) => {
        // Sort by priority first, then by recency
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime();
      });
  }

  async addAgentInteraction(agent: AgentType, interaction: {
    action: string;
    outcome: string;
    context?: string;
    relatedEntries?: string[];
  }): Promise<ContextEntry> {
    const content = `Action: ${interaction.action}\\nOutcome: ${interaction.outcome}${interaction.context ? `\\nContext: ${interaction.context}` : ''}`;
    
    const relationships = interaction.relatedEntries?.map(id => ({
      targetId: id,
      type: 'relates_to' as const,
      strength: 0.7
    })) || [];

    return await this.storeGeneralContext({
      title: `Agent ${agent} Interaction`,
      content,
      type: 'agent_interaction',
      agents: [agent],
      tags: ['agent', 'interaction', agent.toLowerCase()],
      confidence: 0.8,
      relationships
    });
  }

  // Pattern Discovery and Learning
  async getAgentCollaborationPatterns(): Promise<Array<{ agents: AgentType[], frequency: number, contexts: ContextEntry[] }>> {
    const allQuery: SearchQuery = { query: '', limit: 1000, offset: 0 };
    const { entries } = await this.searchEngine.search(allQuery);

    const collaborations = new Map<string, { count: number, entries: ContextEntry[] }>();

    entries.forEach(entry => {
      if (entry.metadata.agents.length >= 2) {
        const sortedAgents = entry.metadata.agents.sort().join(',');
        if (!collaborations.has(sortedAgents)) {
          collaborations.set(sortedAgents, { count: 0, entries: [] });
        }
        const group = collaborations.get(sortedAgents)!;
        group.count++;
        group.entries.push(entry);
      }
    });

    return Array.from(collaborations.entries())
      .map(([agents, group]) => ({
        agents: agents.split(',') as AgentType[],
        frequency: group.count,
        contexts: group.entries
      }))
      .filter(group => group.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency);
  }

  // Analytics and Statistics
  async getStatistics(): Promise<ContextStats> {
    return await this.storage.getStatistics();
  }

  async getAgentActivity(agent: AgentType, days: number = 30): Promise<{
    totalInteractions: number;
    contextsByType: Record<string, number>;
    averageConfidence: number;
    topTags: Array<{ tag: string, count: number }>;
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const query: SearchQuery = {
      query: '',
      agents: [agent],
      dateRange: { from: fromDate },
      limit: 1000,
      offset: 0
    };

    const { entries } = await this.searchEngine.search(query);

    const contextsByType: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    let totalConfidence = 0;

    entries.forEach(entry => {
      // Count by type
      contextsByType[entry.type] = (contextsByType[entry.type] || 0) + 1;
      
      // Sum confidence
      totalConfidence += entry.metadata.confidence;
      
      // Count tags
      entry.metadata.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalInteractions: entries.length,
      contextsByType,
      averageConfidence: entries.length > 0 ? totalConfidence / entries.length : 0,
      topTags
    };
  }

  // Session Management
  getCurrentSession(): string | null {
    return this.currentSession;
  }

  setSessionContext(key: string, value: any): void {
    this.sessionContext.set(key, value);
  }

  getSessionContext(key: string): any {
    return this.sessionContext.get(key);
  }

  // Relationship Management
  async addRelationship(
    fromId: string, 
    toId: string, 
    type: 'depends_on' | 'relates_to' | 'conflicts_with' | 'builds_on',
    strength: number = 0.5
  ): Promise<void> {
    const fromEntry = await this.storage.retrieve(fromId);
    if (!fromEntry) {
      throw new Error(`Entry with id ${fromId} not found`);
    }

    // Remove existing relationship to this target if exists
    fromEntry.relationships = fromEntry.relationships.filter(rel => rel.targetId !== toId);
    
    // Add new relationship
    fromEntry.relationships.push({ targetId: toId, type, strength });

    await this.storage.update(fromEntry);
  }

  // Cleanup and Maintenance
  async cleanupOldEntries(daysOld: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const allQuery: SearchQuery = { 
      query: '',
      limit: 10000,
      offset: 0,
      dateRange: { to: cutoffDate }
    };
    
    const { entries } = await this.searchEngine.search(allQuery);
    
    let deletedCount = 0;
    for (const entry of entries) {
      // Don't delete critical entries or ADRs
      if (entry.metadata.priority !== 'critical' && entry.type !== 'architectural_decision') {
        await this.storage.delete(entry.id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async close(): Promise<void> {
    await this.storage.close();
  }
}