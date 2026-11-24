import { EdgeCache } from "../engine/cache.engine.js";
import type {
  CDNContent,
  CachePolicy
} from "../types/cdn.types.js";

class CacheManager {
  private caches = new Map<string, EdgeCache>();

  private policies: Record<string, CachePolicy> = {
    "edge-delhi": "LRU",
    "edge-mumbai": "LFU",
    "edge-bengaluru": "FIFO"
  };

  constructor() {
    this.initializeCaches();
  }

  private initializeCaches(): void {
    for (const [edgeId, policy] of Object.entries(this.policies)) {
      this.caches.set(
        edgeId,
        new EdgeCache(2, policy, 300000)
      );
    }
  }

  getCache(edgeId: string): EdgeCache | undefined {
    return this.caches.get(edgeId);
  }

  getContent(
    edgeId: string,
    contentId: string
  ): CDNContent | null {
    const cache = this.getCache(edgeId);

    if (!cache) {
      throw new Error(`Edge cache not found: ${edgeId}`);
    }

    return cache.get(contentId);
  }

  cacheContent(
    edgeId: string,
    content: CDNContent
  ): void {
    const cache = this.getCache(edgeId);

    if (!cache) {
      throw new Error(`Edge cache not found: ${edgeId}`);
    }

    cache.set(content);
  }

  invalidateContent(
    edgeId: string,
    contentId: string
  ): boolean {
    const cache = this.getCache(edgeId);

    if (!cache) return false;

    return cache.invalidate(contentId);
  }

  getAllStats() {
    const stats: Record<string, ReturnType<EdgeCache["getStats"]>> = {};

    for (const [edgeId, cache] of this.caches) {
      stats[edgeId] = cache.getStats();
    }

    return stats;
  }
}

export const cacheManager = new CacheManager();
