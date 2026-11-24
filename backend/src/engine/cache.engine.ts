
import type { CDNContent, CachePolicy } from "../types/cdn.types.js";

interface CacheEntry {
  content: CDNContent;
  insertedAt: number;
  lastAccessedAt: number;
  frequency: number;
  expiresAt: number;
}

export class EdgeCache {
  private store = new Map<string, CacheEntry>();

  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(
    private readonly capacity: number,
    private readonly policy: CachePolicy,
    private readonly ttlMs: number
  ) {
    if (capacity < 1 || ttlMs <= 0) {
      throw new Error("Capacity and TTL must be positive");
    }
  }

  get(contentId: string): CDNContent | null {
    const entry = this.store.get(contentId);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(contentId);
      this.misses++;
      return null;
    }

    entry.lastAccessedAt = Date.now();
    entry.frequency++;

    this.hits++;

    return entry.content;
  }

  set(content: CDNContent): void {
    const now = Date.now();

    this.removeExpired();

    const existing = this.store.get(content.id);

    if (existing) {
      existing.content = content;
      existing.expiresAt = now + this.ttlMs;
      return;
    }

    if (this.store.size >= this.capacity) {
      this.evict();
    }

    this.store.set(content.id, {
      content,
      insertedAt: now,
      lastAccessedAt: now,
      frequency: 1,
      expiresAt: now + this.ttlMs
    });
  }

  private removeExpired(): void {
    const now = Date.now();

    for (const [id, entry] of this.store) {
      if (now >= entry.expiresAt) {
        this.store.delete(id);
      }
    }
  }

  private evict(): void {
    let victimId: string | null = null;
    let victimEntry: CacheEntry | null = null;

    for (const [id, entry] of this.store) {
      if (!victimEntry) {
        victimId = id;
        victimEntry = entry;
        continue;
      }

      let shouldReplace = false;

      if (this.policy === "LRU") {
        shouldReplace =
          entry.lastAccessedAt < victimEntry.lastAccessedAt;
      }

      if (this.policy === "LFU") {
        shouldReplace =
          entry.frequency < victimEntry.frequency ||
          (entry.frequency === victimEntry.frequency &&
            entry.insertedAt < victimEntry.insertedAt);
      }

      if (this.policy === "FIFO") {
        shouldReplace =
          entry.insertedAt < victimEntry.insertedAt;
      }

      if (shouldReplace) {
        victimId = id;
        victimEntry = entry;
      }
    }

    if (victimId !== null) {
      this.store.delete(victimId);
      this.evictions++;
    }
  }

  invalidate(contentId: string): boolean {
    return this.store.delete(contentId);
  }

  getStats() {
    this.removeExpired();

    return {
      policy: this.policy,
      capacity: this.capacity,
      currentSize: this.store.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatio:
        this.hits + this.misses === 0
          ? 0
          : this.hits / (this.hits + this.misses)
    };
  }
}
