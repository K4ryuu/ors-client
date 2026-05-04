import type { CacheAdapter, CacheKeyContext } from "./types/common.js";

interface Entry {
   value: unknown;
   expiresAt: number;
}

/**
 * Simple in-memory cache with TTL - good enough for most use cases.
 * Automatically evicts expired entries on read so you don't need a background job.
 */
export class MemoryCache implements CacheAdapter {
   private readonly store = new Map<string, Entry>();

   /**
    * Returns the cached value if it exists and hasn't expired, otherwise null.
    *
    * @param key - Cache key to look up
    * @returns The cached value, or null on miss/expiry
    */
   get(key: string): unknown {
      const entry = this.store.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expiresAt) {
         this.store.delete(key);
         return null;
      }

      return entry.value;
   }

   /**
    * Stores a value with a TTL.
    *
    * @param key - Cache key
    * @param value - Value to cache
    * @param ttl - Time-to-live in milliseconds
    */
   set(key: string, value: unknown, ttl: number): void {
      this.store.set(key, { value, expiresAt: Date.now() + ttl });
   }

   /** Number of entries currently in the cache (includes not-yet-evicted expired ones). */
   get size(): number {
      return this.store.size;
   }

   /** Clears all cached entries. */
   clear(): void {
      this.store.clear();
   }
}

/**
 * Default cache key builder - joins method, endpoint, params, and body with colons.
 * Works fine for most cases. Override via `CacheConfig.buildKey` if you need something custom.
 *
 * @param ctx - Full request context used to build the key
 * @returns A deterministic string key for the request
 */
export function defaultBuildKey(ctx: CacheKeyContext): string {
   const parts: string[] = [ctx.method, ctx.endpoint];

   if (ctx.params) parts.push(JSON.stringify(ctx.params));
   if (ctx.body) parts.push(JSON.stringify(ctx.body));

   return parts.join(":");
}
