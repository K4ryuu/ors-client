import type { CacheAdapter, CacheKeyContext } from './types/common.js';

interface Entry {
   value:     unknown;
   expiresAt: number;
}

// Simple in-memory cache with TTL - good enough for most use cases
export class MemoryCache implements CacheAdapter {
   private readonly store = new Map<string, Entry>();

   get(key: string): unknown {
      const entry = this.store.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expiresAt) {
         this.store.delete(key);
         return null;
      }

      return entry.value;
   }

   set(key: string, value: unknown, ttl: number): void {
      this.store.set(key, { value, expiresAt: Date.now() + ttl });
   }

   get size(): number { return this.store.size; }
   clear(): void      { this.store.clear();    }
}

// Default key builder - method + endpoint + optional params/body, colon-separated
export function defaultBuildKey(ctx: CacheKeyContext): string {
   const parts: string[] = [ctx.method, ctx.endpoint];

   if (ctx.params) parts.push(JSON.stringify(ctx.params));
   if (ctx.body)   parts.push(JSON.stringify(ctx.body));

   return parts.join(':');
}
