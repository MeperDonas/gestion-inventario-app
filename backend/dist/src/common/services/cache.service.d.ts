export declare class CacheService {
    private cache;
    private defaultTTL;
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl?: number): void;
    delete(key: string): void;
    clear(pattern?: string): void;
    invalidateStaleEntries(): void;
    getStats(): {
        size: number;
        keys: string[];
    };
}
