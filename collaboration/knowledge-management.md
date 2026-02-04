# Knowledge Management System
**Component:** Collaboration Integration System
**Version:** 1.0.0
**Last Updated:** 2026-01-03

## Overview

The Knowledge Management System provides a centralized repository for agent learnings, best practices, patterns, and knowledge sharing. It enables continuous learning, search and retrieval, and intelligent recommendations for the Frontend Design Agent System.

## Features

### Learning Repository
- Store agent discoveries and insights
- Categorize learnings by agent and domain
- Track learning effectiveness
- Version-controlled knowledge updates
- Learning impact metrics

### Best Practices Database
- Curated best practices collection
- Categorized by domain and technology
- Community contributions
- Quality-validated practices
- Usage statistics

### Pattern Library
- Reusable code patterns
- Architectural patterns
- Design patterns
- Implementation patterns
- Pattern validation and scoring

### Knowledge Sharing
- Share learnings across agents
- Cross-pollination of ideas
- Knowledge graphs
- Related suggestions
- Trending topics

### Search and Retrieval
- Full-text search
- Semantic search
- Faceted filtering
- Relevance ranking
- AI-powered recommendations

### Continuous Learning
- Track successful patterns
- Record failures and anti-patterns
- Adapt based on feedback
- Self-improving recommendations
- Knowledge evolution tracking

## API Reference

### Repository

```typescript
interface KnowledgeRepository {
  /**
   * Store a learning
   */
  storeLearning(agentId: string, learning: Learning): Promise<string>;

  /**
   * Retrieve learnings for an agent
   */
  retrieveLearnings(agentId: string, filters?: LearningFilters): Promise<Learning[]>;

  /**
   * Get learning by ID
   */
  getLearning(learningId: string): Promise<Learning>;

  /**
   * Update learning
   */
  updateLearning(learningId: string, updates: Partial<Learning>): Promise<Learning>;

  /**
   * Delete learning
   */
  deleteLearning(learningId: string): Promise<void>;

  /**
   * Search learnings
   */
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;

  /**
   * Get related learnings
   */
  getRelated(learningId: string, limit?: number): Promise<Learning[]>;
}

interface Learning {
  id?: string;
  agentId: string;
  title: string;
  type: LearningType;
  description: string;
  content: string;
  context: LearningContext;
  tags: string[];
  examples: Example[];
  references: Reference[];
  impact: ImpactMetrics;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

type LearningType =
  | 'discovery'
  | 'pattern'
  | 'best-practice'
  | 'anti-pattern'
  | 'optimization'
  | 'solution'
  | 'insight';

interface LearningContext {
  task?: string;
  problem?: string;
  solution?: string;
  technology?: string;
  framework?: string;
  domain?: string;
  metadata?: Record<string, any>;
}

interface ImpactMetrics {
  usageCount: number;
  successRate: number;
  avgImprovement: number;
  lastUsed?: Date;
  feedbackScore?: number;
}
```

### Best Practices

```typescript
interface BestPracticeService {
  /**
   * Add a best practice
   */
  addBestPractice(practice: BestPractice): Promise<string>;

  /**
   * Get best practice by ID
   */
  getBestPractice(id: string): Promise<BestPractice>;

  /**
   * Get best practices by category
   */
  getBestPractices(category: string, filters?: PracticeFilters): Promise<BestPractice[]>;

  /**
   * Update best practice
   */
  updateBestPractice(id: string, updates: Partial<BestPractice>): Promise<BestPractice>;

  /**
   * Rate best practice
   */
  rateBestPractice(id: string, rating: number, feedback?: string): Promise<void>;

  /**
   * Validate best practice
   */
  validateBestPractice(id: string): Promise<ValidationResult>;

  /**
   * Get trending best practices
   */
  getTrending(limit?: number): Promise<BestPractice[]>;

  /**
   * Get recommended best practices
   */
  getRecommended(context: Context): Promise<BestPractice[]>;
}

interface BestPractice {
  id?: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  content: string;
  rationale: string;
  benefits: string[];
  tradeoffs: string[];
  examples: Example[];
  references: Reference[];
  tags: string[];
  author: string;
  contributors: string[];
  rating: RatingMetrics;
  validation: ValidationStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface RatingMetrics {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

interface ValidationStatus {
  status: 'pending' | 'validated' | 'deprecated' | 'rejected';
  validatedBy?: string;
  validatedAt?: Date;
  notes?: string;
}
```

### Pattern Library

```typescript
interface PatternService {
  /**
   * Register a pattern
   */
  registerPattern(pattern: Pattern): Promise<string>;

  /**
   * Find patterns by context
   */
  findPatterns(context: string, filters?: PatternFilters): Promise<Pattern[]>;

  /**
   * Get pattern by ID
   */
  getPattern(patternId: string): Promise<Pattern>;

  /**
   * Update pattern
   */
  updatePattern(patternId: string, updates: Partial<Pattern>): Promise<Pattern>;

  /**
   * Validate pattern
   */
  validatePattern(pattern: Pattern): Promise<ValidationResult>;

  /**
   * Rate pattern
   */
  ratePattern(patternId: string, rating: number): Promise<void>;

  /**
   * Get pattern usage statistics
   */
  getPatternStats(patternId: string): Promise<PatternStats>;

  /**
   * Suggest patterns for context
   */
  suggestPatterns(context: Context): Promise<PatternSuggestion[]>;
}

interface Pattern {
  id?: string;
  name: string;
  type: PatternType;
  category: string;
  description: string;
  intent: string;
  motivation: string;
  applicability: string[];
  consequences: {
    benefits: string[];
    liabilities: string[];
  };
  structure: string;
  implementation: string;
  examples: Example[];
  code?: string;
  relatedPatterns: string[];
  tags: string[];
  quality: QualityMetrics;
  usage: UsageMetrics;
  createdAt: Date;
  updatedAt: Date;
}

type PatternType =
  | 'architectural'
  | 'design'
  | 'code'
  | 'component'
  | 'optimization'
  | 'security'
  | 'testing'
  | 'performance'
  | 'accessibility';

interface QualityMetrics {
  score: number;
  completeness: number;
  clarity: number;
  correctness: number;
  maintainability: number;
  validationStatus: string;
}

interface UsageMetrics {
  usageCount: number;
  lastUsed: Date;
  successRate: number;
  avgImprovement: number;
  userRatings: RatingMetrics;
}

interface PatternSuggestion {
  pattern: Pattern;
  relevanceScore: number;
  matchReason: string;
  estimatedEffort: 'easy' | 'moderate' | 'complex';
  confidence: number;
}
```

### Knowledge Sharing

```typescript
interface KnowledgeSharingService {
  /**
   * Create shared content
   */
  createShare(content: SharedContent): Promise<string>;

  /**
   * Get share by ID
   */
  getShare(shareId: string): Promise<SharedContent>;

  /**
   * List shares
   */
  listShares(agentId?: string, filters?: ShareFilters): Promise<SharedContent[]>;

  /**
   * Update share
   */
  updateShare(shareId: string, updates: Partial<SharedContent>): Promise<SharedContent>;

  /**
   * Delete share
   */
  deleteShare(shareId: string): Promise<void>;

  /**
   * Like/share content
   */
  likeShare(shareId: string, agentId: string): Promise<void>;

  /**
   * Comment on share
   */
  commentOnShare(shareId: string, comment: Comment): Promise<void>;

  /**
   * Get knowledge graph
   */
  getKnowledgeGraph(agentId?: string): Promise<KnowledgeGraph>;
}

interface SharedContent {
  id?: string;
  type: 'learning' | 'pattern' | 'best-practice' | 'article' | 'resource';
  title: string;
  description: string;
  content: string;
  author: string;
  tags: string[];
  categories: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  shares: number;
  sharedBy: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: KnowledgeCluster[];
}

interface KnowledgeNode {
  id: string;
  type: string;
  title: string;
  category: string;
  relevance: number;
}

interface KnowledgeEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

interface KnowledgeCluster {
  id: string;
  name: string;
  nodes: string[];
  category: string;
  relevance: number;
}
```

### Learning System

```typescript
interface LearningSystem {
  /**
   * Record success
   */
  recordSuccess(criteria: string, context: Context): Promise<void>;

  /**
   * Record failure
   */
  recordFailure(criteria: string, context: Context, error?: string): Promise<void>;

  /**
   * Get recommendations
   */
  getRecommendations(context: Context): Promise<Recommendation[]>;

  /**
   * Analyze patterns
   */
  analyzePatterns(period: Period): Promise<PatternAnalysis>;

  /**
   * Identify trends
   */
  identifyTrends(period: Period): Promise<Trend[]>;

  /**
   * Generate insights
   */
  generateInsights(agentId: string): Promise<Insight[]>;

  /**
   * Get learning metrics
   */
  getMetrics(agentId?: string, period?: Period): Promise<LearningMetrics>;
}

interface Context {
  task: string;
  domain: string;
  technology?: string;
  framework?: string;
  agentId?: string;
  metadata?: Record<string, any>;
}

interface Recommendation {
  type: 'pattern' | 'best-practice' | 'learning' | 'resource';
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  confidence: number;
  reasoning: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
}

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  data: Record<string, any>;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

type InsightType =
  | 'optimization'
  | 'trend'
  | 'anomaly'
  | 'improvement'
  | 'best-practice'
  | 'warning';

interface LearningMetrics {
  totalLearnings: number;
  successfulPatterns: number;
  failedPatterns: number;
  improvementRate: number;
  knowledgeGrowth: number;
  topDomains: DomainMetric[];
  topTechnologies: TechnologyMetric[];
  agentMetrics: AgentMetric[];
}

interface PatternAnalysis {
  mostUsed: Pattern[];
  mostEffective: Pattern[];
  emerging: Pattern[];
  declining: Pattern[];
  patternsByCategory: Record<string, Pattern[]>;
  correlations: PatternCorrelation[];
}
```

## Agent Integration

### Agent Learning Capture

```typescript
class AgentLearningCapture {
  constructor(
    private repository: KnowledgeRepository,
    private learningSystem: LearningSystem
  ) {}

  /**
   * Capture learning from agent output
   */
  async captureLearning(agentId: string, output: AgentOutput): Promise<string> {
    // Extract learnings from output
    const learnings = this.extractLearnings(output);

    const learningIds: string[] = [];

    // Store each learning
    for (const learning of learnings) {
      const id = await this.repository.storeLearning(agentId, learning);
      learningIds.push(id);
    }

    // Record successful outcomes
    if (output.success) {
      await this.learningSystem.recordSuccess(
        output.taskId || 'unknown',
        this.buildContext(agentId, output)
      );
    }

    return learningIds[0]; // Return primary learning ID
  }

  /**
   * Extract learnings from agent output
   */
  private extractLearnings(output: AgentOutput): Learning[] {
    const learnings: Learning[] = [];

    // Extract discoveries
    if (output.discoveries) {
      for (const discovery of output.discoveries) {
        learnings.push({
          title: discovery.title || 'Discovery',
          type: 'discovery',
          description: discovery.description,
          content: discovery.content || discovery.description,
          context: this.buildContext(output.agentId, output),
          tags: this.generateTags(output, discovery),
          examples: discovery.examples || [],
          references: [],
          impact: {
            usageCount: 0,
            successRate: 1,
            avgImprovement: discovery.estimatedImprovement || 0
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        });
      }
    }

    // Extract patterns
    if (output.patterns) {
      for (const pattern of output.patterns) {
        learnings.push({
          title: pattern.name || 'Pattern',
          type: 'pattern',
          description: pattern.description,
          content: pattern.implementation || pattern.description,
          context: this.buildContext(output.agentId, output),
          tags: [...this.generateTags(output, pattern), 'pattern'],
          examples: pattern.examples || [],
          references: pattern.references || [],
          impact: {
            usageCount: 0,
            successRate: 1,
            avgImprovement: pattern.estimatedImprovement || 0
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        });
      }
    }

    return learnings;
  }

  /**
   * Build context for learning
   */
  private buildContext(agentId: string, output: AgentOutput): LearningContext {
    return {
      task: output.taskId || output.title || 'unknown',
      problem: output.problem || output.description?.substring(0, 200),
      solution: output.solution || output.summary,
      technology: output.technology || this.getAgentTechnology(agentId),
      framework: output.framework,
      domain: this.getAgentDomain(agentId),
      metadata: {
        agentId,
        timestamp: output.timestamp,
        taskId: output.taskId
      }
    };
  }

  /**
   * Generate tags for learning
   */
  private generateTags(output: AgentOutput, extra?: any): string[] {
    const tags: string[] = [];

    tags.push(output.agentId);
    tags.push(this.getAgentDomain(output.agentId));

    if (output.technology) tags.push(output.technology);
    if (output.framework) tags.push(output.framework);

    if (extra && extra.type) tags.push(extra.type);
    if (extra && extra.category) tags.push(extra.category);

    return tags;
  }

  private getAgentTechnology(agentId: string): string {
    const techMap: Record<string, string> = {
      'FD-DS-02': 'design-systems',
      'FD-CD-03': 'react',
      'FD-PO-04': 'performance',
      'FD-AX-05': 'a11y',
      'FD-CP-06': 'cross-browser',
      'FD-TQ-07': 'testing',
      'FD-SC-08': 'security',
      'FD-AN-09': 'animation',
      'FD-I1-10': 'i18n',
      'FD-UR-11': 'ux-research'
    };
    return techMap[agentId] || 'frontend';
  }

  private getAgentDomain(agentId: string): string {
    const domainMap: Record<string, string> = {
      'FD-DS-02': 'design',
      'FD-CD-03': 'development',
      'FD-PO-04': 'performance',
      'FD-AX-05': 'accessibility',
      'FD-CP-06': 'platform',
      'FD-TQ-07': 'testing',
      'FD-SC-08': 'security',
      'FD-AN-09': 'animation',
      'FD-I1-10': 'internationalization',
      'FD-UR-11': 'ux-research'
    };
    return domainMap[agentId] || 'frontend';
  }
}
```

### Best Practice Management

```typescript
class BestPracticeManager {
  constructor(
    private service: BestPracticeService,
    private notifications: NotificationService
  ) {}

  /**
   * Create best practice from agent learning
   */
  async createFromLearning(learning: Learning): Promise<string> {
    const practice: BestPractice = {
      title: learning.title,
      category: learning.context.domain || 'general',
      description: learning.description,
      content: learning.content,
      rationale: learning.content,
      benefits: this.extractBenefits(learning.content),
      tradeoffs: [],
      examples: learning.examples,
      references: learning.references,
      tags: learning.tags,
      author: learning.agentId,
      contributors: [],
      rating: {
        average: 0,
        count: 0,
        distribution: {}
      },
      validation: {
        status: 'pending'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await this.service.addBestPractice(practice);

    // Notify team
    await this.notifications.sendSlack('#best-practices', {
      text: `New best practice added: ${practice.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New Best Practice*\n\n*Title:* ${practice.title}\n*Category:* ${practice.category}\n*Author:* ${practice.author}`
          }
        }
      ]
    });

    return id;
  }

  /**
   * Validate best practice
   */
  async validatePractice(practiceId: string, validator: string): Promise<void> {
    await this.service.validateBestPractice(practiceId);

    const practice = await this.service.getBestPractice(practiceId);

    // Notify validation result
    await this.notifications.sendSlack('#best-practices', {
      text: `Best practice validated: ${practice.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Best Practice Validated*\n\n*Title:* ${practice.title}\n*Validated By:* ${validator}\n*Status:* ✅ Validated`
          }
        }
      ]
    });
  }

  /**
   * Extract benefits from content
   */
  private extractBenefits(content: string): string[] {
    const benefits: string[] = [];
    const benefitMatches = content.match(/benefits?:?\s*[:\n](.*?)(?=\n\n|\n[A-Z]|$)/gis);

    if (benefitMatches) {
      for (const match of benefitMatches) {
        const items = match.split(/[•\-\*]\s*/).filter(item => item.trim());
        benefits.push(...items);
      }
    }

    return benefits.slice(0, 5);
  }
}
```

### Pattern Management

```typescript
class PatternManager {
  constructor(
    private service: PatternService,
    private repository: KnowledgeRepository
  ) {}

  /**
   * Register pattern from agent learning
   */
  async registerFromLearning(learning: Learning): Promise<string> {
    const pattern: Pattern = {
      name: learning.title,
      type: this.determinePatternType(learning),
      category: learning.context.domain || 'general',
      description: learning.description,
      intent: learning.context.solution || 'Solve a specific problem',
      motivation: learning.content,
      applicability: [learning.context.domain || 'general'],
      consequences: {
        benefits: this.extractBenefits(learning.content),
        liabilities: []
      },
      structure: '',
      implementation: learning.content,
      examples: learning.examples,
      relatedPatterns: [],
      tags: learning.tags,
      quality: {
        score: 80,
        completeness: 100,
        clarity: 80,
        correctness: 80,
        maintainability: 80,
        validationStatus: 'pending'
      },
      usage: {
        usageCount: 0,
        lastUsed: new Date(),
        successRate: 1,
        avgImprovement: learning.impact.avgImprovement || 0,
        userRatings: {
          average: 0,
          count: 0,
          distribution: {}
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await this.service.registerPattern(pattern);
    return id;
  }

  /**
   * Suggest patterns for agent task
   */
  async suggestForTask(agentId: string, task: AgentTask): Promise<PatternSuggestion[]> {
    const context: Context = {
      task: task.title,
      domain: this.getAgentDomain(agentId),
      technology: task.technology,
      framework: task.framework,
      agentId,
      metadata: { task }
    };

    return await this.service.suggestPatterns(context);
  }

  /**
   * Determine pattern type from learning
   */
  private determinePatternType(learning: Learning): PatternType {
    const typeMap: Record<string, PatternType> = {
      'design': 'design',
      'development': 'code',
      'performance': 'optimization',
      'accessibility': 'a11y',
      'security': 'security',
      'testing': 'testing',
      'animation': 'component',
      'internationalization': 'component',
      'ux-research': 'design'
    };

    return typeMap[learning.context.domain || ''] || 'code';
  }

  /**
   * Extract benefits from content
   */
  private extractBenefits(content: string): string[] {
    const benefits: string[] = [];
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes('benefit') ||
          sentence.toLowerCase().includes('improvement') ||
          sentence.toLowerCase().includes('better')) {
        benefits.push(sentence.trim());
      }
    }

    return benefits.slice(0, 5);
  }

  private getAgentDomain(agentId: string): string {
    const domainMap: Record<string, string> = {
      'FD-DS-02': 'design',
      'FD-CD-03': 'development',
      'FD-PO-04': 'performance',
      'FD-AX-05': 'accessibility',
      'FD-CP-06': 'platform',
      'FD-TQ-07': 'testing',
      'FD-SC-08': 'security',
      'FD-AN-09': 'animation',
      'FD-I1-10': 'internationalization',
      'FD-UR-11': 'ux-research'
    };
    return domainMap[agentId] || 'general';
  }
}
```

### Intelligent Recommendations

```typescript
class IntelligentRecommendationEngine {
  constructor(
    private learningSystem: LearningSystem,
    private repository: KnowledgeRepository,
    private patternService: PatternService
  ) {}

  /**
   * Get recommendations for agent task
   */
  async getRecommendations(agentId: string, task: AgentTask): Promise<Recommendation[]> {
    const context: Context = {
      task: task.title,
      domain: this.getAgentDomain(agentId),
      technology: task.technology,
      framework: task.framework,
      agentId,
      metadata: { task }
    };

    // Get various types of recommendations
    const [
      learningRecs,
      patternRecs,
      practiceRecs
    ] = await Promise.all([
      this.getLearningRecommendations(context),
      this.getPatternRecommendations(context),
      this.getBestPracticeRecommendations(context)
    ]);

    // Combine and rank
    const allRecommendations = [
      ...learningRecs.map(r => ({ ...r, type: 'learning' as const })),
      ...patternRecs,
      ...practiceRecs.map(p => ({
        type: 'best-practice' as const,
        id: p.id || '',
        title: p.title,
        description: p.description,
        relevanceScore: p.rating?.average || 0,
        confidence: p.validation?.status === 'validated' ? 0.9 : 0.5,
        reasoning: 'Highly rated best practice',
        estimatedImpact: this.estimateImpact(p.benefits),
        effort: 'moderate'
      }))
    ];

    // Sort by relevance
    return allRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Get learning recommendations
   */
  private async getLearningRecommendations(context: Context): Promise<Partial<Recommendation>[]> {
    const recommendations = await this.learningSystem.getRecommendations(context);

    return recommendations;
  }

  /**
   * Get pattern recommendations
   */
  private async getPatternRecommendations(context: Context): Promise<PatternSuggestion[]> {
    return await this.patternService.suggestPatterns(context);
  }

  /**
   * Get best practice recommendations
   */
  private async getBestPracticeRecommendations(context: Context): Promise<BestPractice[]> {
    // Implement best practice retrieval based on context
    return [];
  }

  /**
   * Estimate impact from benefits
   */
  private estimateImpact(benefits: string[]): 'high' | 'medium' | 'low' {
    if (benefits.some(b => b.toLowerCase().includes('significant') ||
                            b.toLowerCase().includes('major') ||
                            b.toLowerCase().includes('dramatic'))) {
      return 'high';
    }
    if (benefits.some(b => b.toLowerCase().includes('improve') ||
                            b.toLowerCase().includes('better'))) {
      return 'medium';
    }
    return 'low';
  }

  private getAgentDomain(agentId: string): string {
    const domainMap: Record<string, string> = {
      'FD-DS-02': 'design',
      'FD-CD-03': 'development',
      'FD-PO-04': 'performance',
      'FD-AX-05': 'accessibility',
      'FD-CP-06': 'platform',
      'FD-TQ-07': 'testing',
      'FD-SC-08': 'security',
      'FD-AN-09': 'animation',
      'FD-I1-10': 'internationalization',
      'FD-UR-11': 'ux-research'
    };
    return domainMap[agentId] || 'general';
  }
}
```

### Knowledge Graph

```typescript
class KnowledgeGraphBuilder {
  constructor(
    private repository: KnowledgeRepository,
    private patternService: PatternService
  ) {}

  /**
   * Build knowledge graph for agent
   */
  async buildGraph(agentId?: string): Promise<KnowledgeGraph> {
    // Get all learnings
    const learnings = agentId
      ? await this.repository.retrieveLearnings(agentId)
      : await this.repository.search('');

    // Get all patterns
    const patterns = await this.patternService.findPatterns('');

    // Create nodes
    const nodes = [
      ...this.createLearningNodes(learnings),
      ...this.createPatternNodes(patterns)
    ];

    // Create edges (relationships)
    const edges = this.createEdges([...learnings, ...patterns]);

    // Create clusters
    const clusters = this.createClusters(nodes, edges);

    return {
      nodes,
      edges,
      clusters
    };
  }

  /**
   * Create learning nodes
   */
  private createLearningNodes(learnings: Learning[]): KnowledgeNode[] {
    return learnings.map(learning => ({
      id: learning.id || '',
      type: learning.type,
      title: learning.title,
      category: learning.context.domain || 'general',
      relevance: learning.impact.usageCount
    }));
  }

  /**
   * Create pattern nodes
   */
  private createPatternNodes(patterns: Pattern[]): KnowledgeNode[] {
    return patterns.map(pattern => ({
      id: pattern.id || '',
      type: pattern.type,
      title: pattern.name,
      category: pattern.category,
      relevance: pattern.usage.usageCount
    }));
  }

  /**
   * Create edges between related items
   */
  private createEdges(items: (Learning | Pattern)[]): KnowledgeEdge[] {
    const edges: KnowledgeEdge[] = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const weight = this.calculateRelationship(items[i], items[j]);

        if (weight > 0) {
          edges.push({
            source: items[i].id || '',
            target: items[j].id || '',
            type: 'related',
            weight
          });
        }
      }
    }

    return edges;
  }

  /**
   * Calculate relationship between items
   */
  private calculateRelationship(item1: Learning | Pattern, item2: Learning | Pattern): number {
    let score = 0;

    // Tag overlap
    const tags1 = item1.tags || [];
    const tags2 = item2.tags || [];
    const commonTags = tags1.filter(t => tags2.includes(t));
    score += commonTags.length * 2;

    // Category match
    const cat1 = 'category' in item1 ? item1.category : item1.context.domain;
    const cat2 = 'category' in item2 ? item2.category : item2.context.domain;
    if (cat1 === cat2) score += 3;

    // Agent match
    const agent1 = 'agentId' in item1 ? item1.agentId : '';
    const agent2 = 'agentId' in item2 ? item2.agentId : '';
    if (agent1 && agent2 && agent1 === agent2) score += 1;

    return score;
  }

  /**
   * Create clusters from graph
   */
  private createClusters(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): KnowledgeCluster[] {
    const clusters: KnowledgeCluster[] = [];
    const visited = new Set<string>();

    // Simple clustering based on category
    const categoryGroups = new Map<string, string[]>();

    for (const node of nodes) {
      if (!categoryGroups.has(node.category)) {
        categoryGroups.set(node.category, []);
      }
      categoryGroups.get(node.category)!.push(node.id);
    }

    let clusterId = 0;
    for (const [category, nodeIds] of categoryGroups.entries()) {
      clusters.push({
        id: `cluster-${clusterId++}`,
        name: category,
        nodes: nodeIds,
        category,
        relevance: nodeIds.reduce((sum, id) => {
          const node = nodes.find(n => n.id === id);
          return sum + (node?.relevance || 0);
        }, 0)
      });
    }

    return clusters;
  }
}
```

## Configuration

```typescript
interface KnowledgeConfig {
  repository: {
    enabled: boolean;
    storage: 'memory' | 'database' | 'file';
    retentionDays: number;
  };
  bestPractices: {
    enabled: boolean;
    validationRequired: boolean;
    minRating: number;
    allowCommunityContributions: boolean;
  };
  patterns: {
    enabled: boolean;
    autoRegister: boolean;
    qualityThreshold: number;
    updateFrequency: number;
  };
  sharing: {
    enabled: boolean;
    allowAnonymous: boolean;
    requireApproval: boolean;
  };
  learning: {
    enabled: boolean;
    autoCapture: boolean;
    retentionDays: number;
    analyzeFrequency: string;
  };
  search: {
    enabled: boolean;
    type: 'full-text' | 'semantic' | 'hybrid';
    minScore: number;
  };
  graph: {
    enabled: boolean;
    autoBuild: boolean;
    updateFrequency: string;
  };
}
```

## Best Practices

1. **Capture learnings automatically** from agent outputs
2. **Validate best practices** before publication
3. **Categorize and tag** knowledge for easy retrieval
4. **Maintain quality** through regular reviews
5. **Share knowledge** across all agents
6. **Track usage** and impact of patterns
7. **Update learnings** based on feedback
8. **Use semantic search** for better results
9. **Build knowledge graphs** to visualize relationships
10. **Continuously improve** based on metrics

---

## Next Steps

- [ ] Review [Workflow Automation Engine](./workflow-automation-engine.md)
- [ ] Check [Setup Guide](../SETUP.md)
- [ ] Explore [Notification Service](./notification-service.md)
