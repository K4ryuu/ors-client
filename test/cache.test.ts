import { describe, test, expect, mock, afterEach } from 'bun:test';
import { OpenRouteService } from '../src/index.js';
import { MemoryCache, defaultBuildKey } from '../src/cache.js';
import type { CacheAdapter, CacheKeyContext } from '../src/index.js';

const MOCK_ROUTE    = { routes: [{ summary: { distance: 1000, duration: 60 } }] };
const MOCK_GEOCODE  = { type: 'FeatureCollection', features: [{ properties: { name: 'Berlin' } }] };

function makeFetch(data: unknown, ok = true, status = 200) {
   return mock(async () => ({
      ok,
      status,
      headers: { get: (_: string) => null },
      json:    async () => data,
      text:    async () => JSON.stringify(data),
   }));
}

function mockAdapter(store: Map<string, unknown> = new Map()): CacheAdapter & { store: Map<string, unknown> } {
   return {
      store,
      get: mock((key: string) => store.get(key) ?? null),
      set: mock((key: string, value: unknown) => { store.set(key, value); }),
   };
}

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe('MemoryCache', () => {
   test('returns null for missing key', () => {
      const cache = new MemoryCache();
      expect(cache.get('missing')).toBeNull();
   });

   test('stores and retrieves value', () => {
      const cache = new MemoryCache();
      cache.set('k', { foo: 'bar' }, 60_000);
      expect(cache.get('k')).toEqual({ foo: 'bar' });
   });

   test('returns null after TTL expires', async () => {
      const cache = new MemoryCache();
      cache.set('k', 'value', 10); // 10ms TTL
      await Bun.sleep(20);
      expect(cache.get('k')).toBeNull();
   });

   test('evicts expired entry from store', async () => {
      const cache = new MemoryCache();
      cache.set('k', 'value', 10);
      await Bun.sleep(20);
      cache.get('k'); // triggers eviction
      expect(cache.size).toBe(0);
   });

   test('clear removes all entries', () => {
      const cache = new MemoryCache();
      cache.set('a', 1, 60_000);
      cache.set('b', 2, 60_000);
      cache.clear();
      expect(cache.size).toBe(0);
   });
});

describe('defaultBuildKey', () => {
   test('includes method and endpoint', () => {
      const key = defaultBuildKey({ method: 'POST', endpoint: '/directions/driving-car' });
      expect(key).toContain('POST');
      expect(key).toContain('/directions/driving-car');
   });

   test('different bodies produce different keys', () => {
      const ctx = (body: unknown): CacheKeyContext => ({ method: 'POST', endpoint: '/directions/driving-car', body });
      const k1 = defaultBuildKey(ctx({ coordinates: [[1, 2], [3, 4]] }));
      const k2 = defaultBuildKey(ctx({ coordinates: [[5, 6], [7, 8]] }));
      expect(k1).not.toBe(k2);
   });

   test('same inputs produce same key', () => {
      const ctx: CacheKeyContext = { method: 'GET', endpoint: '/geocode/search', params: { text: 'Berlin' } };
      expect(defaultBuildKey(ctx)).toBe(defaultBuildKey(ctx));
   });
});

describe('Client — number shorthand cache', () => {
   test('second identical request is served from cache', async () => {
      const fetchMock = makeFetch(MOCK_ROUTE);
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      const client = new OpenRouteService({ apiKey: 'test', cache: 60_000 });

      await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });
      await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(fetchMock).toHaveBeenCalledTimes(1);
   });

   test('different endpoints are cached independently', async () => {
      const fetchMock = makeFetch(MOCK_ROUTE);
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      const client = new OpenRouteService({ apiKey: 'test', cache: 60_000 });

      await client.directions.calculateRoute('driving-car',   { coordinates: [[8.68, 49.41], [8.69, 49.42]] });
      await client.directions.calculateRoute('foot-walking',  { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(fetchMock).toHaveBeenCalledTimes(2);
   });
});

describe('Client — custom adapter', () => {
   test('calls adapter.get and adapter.set', async () => {
      globalThis.fetch = makeFetch(MOCK_ROUTE) as unknown as typeof globalThis.fetch;
      const adapter = mockAdapter();

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000 } });
      await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(adapter.get).toHaveBeenCalledTimes(1);
      expect(adapter.set).toHaveBeenCalledTimes(1);
   });

   test('cache hit skips fetch entirely', async () => {
      const fetchMock = makeFetch(MOCK_ROUTE);
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      const store = new Map<string, unknown>([
         ['POST:/directions/driving-car:{"coordinates":[[8.68,49.41],[8.69,49.42]]}', MOCK_ROUTE],
      ]);
      const adapter = mockAdapter(store);

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000 } });
      const result = await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toMatchObject(MOCK_ROUTE);
   });

   test('error responses are not cached', async () => {
      globalThis.fetch = makeFetch({ error: { code: 2009, message: 'Invalid coordinates' } }, false, 400) as unknown as typeof globalThis.fetch;
      const adapter = mockAdapter();

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000 } });
      await client.directions.calculateRoute('driving-car', { coordinates: [[200, 200], [201, 201]] }).catch(() => {});

      expect(adapter.set).not.toHaveBeenCalled();
   });

   test('custom buildKey is used for key generation', async () => {
      globalThis.fetch = makeFetch(MOCK_GEOCODE) as unknown as typeof globalThis.fetch;
      const adapter  = mockAdapter();
      const buildKey = mock((_ctx: CacheKeyContext) => 'my-custom-key');

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000, buildKey } });
      await client.geocoding.search({ text: 'Berlin', size: 5 });

      expect(buildKey).toHaveBeenCalledTimes(1);
      expect(adapter.set).toHaveBeenCalledWith('my-custom-key', expect.anything(), 30_000);
   });

   test('cache.get throwing falls through to fetch', async () => {
      const fetchMock = makeFetch(MOCK_ROUTE);
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      const adapter: CacheAdapter = {
         get: mock(() => { throw new Error('Redis down'); }),
         set: mock(() => {}),
      };

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000 } });
      const result = await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(MOCK_ROUTE);
   });

   test('cache.set throwing does not break the request', async () => {
      globalThis.fetch = makeFetch(MOCK_ROUTE) as unknown as typeof globalThis.fetch;

      const adapter: CacheAdapter = {
         get: mock(() => null),
         set: mock(() => { throw new Error('Redis down'); }),
      };

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 30_000 } });
      const result = await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(result).toMatchObject(MOCK_ROUTE);
   });

   test('TTL is passed to adapter.set', async () => {
      globalThis.fetch = makeFetch(MOCK_ROUTE) as unknown as typeof globalThis.fetch;
      const adapter = mockAdapter();

      const client = new OpenRouteService({ apiKey: 'test', cache: { adapter, ttl: 120_000 } });
      await client.directions.calculateRoute('driving-car', { coordinates: [[8.68, 49.41], [8.69, 49.42]] });

      expect(adapter.set).toHaveBeenCalledWith(expect.any(String), expect.anything(), 120_000);
   });
});
