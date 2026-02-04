import { v4 as uuidv4 } from 'uuid';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { 
  ResearchCommand, 
  CommandResult,
  WorkflowStage,
  AgentType,
  Deviation,
  Evidence
} from '@types/workflow';

export class ResearchCommandHandler {
  private contextSystem: ContextSystem;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
  }

  async execute(command: ResearchCommand): Promise<CommandResult> {
    const startTime = Date.now();
    const deviations: Deviation[] = [];
    const evidence: Evidence[] = [];

    try {
      // Search context system for relevant information
      const searchResult = await this.contextSystem.search({
        query: command.parameters.query,
        types: command.parameters.contextTypes,
        agents: command.parameters.agentFilter,
        limit: command.parameters.maxResults
      });

      // Analyze patterns in search results
      const patterns = await this.analyzePatterns(searchResult.entries);
      
      // Identify relevant architectural decisions
      const architecturalDecisions = searchResult.entries.filter(
        entry => entry.type === 'architectural_decision'
      );

      // Extract code knowledge and examples
      const codeKnowledge = searchResult.entries.filter(
        entry => entry.type === 'code_knowledge'
      );

      // Generate research evidence
      if (command.parameters.includeEvidence) {
        evidence.push(...await this.generateResearchEvidence(
          searchResult,
          patterns,
          command
        ));
      }

      // Check for any deviations from expected research patterns
      const researchDeviations = await this.detectResearchDeviations(
        searchResult,
        command
      );
      deviations.push(...researchDeviations);

      const executionTime = Date.now() - startTime;

      return {
        commandId: command.id,
        success: true,
        stage: 'research',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: {
          searchResults: searchResult,
          patterns,
          architecturalDecisions,
          codeKnowledge,
          summary: await this.generateResearchSummary(searchResult, patterns)
        },
        deviations,
        evidence,
        nextStage: 'plan',
        artifacts: []
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        commandId: command.id,
        success: false,
        stage: 'research',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: null,
        deviations,
        evidence,
        message: `Research command failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async analyzePatterns(entries: any[]): Promise<any[]> {
    const patterns: any[] = [];
    
    // Group entries by type and agent
    const entriesByType = this.groupBy(entries, 'type');
    const entriesByAgent = this.groupBy(entries, 'metadata.agents');

    // Identify common patterns across agents
    for (const [type, typeEntries] of Object.entries(entriesByType)) {
      if (typeEntries.length >= 2) {
        patterns.push({
          type: 'frequency_pattern',
          description: `Found ${typeEntries.length} entries of type ${type}`,
          entries: typeEntries.map((e: any) => e.id)
        });
      }
    }

    // Identify collaboration patterns between agents
    const collaborations = this.identifyCollaborationPatterns(entries);
    patterns.push(...collaborations);

    // Identify temporal patterns
    const temporalPatterns = this.identifyTemporalPatterns(entries);
    patterns.push(...temporalPatterns);

    return patterns;
  }

  private async generateResearchEvidence(
    searchResult: any,
    patterns: any[],
    command: ResearchCommand
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Evidence for search completeness
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'research',
      agent: command.agent,
      data: {
        totalResults: searchResult.total,
        executionTime: searchResult.executionTime,
        queryCoverage: this.assessQueryCoverage(command.parameters.query, searchResult.entries)
      },
      timestamp: new Date(),
      confidence: 0.85
    });

    // Evidence for pattern relevance
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'research',
      agent: command.agent,
      data: {
        patternCount: patterns.length,
        patternTypes: patterns.map(p => p.type),
        relevanceScore: this.calculatePatternRelevance(patterns, command.parameters.query)
      },
      timestamp: new Date(),
      confidence: 0.8
    });

    // Evidence for context hit rate
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'research',
      agent: command.agent,
      data: {
        contextHitRate: searchResult.total > 0 ? 0.9 : 0.1,
        contextTypes: [...new Set(searchResult.entries.map((e: any) => e.type))],
        agentCoverage: this.calculateAgentCoverage(searchResult.entries, command.agent)
      },
      timestamp: new Date(),
      confidence: 0.9
    });

    return evidence;
  }

  private async detectResearchDeviations(
    searchResult: any,
    command: ResearchCommand
  ): Promise<Deviation[]> {
    const deviations: Deviation[] = [];

    // Check for low result count deviation
    if (searchResult.total < 5 && !command.parameters.query.includes('specific')) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'research',
        agent: command.agent,
        expected: 'Minimum 5 search results for comprehensive research',
        actual: `Found ${searchResult.total} results`,
        severity: 'minor',
        justification: 'Low result count may indicate insufficient context for planning'
      });
    }

    // Check for agent coverage deviation
    const relevantAgents = searchResult.entries.flatMap((e: any) => e.metadata.agents);
    const uniqueAgents = [...new Set(relevantAgents)];
    if (uniqueAgents.length < 2 && command.parameters.agentFilter?.length !== 1) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'research',
        agent: command.agent,
        expected: 'Multi-agent context coverage',
        actual: `Results only from ${uniqueAgents.join(', ')} agents`,
        severity: 'major',
        justification: 'Limited agent perspectives may result in biased planning'
      });
    }

    return deviations;
  }

  private async generateResearchSummary(searchResult: any, patterns: any[]): Promise<string> {
    const summary = [];
    
    summary.push(`Found ${searchResult.total} relevant context entries`);
    summary.push(`Identified ${patterns.length} patterns including agent collaborations and temporal trends`);
    
    if (searchResult.entries.some((e: any) => e.type === 'architectural_decision')) {
      summary.push('Relevant architectural decisions available for reference');
    }
    
    if (searchResult.entries.some((e: any) => e.type === 'code_knowledge')) {
      summary.push('Code examples and implementation patterns discovered');
    }

    return summary.join('. ');
  }

  private groupBy<T>(array: T[], key: string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = this.getNestedProperty(item, key);
      const groupKey = Array.isArray(group) ? group.join(',') : String(group);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private identifyCollaborationPatterns(entries: any[]): any[] {
    const patterns: any[] = [];
    const agentPairs = new Map<string, number>();

    for (const entry of entries) {
      const agents = entry.metadata.agents;
      if (agents.length > 1) {
        for (let i = 0; i < agents.length - 1; i++) {
          for (let j = i + 1; j < agents.length; j++) {
            const pair = [agents[i], agents[j]].sort().join('-');
            agentPairs.set(pair, (agentPairs.get(pair) || 0) + 1);
          }
        }
      }
    }

    for (const [pair, count] of agentPairs.entries()) {
      if (count >= 2) {
        patterns.push({
          type: 'collaboration_pattern',
          description: `${pair} agents collaborated ${count} times`,
          agents: pair.split('-'),
          frequency: count
        });
      }
    }

    return patterns;
  }

  private identifyTemporalPatterns(entries: any[]): any[] {
    const patterns: any[] = [];
    const entriesByMonth = new Map<string, number>();

    for (const entry of entries) {
      const month = new Date(entry.metadata.createdAt).toISOString().slice(0, 7);
      entriesByMonth.set(month, (entriesByMonth.get(month) || 0) + 1);
    }

    if (entriesByMonth.size > 1) {
      patterns.push({
        type: 'temporal_pattern',
        description: `Activity spread across ${entriesByMonth.size} months`,
        monthlyActivity: Object.fromEntries(entriesByMonth)
      });
    }

    return patterns;
  }

  private assessQueryCoverage(query: string, entries: any[]): number {
    if (entries.length === 0) return 0;
    
    const queryTerms = query.toLowerCase().split(' ');
    let totalCoverage = 0;
    
    for (const term of queryTerms) {
      const termMatches = entries.filter(entry => 
        entry.title.toLowerCase().includes(term) || 
        entry.content.toLowerCase().includes(term)
      ).length;
      totalCoverage += termMatches / entries.length;
    }
    
    return Math.min(totalCoverage / queryTerms.length, 1);
  }

  private calculatePatternRelevance(patterns: any[], query: string): number {
    if (patterns.length === 0) return 0.5;
    
    const queryTerms = query.toLowerCase().split(' ');
    let relevanceScore = 0;
    
    for (const pattern of patterns) {
      if (pattern.description) {
        const descriptionMatches = queryTerms.filter(term => 
          pattern.description.toLowerCase().includes(term)
        ).length;
        relevanceScore += descriptionMatches / queryTerms.length;
      }
    }
    
    return patterns.length > 0 ? relevanceScore / patterns.length : 0.5;
  }

  private calculateAgentCoverage(entries: any[], currentAgent: AgentType): number {
    const allAgents = new Set(entries.flatMap((e: any) => e.metadata.agents));
    const targetAgents = ['ORCHESTRATOR', currentAgent];
    const coverage = targetAgents.filter(agent => allAgents.has(agent)).length;
    return coverage / targetAgents.length;
  }
}