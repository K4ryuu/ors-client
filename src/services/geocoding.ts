import type { GeocodingRequest, ReverseGeocodingRequest, StructuredGeocodingRequest, AutocompleteRequest, GeocodingResponse } from "../types/geocoding.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

// Geocoding still uses v1 API - good ol' reliable
const API_VERSION = 1;

/**
 * Geocoding service - convert between addresses and coordinates.
 *
 * All methods are auto-throttled to ~3.33 req/s per endpoint to stay within API limits.
 * Each endpoint (search, reverse, autocomplete) has its own independent throttle bucket.
 */
export class GeocodingService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Search for places by name or free-text query.
    * Throttled to ~3.33 req/s as per API requirements.
    *
    * @param request - Search text and optional filters (layers, sources, bounding area, etc.)
    * @returns GeoJSON FeatureCollection of matching places, ordered by relevance
    * @throws {OpenRouteServiceError} On invalid query, rate limit, or API errors
    *
    * @example
    * const results = await ors.geocoding.search({ text: "Heidelberg, Germany" });
    * const [lon, lat] = results.features[0].geometry.coordinates;
    */
   async search(request: GeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/search", request);
   }

   /**
    * More precise search using individual address components instead of a free-text query.
    * Throttled to ~3.33 req/s as per API requirements.
    *
    * @param request - Structured address fields (street, city, postal code, country, etc.)
    * @returns GeoJSON FeatureCollection of matching places
    * @throws {OpenRouteServiceError} On invalid input or API errors
    */
   async searchStructured(request: StructuredGeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/search/structured", request);
   }

   /**
    * Turn coordinates into a human-readable address (reverse geocoding).
    * Throttled to ~3.33 req/s as per API requirements.
    *
    * @param request - Longitude and latitude of the point to look up
    * @returns GeoJSON FeatureCollection of nearby addresses, closest first
    * @throws {OpenRouteServiceError} On invalid coordinates or API errors
    *
    * @example
    * const result = await ors.geocoding.reverse({ "point.lon": 8.681495, "point.lat": 49.41461 });
    * console.log(result.features[0].properties.label); // "Some Street 42, Heidelberg, Germany"
    */
   async reverse(request: ReverseGeocodingRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/reverse", request);
   }

   /**
    * Get place suggestions as the user types - great for search box autocomplete.
    * Throttled to ~3.33 req/s as per API requirements.
    *
    * @param request - Partial text query and optional filters
    * @returns GeoJSON FeatureCollection of suggestions
    * @throws {OpenRouteServiceError} On API errors or rate limiting
    *
    * @example
    * const suggestions = await ors.geocoding.autocomplete({ text: "Heidel" });
    */
   async autocomplete(request: AutocompleteRequest): Promise<GeocodingResponse> {
      return this.getWithGeocodingThrottle<GeocodingResponse>("/geocode/autocomplete", request);
   }
}
