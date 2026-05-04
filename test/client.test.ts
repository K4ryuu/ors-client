import { describe, test, expect, mock, afterEach, beforeEach } from 'bun:test';
import { OpenRouteServiceClient, OpenRouteServiceError } from '../src/client.js';

// Minimal concrete subclass so we can call protected methods
class TestClient extends OpenRouteServiceClient {
   constructor(config: Record<string, unknown> = {}, apiVersion = 2) {
      // only inject default apiKey when there's no custom baseUrl (self-hosted doesn't need one)
      const defaults = config.baseUrl && !config.apiKey ? {} : { apiKey: 'test-key' };
      super({ ...defaults, ...config } as never, apiVersion);
   }
   callGet<T>(endpoint: string, params?: Record<string, unknown>) {
      return this.get<T>(endpoint, params);
   }
   callPost<T>(endpoint: string, body?: unknown) {
      return this.post<T>(endpoint, body);
   }
   callGetThrottled<T>(endpoint: string, params?: Record<string, unknown>) {
      return this.getWithGeocodingThrottle<T>(endpoint, params);
   }
}

function makeFetch(data: unknown, ok = true, status = 200, headers: Record<string, string> = {}) {
   return mock(async () => ({
      ok,
      status,
      headers: { get: (key: string) => headers[key] ?? null },
      json:    async () => data,
      text:    async () => JSON.stringify(data),
   }));
}

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe('OpenRouteServiceClient - constructor', () => {
   test('throws if no API key for public API', () => {
      expect(() => new OpenRouteServiceClient({ apiKey: '' })).toThrow(OpenRouteServiceError);
   });

   test('throws if placeholder API key used', () => {
      expect(() => new OpenRouteServiceClient({ apiKey: 'your-api-key-here' })).toThrow(OpenRouteServiceError);
   });

   test('does not throw if baseUrl provided without API key', () => {
      expect(() => new OpenRouteServiceClient({ baseUrl: 'http://localhost:8080' })).not.toThrow();
   });

   test('v2 baseUrl appends /v2', () => {
      const client = new TestClient({}, 2);
      expect((client as never as { baseUrl: string }).baseUrl).toContain('/v2');
   });

   test('v1 baseUrl has no version segment', () => {
      const client = new TestClient({}, 1);
      expect((client as never as { baseUrl: string }).baseUrl).not.toContain('/v2');
   });

   test('custom baseUrl strips trailing slash', () => {
      const client = new TestClient({ baseUrl: 'http://localhost:8080/' }, 2);
      expect((client as never as { baseUrl: string }).baseUrl).toBe('http://localhost:8080/v2');
   });
});

describe('OpenRouteServiceClient - HTTP error mapping', () => {
   const cases: [number, string][] = [
      [400, 'Bad Request'],
      [404, 'Not Found'],
      [405, 'Method Not Allowed'],
      [413, 'Payload Too Large'],
      [500, 'Internal Server Error'],
      [501, 'Not Implemented'],
      [503, 'Service Unavailable'],
      [418, 'HTTP 418'],
   ];

   for (const [status, label] of cases) {
      test(`${status} throws with correct message`, async () => {
         globalThis.fetch = makeFetch({}, false, status) as unknown as typeof globalThis.fetch;
         const err = await new TestClient().callGet('/test').catch(e => e);
         expect(err).toBeInstanceOf(OpenRouteServiceError);
         expect(err.statusCode).toBe(status);
         expect(err.message).toContain(label);
      });
   }
});

describe('OpenRouteServiceError - helpers', () => {
   test('isBadRequest',        () => expect(new OpenRouteServiceError('', 400).isBadRequest()).toBe(true));
   test('isNotFound',          () => expect(new OpenRouteServiceError('', 404).isNotFound()).toBe(true));
   test('isMethodNotAllowed',  () => expect(new OpenRouteServiceError('', 405).isMethodNotAllowed()).toBe(true));
   test('isPayloadTooLarge',   () => expect(new OpenRouteServiceError('', 413).isPayloadTooLarge()).toBe(true));
   test('isRateLimited',       () => expect(new OpenRouteServiceError('', 429).isRateLimited()).toBe(true));
   test('isServerError',       () => expect(new OpenRouteServiceError('', 500).isServerError()).toBe(true));
   test('isNotImplemented',    () => expect(new OpenRouteServiceError('', 501).isNotImplemented()).toBe(true));
   test('isServiceUnavailable',() => expect(new OpenRouteServiceError('', 503).isServiceUnavailable()).toBe(true));

   test('getRemainingRequests returns 0 with no rate limit info', () => {
      expect(new OpenRouteServiceError('').getRemainingRequests()).toBe(0);
   });

   test('getRemainingRequests returns value from rateLimitInfo', () => {
      const err = new OpenRouteServiceError('', 429, undefined, { limit: 100, remaining: 42, reset: 0 });
      expect(err.getRemainingRequests()).toBe(42);
   });
});

describe('OpenRouteServiceClient - rate limit headers', () => {
   test('parses x-ratelimit headers and stores them', async () => {
      globalThis.fetch = makeFetch({}, true, 200, {
         'x-ratelimit-limit':     '40',
         'x-ratelimit-remaining': '39',
         'x-ratelimit-reset':     '1700000000',
      }) as unknown as typeof globalThis.fetch;

      const client = new TestClient();
      await client.callGet('/test');

      const info = client.getLastRateLimitInfo();
      expect(info?.limit).toBe(40);
      expect(info?.remaining).toBe(39);
      expect(info?.reset).toBeInstanceOf(Date);
      expect(info?.requestTimestamp).toBeInstanceOf(Date);
   });

   test('does not store rate limit info when limit header is 0', async () => {
      globalThis.fetch = makeFetch({}) as unknown as typeof globalThis.fetch;
      const client = new TestClient();
      await client.callGet('/test');
      expect(client.getLastRateLimitInfo()).toBeUndefined();
   });

   test('rate limit info attached to error on 429', async () => {
      globalThis.fetch = makeFetch({}, false, 429, {
         'x-ratelimit-limit':     '40',
         'x-ratelimit-remaining': '0',
         'x-ratelimit-reset':     '1700000000',
      }) as unknown as typeof globalThis.fetch;

      const err = await new TestClient().callGet('/test').catch(e => e);
      expect(err.isRateLimited()).toBe(true);
      expect(err.getRemainingRequests()).toBe(0);
      expect(err.getRateLimitInfo()?.limit).toBe(40);
   });
});

describe('OpenRouteServiceClient - network errors', () => {
   test('wraps network error in OpenRouteServiceError', async () => {
      globalThis.fetch = mock(async () => { throw new Error('ECONNREFUSED'); }) as unknown as typeof globalThis.fetch;
      const err = await new TestClient().callGet('/test').catch(e => e);
      expect(err).toBeInstanceOf(OpenRouteServiceError);
      expect(err.message).toContain('Network error');
      expect(err.message).toContain('ECONNREFUSED');
   });

   test('AbortError becomes a timeout OpenRouteServiceError', async () => {
      globalThis.fetch = mock(async () => {
         const e = new Error('The operation was aborted.');
         e.name = 'AbortError';
         throw e;
      }) as unknown as typeof globalThis.fetch;

      const err = await new TestClient({ timeout: 100 }).callGet('/test').catch(e => e);
      expect(err).toBeInstanceOf(OpenRouteServiceError);
      expect(err.message).toContain('timeout');
   });
});

describe('OpenRouteServiceClient - error body parsing', () => {
   test('appends API error message from JSON body', async () => {
      globalThis.fetch = mock(async () => ({
         ok:      false,
         status:  400,
         headers: { get: () => null },
         text:    async () => JSON.stringify({ error: { message: 'Invalid coordinates' } }),
         json:    async () => ({ error: { message: 'Invalid coordinates' } }),
      })) as unknown as typeof globalThis.fetch;

      const err = await new TestClient().callGet('/test').catch(e => e);
      expect(err.message).toContain('Invalid coordinates');
   });

   test('handles non-JSON error body gracefully', async () => {
      globalThis.fetch = mock(async () => ({
         ok:      false,
         status:  500,
         headers: { get: () => null },
         text:    async () => 'plain text error',
         json:    async () => { throw new Error('not json'); },
      })) as unknown as typeof globalThis.fetch;

      const err = await new TestClient().callGet('/test').catch(e => e);
      expect(err).toBeInstanceOf(OpenRouteServiceError);
      expect(err.statusCode).toBe(500);
   });
});

describe('OpenRouteServiceClient - GET query string', () => {
   function captureFetch() {
      let capturedUrl = '';
      let capturedInit: RequestInit = {};
      globalThis.fetch = mock(async (url: string, init: RequestInit) => {
         capturedUrl = url;
         capturedInit = init;
         return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({}) };
      }) as unknown as typeof globalThis.fetch;
      return { getUrl: () => capturedUrl, getInit: () => capturedInit };
   }

   test('appends scalar params as query string', async () => {
      const { getUrl } = captureFetch();
      await new TestClient().callGet('/test', { text: 'Berlin', size: 5 });
      expect(getUrl()).toContain('text=Berlin');
      expect(getUrl()).toContain('size=5');
   });

   test('joins array params with commas', async () => {
      const { getUrl } = captureFetch();
      await new TestClient().callGet('/test', { metrics: ['duration', 'distance'] });
      expect(getUrl()).toContain('metrics=duration%2Cdistance');
   });

   test('skips null and undefined params', async () => {
      const { getUrl } = captureFetch();
      await new TestClient().callGet('/test', { a: 'hello', b: null, c: undefined });
      expect(getUrl()).toContain('a=hello');
      expect(getUrl()).not.toContain('b=');
      expect(getUrl()).not.toContain('c=');
   });
});

describe('OpenRouteServiceClient - auth headers', () => {
   function captureFetch() {
      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
         capturedHeaders = init.headers as Record<string, string>;
         return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({}) };
      }) as unknown as typeof globalThis.fetch;
      return () => capturedHeaders;
   }

   test('sends Authorization header with API key', async () => {
      const getHeaders = captureFetch();
      await new TestClient({ apiKey: 'my-secret-key' }).callGet('/test');
      expect(getHeaders()['Authorization']).toBe('my-secret-key');
   });

   test('no Authorization header when using custom baseUrl without key', async () => {
      const getHeaders = captureFetch();
      await new TestClient({ baseUrl: 'http://localhost:8080' }).callGet('/test');
      expect(getHeaders()['Authorization']).toBeUndefined();
   });
});

describe('OpenRouteServiceClient - geocoding throttle', () => {
   beforeEach(() => {
      // reset static throttle state
      (OpenRouteServiceClient as never as { lastGeocodingRequests: Map<unknown, unknown> })
         .lastGeocodingRequests = new Map();
   });

   test('second call to same endpoint is delayed ~300ms', async () => {
      globalThis.fetch = makeFetch({}) as unknown as typeof globalThis.fetch;
      const client = new TestClient();
      const t0 = Date.now();
      await client.callGetThrottled('/geocode/search');
      await client.callGetThrottled('/geocode/search');
      expect(Date.now() - t0).toBeGreaterThanOrEqual(270);
   });

   test('different endpoints are not throttled against each other', async () => {
      globalThis.fetch = makeFetch({}) as unknown as typeof globalThis.fetch;
      const client = new TestClient();
      const t0 = Date.now();
      await client.callGetThrottled('/geocode/search');
      await client.callGetThrottled('/geocode/autocomplete');
      expect(Date.now() - t0).toBeLessThan(270);
   });

   test('different API keys throttle independently', async () => {
      globalThis.fetch = makeFetch({}) as unknown as typeof globalThis.fetch;
      const t0 = Date.now();
      await new TestClient({ apiKey: 'key-1' }).callGetThrottled('/geocode/search');
      await new TestClient({ apiKey: 'key-2' }).callGetThrottled('/geocode/search');
      expect(Date.now() - t0).toBeLessThan(270);
   });
});
