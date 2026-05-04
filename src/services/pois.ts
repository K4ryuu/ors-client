import type { POIRequest, POIResponse, POIStatsResponse, POICategoriesResponse } from "../types/pois.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

/**
 * POI (Points of Interest) service - find places like restaurants, ATMs, hospitals, etc.
 *
 * Search by area (bounding box or radius) and filter by category, name, or accessibility.
 */
export class POIService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Search for POIs within a given area.
    *
    * @param request - Search area geometry and optional filters (category, name, wheelchair access, etc.)
    * @returns GeoJSON FeatureCollection of matching POIs with their properties
    * @throws {OpenRouteServiceError} On invalid geometry, unknown category IDs, or API errors
    *
    * @example
    * const pois = await ors.pois.searchPOIs({
    *   geometry: { geojson: { type: "Point", coordinates: [8.681495, 49.41461] }, buffer: 500 },
    *   filters: { category_ids: [560] }, // restaurants
    *   limit: 10,
    * });
    */
   async searchPOIs(request: Omit<POIRequest, "request">): Promise<POIResponse> {
      const body = { ...request, request: "pois" };
      return this.post<POIResponse>("/pois", body);
   }

   /**
    * Get category counts for POIs within a given area - handy for showing "42 restaurants nearby".
    *
    * @param request - Search area geometry and optional filters (same as `searchPOIs`)
    * @returns Per-category POI counts grouped by category group
    * @throws {OpenRouteServiceError} On invalid geometry or API errors
    */
   async getStats(request: Omit<POIRequest, "request">): Promise<POIStatsResponse> {
      const body = { ...request, request: "stats" };
      return this.post<POIStatsResponse>("/pois", body);
   }

   /**
    * List all available POI category groups and their child categories.
    * Useful for building category pickers or looking up category IDs.
    *
    * @returns Nested object of category groups → categories with their IDs
    * @throws {OpenRouteServiceError} On API errors
    */
   async getCategories(): Promise<POICategoriesResponse> {
      return this.post<POICategoriesResponse>("/pois", { request: "list" });
   }
}
