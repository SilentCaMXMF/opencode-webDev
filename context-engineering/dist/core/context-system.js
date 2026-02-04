"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextEngineeringSystem = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../storage/database");
const search_engine_1 = require("../search/search-engine");
class ContextEngineeringSystem {
    storage;
    searchEngine;
    currentSession = null;
    sessionContext = new Map();
    constructor(dbPath) {
        this.storage = new database_1.ContextStorage(dbPath);
        this.searchEngine = new search_engine_1.ContextSearch(this.storage);
    }
    async initialize() {
        await this.storage.initialize();
        await this.searchEngine.initialize();
        this.currentSession = (0, uuid_1.v4)();
    }
    // Context Creation Methods
    async createADR(data) {
        const id = `adr-${(0, uuid_1.v4)()}`;
        const adr = {
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
    async createPattern(data) {
        const id = `pattern-${(0, uuid_1.v4)()}`;
        const pattern = {
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
    async storeSessionMemory(data) {
        if (!this.currentSession) {
            this.currentSession = (0, uuid_1.v4)();
        }
        const id = `session-${this.currentSession}`;
        const sessionMemory = {
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
    async storeGeneralContext(data) {
        const id = `${data.type}-${(0, uuid_1.v4)()}`;
        const entry = {
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
    async search(query) {
        return await this.searchEngine.search(query);
    }
    async findByAgent(agent, limit = 20) {
        const query = {
            query: '',
            agents: [agent],
            limit,
            offset: 0
        };
        const result = await this.searchEngine.search(query);
        return result.entries;
    }
    async findByType(type, limit = 20) {
        const query = {
            query: '',
            types: [type],
            limit,
            offset: 0
        };
        const result = await this.searchEngine.search(query);
        return result.entries;
    }
    async findByTags(tags, limit = 20) {
        const query = {
            query: '',
            tags,
            limit,
            offset: 0
        };
        const result = await this.searchEngine.search(query);
        return result.entries;
    }
    async findSimilar(entryId, limit = 10) {
        return await this.searchEngine.findRelated(entryId, limit);
    }
    async discoverPatterns(limit = 20) {
        return await this.searchEngine.discoverPatterns(limit);
    }
    // Agent-Specific Methods
    async getContextForAgent(agent, contextType) {
        let entries;
        if (contextType) {
            const query = {
                query: '',
                agents: [agent],
                types: [contextType],
                limit: 50,
                offset: 0
            };
            const result = await this.searchEngine.search(query);
            entries = result.entries;
        }
        else {
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
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime();
        });
    }
    async addAgentInteraction(agent, interaction) {
        const content = `Action: ${interaction.action}\\nOutcome: ${interaction.outcome}${interaction.context ? `\\nContext: ${interaction.context}` : ''}`;
        const relationships = interaction.relatedEntries?.map(id => ({
            targetId: id,
            type: 'relates_to',
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
    async getAgentCollaborationPatterns() {
        const allQuery = { query: '', limit: 1000, offset: 0 };
        const { entries } = await this.searchEngine.search(allQuery);
        const collaborations = new Map();
        entries.forEach(entry => {
            if (entry.metadata.agents.length >= 2) {
                const sortedAgents = entry.metadata.agents.sort().join(',');
                if (!collaborations.has(sortedAgents)) {
                    collaborations.set(sortedAgents, { count: 0, entries: [] });
                }
                const group = collaborations.get(sortedAgents);
                group.count++;
                group.entries.push(entry);
            }
        });
        return Array.from(collaborations.entries())
            .map(([agents, group]) => ({
            agents: agents.split(','),
            frequency: group.count,
            contexts: group.entries
        }))
            .filter(group => group.frequency >= 3)
            .sort((a, b) => b.frequency - a.frequency);
    }
    // Analytics and Statistics
    async getStatistics() {
        return await this.storage.getStatistics();
    }
    async getAgentActivity(agent, days = 30) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        const query = {
            query: '',
            agents: [agent],
            dateRange: { from: fromDate },
            limit: 1000,
            offset: 0
        };
        const { entries } = await this.searchEngine.search(query);
        const contextsByType = {};
        const tagCounts = {};
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
    getCurrentSession() {
        return this.currentSession;
    }
    setSessionContext(key, value) {
        this.sessionContext.set(key, value);
    }
    getSessionContext(key) {
        return this.sessionContext.get(key);
    }
    // Relationship Management
    async addRelationship(fromId, toId, type, strength = 0.5) {
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
    async cleanupOldEntries(daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const allQuery = {
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
    async close() {
        await this.storage.close();
    }
}
exports.ContextEngineeringSystem = ContextEngineeringSystem;
//# sourceMappingURL=context-system.js.map