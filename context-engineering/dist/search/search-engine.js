"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSearch = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
class ContextSearch {
    storage;
    fuseIndex = null;
    lastIndexUpdate = null;
    constructor(storage) {
        this.storage = storage;
    }
    async initialize() {
        await this.rebuildIndex();
    }
    async search(query) {
        const startTime = Date.now();
        // Use database query for complex filters first
        let { entries, total } = await this.storage.query(query);
        // Apply fuzzy search if text query provided
        if (query.query && query.query.trim()) {
            entries = this.performFuzzySearch(entries, query.query);
        }
        // Apply additional filtering and ranking
        entries = this.rankResults(entries, query);
        const executionTime = Date.now() - startTime;
        return {
            entries,
            total,
            query,
            executionTime
        };
    }
    async findRelated(entryId, limit = 10) {
        const entry = await this.storage.retrieve(entryId);
        if (!entry)
            return [];
        // Find entries with similar tags, agents, or content
        const relatedQuery = {
            query: '',
            types: [entry.type],
            agents: entry.metadata.agents,
            tags: entry.metadata.tags.slice(0, 5), // Limit to top 5 tags
            limit: limit * 2, // Get more to filter down
            offset: 0
        };
        const { entries } = await this.storage.query(relatedQuery);
        // Rank by similarity
        const scored = entries.map(e => ({
            entry: e,
            score: this.calculateSimilarity(entry, e)
        })).filter(item => item.score > 0.1); // Filter low similarity
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.entry);
    }
    async discoverPatterns(limit = 20) {
        const allQuery = { query: '', limit: 1000, offset: 0 };
        const { entries } = await this.storage.query(allQuery);
        const patterns = [];
        // Pattern 1: Common tag combinations
        const tagGroups = this.findCommonTagCombinations(entries);
        tagGroups.forEach(group => {
            patterns.push({
                pattern: `Common tags: ${group.tags.join(', ')}`,
                confidence: group.frequency / entries.length,
                entries: group.entries
            });
        });
        // Pattern 2: Agent collaboration patterns
        const agentCollaborations = this.findAgentCollaborationPatterns(entries);
        agentCollaborations.forEach(collab => {
            patterns.push({
                pattern: `Agent collaboration: ${collab.agents.join(' + ')}`,
                confidence: collab.frequency / entries.length,
                entries: collab.entries
            });
        });
        // Pattern 3: Content similarities
        const contentPatterns = this.findContentPatterns(entries);
        patterns.push(...contentPatterns);
        return patterns
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);
    }
    async rebuildIndex() {
        const allQuery = { query: '', limit: 10000, offset: 0 };
        const { entries } = await this.storage.query(allQuery);
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 2.0 },
                { name: 'content', weight: 1.5 },
                { name: 'metadata.tags', weight: 1.0 }
            ],
            threshold: 0.4,
            includeScore: true,
            includeMatches: true
        };
        this.fuseIndex = new fuse_js_1.default(entries, fuseOptions);
        this.lastIndexUpdate = new Date();
    }
    performFuzzySearch(entries, query) {
        if (!this.fuseIndex) {
            return entries.filter(entry => entry.title.toLowerCase().includes(query.toLowerCase()) ||
                entry.content.toLowerCase().includes(query.toLowerCase()));
        }
        const results = this.fuseIndex.search(query);
        return results.map((result) => result.item);
    }
    rankResults(entries, query) {
        return entries.map(entry => ({
            entry,
            score: this.calculateRelevanceScore(entry, query)
        }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.entry);
    }
    calculateRelevanceScore(entry, query) {
        let score = entry.metadata.confidence;
        // Boost based on recency
        const daysSinceUpdate = (Date.now() - entry.metadata.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        score *= Math.exp(-daysSinceUpdate / 365); // Decay over a year
        // Boost based on priority
        const priorityBoosts = { low: 0.8, medium: 1.0, high: 1.2, critical: 1.5 };
        score *= priorityBoosts[entry.metadata.priority];
        // Boost if matches query agents
        if (query.agents && query.agents.length > 0) {
            const matchingAgents = query.agents.filter(agent => entry.metadata.agents.includes(agent)).length;
            score *= (1 + matchingAgents * 0.2);
        }
        // Boost if matches query tags
        if (query.tags && query.tags.length > 0) {
            const matchingTags = query.tags.filter(tag => entry.metadata.tags.includes(tag)).length;
            score *= (1 + matchingTags * 0.1);
        }
        return score;
    }
    calculateSimilarity(entry1, entry2) {
        let similarity = 0;
        // Tag similarity
        const commonTags = entry1.metadata.tags.filter(tag => entry2.metadata.tags.includes(tag)).length;
        const totalTags = new Set([...entry1.metadata.tags, ...entry2.metadata.tags]).size;
        similarity += (commonTags / totalTags) * 0.3;
        // Agent similarity
        const commonAgents = entry1.metadata.agents.filter(agent => entry2.metadata.agents.includes(agent)).length;
        const totalAgents = new Set([...entry1.metadata.agents, ...entry2.metadata.agents]).size;
        similarity += (commonAgents / totalAgents) * 0.2;
        // Type similarity
        if (entry1.type === entry2.type) {
            similarity += 0.2;
        }
        // Content similarity (simple keyword overlap)
        const words1 = new Set(entry1.content.toLowerCase().split(/\s+/));
        const words2 = new Set(entry2.content.toLowerCase().split(/\s+/));
        const commonWords = [...words1].filter(word => words2.has(word)).length;
        const totalWords = new Set([...words1, ...words2]).size;
        similarity += (commonWords / totalWords) * 0.3;
        return similarity;
    }
    findCommonTagCombinations(entries) {
        const tagCombinations = new Map();
        entries.forEach(entry => {
            if (entry.metadata.tags.length >= 2) {
                // Find all pairs of tags
                for (let i = 0; i < entry.metadata.tags.length - 1; i++) {
                    for (let j = i + 1; j < entry.metadata.tags.length; j++) {
                        const combo = [entry.metadata.tags[i], entry.metadata.tags[j]].sort().join(',');
                        if (!tagCombinations.has(combo)) {
                            tagCombinations.set(combo, { count: 0, entries: [] });
                        }
                        const group = tagCombinations.get(combo);
                        group.count++;
                        group.entries.push(entry);
                    }
                }
            }
        });
        return Array.from(tagCombinations.entries())
            .map(([tags, group]) => ({
            tags: tags.split(','),
            frequency: group.count,
            entries: group.entries
        }))
            .filter(group => group.frequency >= 2) // Only show patterns that appear at least twice
            .sort((a, b) => b.frequency - a.frequency);
    }
    findAgentCollaborationPatterns(entries) {
        const agentGroups = new Map();
        entries.forEach(entry => {
            if (entry.metadata.agents.length >= 2) {
                const sortedAgents = entry.metadata.agents.sort().join(',');
                if (!agentGroups.has(sortedAgents)) {
                    agentGroups.set(sortedAgents, { count: 0, entries: [] });
                }
                const group = agentGroups.get(sortedAgents);
                group.count++;
                group.entries.push(entry);
            }
        });
        return Array.from(agentGroups.entries())
            .map(([agents, group]) => ({
            agents: agents.split(','),
            frequency: group.count,
            entries: group.entries
        }))
            .filter(group => group.frequency >= 2)
            .sort((a, b) => b.frequency - a.frequency);
    }
    findContentPatterns(entries) {
        const patterns = [];
        // Find common keywords in titles
        const titleWords = new Map();
        entries.forEach(entry => {
            const words = entry.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) { // Ignore short words
                    if (!titleWords.has(word)) {
                        titleWords.set(word, []);
                    }
                    titleWords.get(word).push(entry);
                }
            });
        });
        titleWords.forEach((entryList, word) => {
            if (entryList.length >= 3) {
                patterns.push({
                    pattern: `Common title keyword: "${word}"`,
                    confidence: entryList.length / entries.length,
                    entries: entryList
                });
            }
        });
        return patterns.sort((a, b) => b.confidence - a.confidence);
    }
}
exports.ContextSearch = ContextSearch;
//# sourceMappingURL=search-engine.js.map