import { ContextEntry, SearchQuery, SearchResult } from '../types';
import { ContextStorage } from '../storage/database';
export declare class ContextSearch {
    private storage;
    private fuseIndex;
    private lastIndexUpdate;
    constructor(storage: ContextStorage);
    initialize(): Promise<void>;
    search(query: SearchQuery): Promise<SearchResult>;
    findRelated(entryId: string, limit?: number): Promise<ContextEntry[]>;
    discoverPatterns(limit?: number): Promise<Array<{
        pattern: string;
        confidence: number;
        entries: ContextEntry[];
    }>>;
    rebuildIndex(): Promise<void>;
    private performFuzzySearch;
    private rankResults;
    private calculateRelevanceScore;
    private calculateSimilarity;
    private findCommonTagCombinations;
    private findAgentCollaborationPatterns;
    private findContentPatterns;
}
//# sourceMappingURL=search-engine.d.ts.map