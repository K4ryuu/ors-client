import type { CacheAdapter, CacheKeyContext, ClientConfig } from "./types/common.js";
import { MemoryCache, defaultBuildKey } from "./cache.js";

/**
 * Thrown whenever the ORS API returns an error response (4xx/5xx) or the request
 * fails at the network level (timeout, DNS, etc.).
 *
 * Use the `is*()` helpers to branch on specific error types without comparing
 * status codes by hand.
 *
 * @example
 * try {
 *   await ors.directions.calculateRoute("driving-car", { coordinates: [...] });
 * } catch (e) {
 *   if (e instanceof OpenRouteServiceError && e.isRateLimited()) {
 *     console.log("Slow down!", e.getRateLimitInfo());
 *   }
 * }
 */
export class OpenRouteServiceError extends Error {
   constructor(
      message: string,
      /** HTTP status code, if the error came from an API response. */
      public statusCode?: number,
      /** Raw parsed response body (or `{ rawResponse: string }` for non-JSON errors). */
      public response?: unknown,
      /** Rate limit headers parsed from the error response. */
      public rateLimitInfo?: { limit: number; remaining: number; reset: number },
   ) {
      super(message);
      this.name = "OpenRouteServiceError";
   }

   // Quick checks for common error types - way easier than checking status codes manually

   /** Returns true if the API rejected the request as malformed (400). */
   isBadRequest(): boolean {
      return this.statusCode === 400;
   }

   /** Returns true if the requested resource wasn't found (404). */
   isNotFound(): boolean {
      return this.statusCode === 404;
   }

   /** Returns true if the HTTP method isn't supported for this endpoint (405). */
   isMethodNotAllowed(): boolean {
      return this.statusCode === 405;
   }

   /** Returns true if the request body was too large for the server (413). */
   isPayloadTooLarge(): boolean {
      return this.statusCode === 413;
   }

   /** Returns true if you've hit the API rate limit (429). Check `getRateLimitInfo()` for reset time. */
   isRateLimited(): boolean {
      return this.statusCode === 429;
   }

   /** Returns true if the ORS server blew up on its end (500). */
   isServerError(): boolean {
      return this.statusCode === 500;
   }

   /** Returns true if the requested feature isn't implemented on the server (501). */
   isNotImplemented(): boolean {
      return this.statusCode === 501;
   }

   /** Returns true if the server is temporarily down or overloaded (503). */
   isServiceUnavailable(): boolean {
      return this.statusCode === 503;
   }

   /**
    * Returns parsed rate limit headers from the error response, or undefined if not available.
    *
    * @returns Rate limit info with `limit`, `remaining`, and `reset` (Unix timestamp)
    */
   getRateLimitInfo() {
      return this.rateLimitInfo;
   }

   /**
    * Shortcut for how many requests you have left before hitting the rate limit.
    *
    * @returns Remaining request count, or 0 if rate limit info isn't available
    */
   getRemainingRequests(): number {
      return this.rateLimitInfo?.remaining || 0;
   }
}

/**
 * Base HTTP client - handles auth, caching, throttling, and error parsing.
 * You probably won't use this directly; use `OpenRouteService` or the individual service classes instead.
 */
export class OpenRouteServiceClient {
   private readonly config: Required<Pick<ClientConfig, "baseUrl" | "timeout" | "headers">> & Pick<ClientConfig, "apiKey">;
   private readonly baseHeaders: Record<string, string>;
   protected readonly baseUrl: string;
   private lastRateLimitInfo?: { limit: number; remaining: number; reset: Date; requestTimestamp: Date };
   private readonly cacheConfig?: { adapter: CacheAdapter; ttl: number; buildKey: (ctx: CacheKeyContext) => string };

   // Throttling for individual geocoding endpoints (each endpoint gets its own throttle per API key)
   // Structure: Map<apiKey, Map<endpoint, timestamp>>
   private static lastGeocodingRequests: Map<string, Map<string, number>> = new Map();
   private static readonly GEOCODING_THROTTLE_MS = 300; // ~3.33 requests/second per endpoint

   /**
    * @param config - Client configuration - API key, base URL, timeout, headers, cache settings
    * @param apiVersion - API version to use (1 or 2). Defaults to 2. Use 1 for geocoding/elevation/etc.
    * @throws {OpenRouteServiceError} If no API key is provided when using the public API
    */
   constructor(config: ClientConfig, apiVersion: number = 2) {
      const DEFAULT_BASE_URL = "https://api.openrouteservice.org";
      const isCustomBaseUrl = !!config.baseUrl;

      // API key is required for the public API, but self-hosted instances may not need one
      if (!isCustomBaseUrl) {
         if (!config.apiKey || config.apiKey.trim() === "") {
            throw new OpenRouteServiceError("API key is required. Get one for free at https://openrouteservice.org/sign-up/");
         }

         if (config.apiKey.toLocaleLowerCase() === "your-api-key-here") {
            throw new OpenRouteServiceError("Please replace the placeholder API key with your actual OpenRouteService API key. Get one for free at https://openrouteservice.org/sign-up/");
         }
      }

      this.config = { baseUrl: DEFAULT_BASE_URL, timeout: 30000, headers: {}, ...config };

      const effectiveBase = (isCustomBaseUrl ? config.baseUrl! : DEFAULT_BASE_URL).replace(/\/+$/, "");

      if (apiVersion === 1) {
         this.baseUrl = effectiveBase;
      } else {
         this.baseUrl = `${effectiveBase}/v${apiVersion}`;
      }

      this.baseHeaders = {
         "Content-Type": "application/json",
         Accept: "application/json",
         ...(this.config.apiKey ? { Authorization: this.config.apiKey } : {}),
         ...this.config.headers,
      };

      if (config.cache !== undefined) {
         if (typeof config.cache === "number") {
            this.cacheConfig = { adapter: new MemoryCache(), ttl: config.cache, buildKey: defaultBuildKey };
         } else {
            this.cacheConfig = { adapter: config.cache.adapter, ttl: config.cache.ttl ?? 60_000, buildKey: config.cache.buildKey ?? defaultBuildKey };
         }
      }
   }

   private getErrorMessage(statusCode: number): string {
      switch (statusCode) {
         case 400:
            return "Bad Request: The request is incorrect and cannot be processed";
         case 404:
            return "Not Found: The requested element could not be found";
         case 405:
            return "Method Not Allowed: The specified HTTP method is not supported";
         case 413:
            return "Payload Too Large: The request exceeds the server capacity limit";
         case 500:
            return "Internal Server Error: An unexpected error occurred on the server";
         case 501:
            return "Not Implemented: The server does not support the requested functionality";
         case 503:
            return "Service Unavailable: The server is currently unavailable due to overload or maintenance";
         default:
            return `HTTP ${statusCode}: Request failed`;
      }
   }

   private async request<T>(endpoint: string, options: { method?: "GET" | "POST"; params?: Record<string, unknown>; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
      const { method = "GET", params, body, headers = {} } = options;
      let url = `${this.baseUrl}${endpoint}`;

      // Build query string for GET requests
      if (method === "GET" && params) {
         const searchParams = new URLSearchParams();
         Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
               if (Array.isArray(value)) {
                  searchParams.append(key, value.join(","));
               } else {
                  searchParams.append(key, String(value));
               }
            }
         });
         const queryString = searchParams.toString();
         if (queryString) url += `?${queryString}`;
      }

      const cacheKey = this.cacheConfig ? this.cacheConfig.buildKey({ method, endpoint, ...(params !== undefined ? { params } : {}), ...(body !== undefined ? { body } : {}) }) : null;

      if (this.cacheConfig && cacheKey) {
         try {
            const cached = await this.cacheConfig.adapter.get(cacheKey);
            if (cached !== null && cached !== undefined) return cached as T;
         } catch {
            // cache read error - fall through to fetch
         }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
         const response = await fetch(url, {
            method,
            headers: { ...this.baseHeaders, ...headers },
            ...(body ? { body: JSON.stringify(body) } : {}),
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         // Grab rate limit info from response headers
         const rateLimitInfo = {
            limit: parseInt(response.headers.get("x-ratelimit-limit") || "0", 10),
            remaining: parseInt(response.headers.get("x-ratelimit-remaining") || "0", 10),
            reset: parseInt(response.headers.get("x-ratelimit-reset") || "0", 10),
         };

         // Keep track of the most recent rate limit info with timestamp
         if (rateLimitInfo.limit > 0) {
            this.lastRateLimitInfo = {
               limit: rateLimitInfo.limit,
               remaining: rateLimitInfo.remaining,
               reset: new Date(rateLimitInfo.reset * 1000),
               requestTimestamp: new Date(),
            };
         }

         if (!response.ok) {
            let errorMessage = this.getErrorMessage(response.status);
            let responseData;
            let responseText = "";

            try {
               responseText = await response.text();
               if (responseText.trim()) {
                  responseData = JSON.parse(responseText);
                  if (responseData.error) {
                     errorMessage = `${errorMessage} - ${responseData.error.message || responseData.error}`;
                  }
               }
            } catch {
               // Sometimes the API returns non-JSON error responses, handle gracefully
               responseData = { rawResponse: responseText || "Empty response" };
            }

            throw new OpenRouteServiceError(errorMessage, response.status, responseData, rateLimitInfo);
         }

         const data = (await response.json()) as T;

         if (this.cacheConfig && cacheKey) {
            try {
               await this.cacheConfig.adapter.set(cacheKey, data, this.cacheConfig.ttl);
            } catch {
               // cache write error - ignore, request already succeeded
            }
         }

         return data;
      } catch (error) {
         clearTimeout(timeoutId);

         if (error instanceof OpenRouteServiceError) throw error;

         if (error instanceof Error && error.name === "AbortError") {
            throw new OpenRouteServiceError(`Request timeout after ${this.config.timeout}ms`);
         }

         throw new OpenRouteServiceError(`Network error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      }
   }

   /**
    * Sends a GET request to an API endpoint.
    *
    * @param endpoint - Path relative to the base URL, e.g. `/directions/driving-car`
    * @param params - Optional query parameters; arrays are joined with commas
    * @returns Parsed response body
    * @throws {OpenRouteServiceError} On HTTP errors or network failures
    */
   protected async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
      return this.request<T>(endpoint, { method: "GET", ...(params ? { params } : {}) });
   }

   /**
    * Sends a POST request to an API endpoint.
    *
    * @param endpoint - Path relative to the base URL, e.g. `/matrix/driving-car`
    * @param body - Request body, serialized to JSON
    * @param headers - Extra headers to merge into the request
    * @returns Parsed response body
    * @throws {OpenRouteServiceError} On HTTP errors or network failures
    */
   protected async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, { method: "POST", body, ...(headers ? { headers } : {}) });
   }

   /**
    * Checks if the ORS API is up.
    *
    * @returns Object with a `status` field, typically `"ready"` when all good
    * @throws {OpenRouteServiceError} On network failures or if the API is down
    */
   async health(): Promise<{ status: string }> {
      return this.get("/health");
   }

   /**
    * Returns rate limit info from the most recent request made by this client instance.
    * Includes the request timestamp so you can tell how fresh the info is.
    *
    * @returns Rate limit info with `limit`, `remaining`, `reset` date, and `requestTimestamp`, or undefined if no request has been made yet
    */
   getLastRateLimitInfo() {
      return this.lastRateLimitInfo;
   }

   /**
    * Throttles geocoding requests to comply with API requirements.
    * Each geocoding endpoint (autocomplete, search, reverse) is limited to ~3.33 req/s independently.
    * Throttling is isolated per API key, so different API keys don't interfere with each other.
    *
    * @param endpoint - The geocoding endpoint path, used as the throttle key
    */
   private async throttleGeocodingRequest(endpoint: string): Promise<void> {
      const apiKey = this.config.apiKey || "__no_key__";

      // Initialize the endpoint map for this API key if it doesn't exist
      if (!OpenRouteServiceClient.lastGeocodingRequests.has(apiKey)) {
         OpenRouteServiceClient.lastGeocodingRequests.set(apiKey, new Map());
      }

      const endpointMap = OpenRouteServiceClient.lastGeocodingRequests.get(apiKey)!;
      const now = Date.now();
      const lastRequestTime = endpointMap.get(endpoint) || 0;
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest < OpenRouteServiceClient.GEOCODING_THROTTLE_MS) {
         const delayNeeded = OpenRouteServiceClient.GEOCODING_THROTTLE_MS - timeSinceLastRequest;
         await new Promise((resolve) => setTimeout(resolve, delayNeeded));
      }

      endpointMap.set(endpoint, Date.now());
   }

   /**
    * Same as `get()` but with built-in per-endpoint geocoding throttle (~300ms between calls).
    *
    * @param endpoint - Geocoding endpoint path
    * @param params - Query parameters
    * @returns Parsed response body
    * @throws {OpenRouteServiceError} On HTTP errors or network failures
    */
   protected async getWithGeocodingThrottle<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
      await this.throttleGeocodingRequest(endpoint);
      return this.get<T>(endpoint, params);
   }
}
