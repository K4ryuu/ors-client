import type { GeocodingRequest, ReverseGeocodingRequest, StructuredGeocodingRequest, AutocompleteRequest, GeocodingResponse } from "../types/geocoding.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

// Geocoding still uses v1 API - good ol' reliable
const API_VERSION = 1;

export class GeocodingService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   // Search for places by name - "New York", "pizza near me", whatever
   // Throttled to 4 requests/second as per API requirements
   async search(request: GeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/search", request);
   }

   // More precise search with separate address components
   // Throttled to 4 requests/second as per API requirements
   async searchStructured(request: StructuredGeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/search/structured", request);
   }

   // Turn coordinates back into an address - handy for "where am I?"
   // Throttled to 4 requests/second as per API requirements
   async reverse(request: ReverseGeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/reverse", request);
   }

   // Get suggestions as you type - perfect for search boxes
   // Throttled to 4 requests/second as per API requirements
   async autocomplete(request: AutocompleteRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/autocomplete", request);
   }
}
