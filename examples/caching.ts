import { OpenRouteService } from '../src/index.js';
import type { CacheAdapter, CacheKeyContext } from '../src/index.js';

/**
 * Caching Example
 *
 * Three ways to plug in caching — from zero-config in-memory
 * to Redis, a database, or whatever you want really.
 *
 * Get your free API key at https://openrouteservice.org/sign-up/
 * Then set it as: export ORS_API_KEY=your-actual-api-key
 */

const API_KEY = process.env.ORS_API_KEY ?? '';

// Quickest option — just pass a TTL in ms, done
const clientMemory = new OpenRouteService({
   apiKey: API_KEY,
   cache: 6 * 60 * 60_000, // 6h, uses built-in Map-based cache
});

const route = await clientMemory.directions.calculateRoute('driving-car', {
   coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]],
});
console.log('route distance:', route.routes[0]?.summary.distance);

// Same request again — comes straight from cache, no network call
const routeCached = await clientMemory.directions.calculateRoute('driving-car', {
   coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]],
});
console.log('from cache:', routeCached.routes[0]?.summary.distance);


// Redis via ioredis — swap in any backend that fits the adapter interface
// import Redis from 'ioredis';
// const redis = new Redis();
//
// const clientRedis = new OpenRouteService({
//    apiKey: API_KEY,
//    cache: {
//       adapter: {
//          get: async (key) => {
//             const val = await redis.get(key);
//             return val ? JSON.parse(val) : null;
//          },
//          set: async (key, value, ttl) => {
//             await redis.set(key, JSON.stringify(value), 'PX', ttl);
//          },
//       },
//       ttl: 6 * 60 * 60_000, // 6h
//    },
// });


// Custom key builder — handy if you only want to key on specific parts of the request
const clientCustomKey = new OpenRouteService({
   apiKey: API_KEY,
   cache: {
      adapter: {
         get: (_key) => null,           // your storage here
         set: (_key, _val, _ttl) => {}, // your storage here
      },
      ttl: 6 * 60 * 60_000, // 6h
      buildKey: ({ method, endpoint, body }: CacheKeyContext) => {
         // only key on endpoint + coords, ignore everything else
         const coords = (body as { coordinates?: unknown })?.coordinates;
         return `ors:${method}:${endpoint}:${JSON.stringify(coords)}`;
      },
   },
});

void clientCustomKey;


// Database adapter factory — thin wrapper around whatever db client you already have
function createDbAdapter(db: { get: (k: string) => unknown; set: (k: string, v: unknown) => void }): CacheAdapter {
   return {
      get: (key) => db.get(key),
      set: (key, value) => db.set(key, value),
   };
}

void createDbAdapter;
