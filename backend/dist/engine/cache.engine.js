export class EdgeCache {
    capacity;
    policy;
    ttlMs;
    store = new Map();
    hits = 0;
    misses = 0;
    evictions = 0;
    constructor(capacity, policy, ttlMs) {
        this.capacity = capacity;
        this.policy = policy;
        this.ttlMs = ttlMs;
        if (capacity < 1 || ttlMs <= 0) {
            throw new Error("Capacity and TTL must be positive");
        }
    }
    get(contentId) {
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
    set(content) {
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
    removeExpired() {
        const now = Date.now();
        for (const [id, entry] of this.store) {
            if (now >= entry.expiresAt) {
                this.store.delete(id);
            }
        }
    }
    evict() {
        let victimId = null;
        let victimEntry = null;
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
    invalidate(contentId) {
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
            hitRatio: this.hits + this.misses === 0
                ? 0
                : this.hits / (this.hits + this.misses)
        };
    }
}
//# sourceMappingURL=cache.engine.js.map