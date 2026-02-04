import { ContextEntry, ContextStats, SearchQuery } from '../types';
export declare class ContextStorage {
    private db;
    private initialized;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    store(entry: ContextEntry): Promise<void>;
    retrieve(id: string): Promise<ContextEntry | null>;
    query(searchQuery: SearchQuery): Promise<{
        entries: ContextEntry[];
        total: number;
    }>;
    getStatistics(): Promise<ContextStats>;
    delete(id: string): Promise<boolean>;
    update(entry: ContextEntry): Promise<void>;
    private parseRowToEntry;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map