import { EdgeCache } from "../engine/cache.engine.js";
class CacheManager {
    caches = new Map();
    policies = {
        "edge-delhi": "LRU",
        "edge-mumbai": "LFU",
        "edge-bengaluru": "FIFO"
    };
    constructor() {
        this.initializeCaches();
    }
    initializeCaches() {
        for (const [edgeId, policy] of Object.entries(this.policies)) {
            this.caches.set(edgeId, new EdgeCache(2, policy, 300000));
        }
    }
    getCache(edgeId) {
        return this.caches.get(edgeId);
    }
    getContent(edgeId, contentId) {
        const cache = this.getCache(edgeId);
        if (!cache) {
            throw new Error(`Edge cache not found: ${edgeId}`);
        }
        return cache.get(contentId);
    }
    cacheContent(edgeId, content) {
        const cache = this.getCache(edgeId);
        if (!cache) {
            throw new Error(`Edge cache not found: ${edgeId}`);
        }
        cache.set(content);
    }
    invalidateContent(edgeId, contentId) {
        const cache = this.getCache(edgeId);
        if (!cache)
            return false;
        return cache.invalidate(contentId);
    }
    getAllStats() {
        const stats = {};
        for (const [edgeId, cache] of this.caches) {
            stats[edgeId] = cache.getStats();
        }
        return stats;
    }
}
export const cacheManager = new CacheManager();
//# sourceMappingURL=cache-manager.service.js.map