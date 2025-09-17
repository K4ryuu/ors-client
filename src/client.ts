import type { ClientConfig } from "./types/common.js";

// Custom error class so you can catch ORS-specific errors easily
export class OpenRouteServiceError extends Error {
   constructor(message: string, public statusCode?: number, public response?: unknown, public rateLimitInfo?: { limit: number; remaining: number; reset: number }) {
      super(message);
      this.name = "OpenRouteServiceError";
   }

   // Quick checks for common error types - way easier than checking status codes manually
   isBadRequest(): boolean {
      return this.statusCode === 400;
   }
   isNotFound(): boolean {
      return this.statusCode === 404;
   }
   isMethodNotAllowed(): boolean {
      return this.statusCode === 405;
   }
   isPayloadTooLarge(): boolean {
      return this.statusCode === 413;
   }
   isRateLimited(): boolean {
      return this.statusCode === 429;
   }
   isServerError(): boolean {
      return this.statusCode === 500;
   }
   isNotImplemented(): boolean {
      return this.statusCode === 501;
   }
   isServiceUnavailable(): boolean {
      return this.statusCode === 503;
   }

   getRateLimitInfo() {
      return this.rateLimitInfo;
   }
   getRemainingRequests(): number {
      return this.rateLimitInfo?.remaining || 0;
   }
}

// Base client that handles all the HTTP stuff - you probably won't use this directly
export class OpenRouteServiceClient {
   private readonly config: Required<ClientConfig>;
   private readonly baseHeaders: Record<string, string>;
   protected readonly baseUrl: string;
   private lastRateLimitInfo?: { limit: number; remaining: number; reset: Date; requestTimestamp: Date };

   // Throttling for individual geocoding endpoints (each endpoint gets its own throttle)
   private static lastGeocodingRequests: Map<string, number> = new Map();
   private static readonly GEOCODING_THROTTLE_MS = 300; // ~3.33 requests/second per endpoint

   constructor(config: ClientConfig, apiVersion: number = 2) {
      // Make sure they actually gave us an API key
      if (!config.apiKey || config.apiKey.trim() === "") {
         throw new OpenRouteServiceError("API key is required. Get one for free at https://openrouteservice.org/sign-up/");
      }

      // Catch the common mistake of leaving the placeholder in there
      if (config.apiKey.toLocaleLowerCase() === "your-api-key-here") {
         throw new OpenRouteServiceError("Please replace the placeholder API key with your actual OpenRouteService API key. Get one for free at https://openrouteservice.org/sign-up/");
      }

      this.config = { baseUrl: "https://api.openrouteservice.org/v2", timeout: 30000, headers: {}, ...config };

      // Different API versions have different base URLs - v1 is special
      if (apiVersion === 1) {
         this.baseUrl = "https://api.openrouteservice.org";
      } else {
         this.baseUrl = `https://api.openrouteservice.org/v${apiVersion}`;
      }

      this.baseHeaders = { "Content-Type": "application/json", Accept: "application/json", Authorization: this.config.apiKey, ...this.config.headers };
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
            } catch (jsonError) {
               // Sometimes the API returns non-JSON error responses, handle gracefully
               console.warn("Failed to parse error response as JSON:", jsonError);
               responseData = { rawResponse: responseText || "Empty response" };
            }

            throw new OpenRouteServiceError(errorMessage, response.status, responseData, rateLimitInfo);
         }

         return await response.json();
      } catch (error) {
         clearTimeout(timeoutId);

         if (error instanceof OpenRouteServiceError) throw error;

         if (error instanceof Error && error.name === "AbortError") {
            throw new OpenRouteServiceError(`Request timeout after ${this.config.timeout}ms`);
         }

         throw new OpenRouteServiceError(`Network error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      }
   }

   protected async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
      return this.request<T>(endpoint, { method: "GET", ...(params ? { params } : {}) });
   }

   protected async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, { method: "POST", body, ...(headers ? { headers } : {}) });
   }

   async health(): Promise<{ status: string }> {
      return this.get("/health");
   }

   getLastRateLimitInfo() {
      return this.lastRateLimitInfo;
   }

   /**
    * Throttles geocoding requests to comply with API requirements.
    * Each geocoding endpoint (autocomplete, search, reverse) should be limited to ~3.33 requests/second independently.
    */
   private async throttleGeocodingRequest(endpoint: string): Promise<void> {
      const now = Date.now();
      const lastRequestTime = OpenRouteServiceClient.lastGeocodingRequests.get(endpoint) || 0;
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest < OpenRouteServiceClient.GEOCODING_THROTTLE_MS) {
         const delayNeeded = OpenRouteServiceClient.GEOCODING_THROTTLE_MS - timeSinceLastRequest;
         await new Promise(resolve => setTimeout(resolve, delayNeeded));
      }

      OpenRouteServiceClient.lastGeocodingRequests.set(endpoint, Date.now());
   }

   /**
    * Special GET method for geocoding endpoints with built-in per-endpoint throttling
    */
   protected async getWithGeocodingThrottle<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
      await this.throttleGeocodingRequest(endpoint);
      return this.get<T>(endpoint, params);
   }
}
