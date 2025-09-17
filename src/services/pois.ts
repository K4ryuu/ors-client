import type { POIRequest, POIResponse, POIStatsResponse, POICategoriesResponse } from "../types/pois.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

export class POIService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   // Find POIs around a location - cafes, restaurants, you name it
   async searchPOIs(request: Omit<POIRequest, "request">): Promise<POIResponse> {
      const body = { ...request, request: "pois" };
      return this.post<POIResponse>("/pois", body);
   }

   // Get some stats about what POIs are available in an area
   async getStats(request: Omit<POIRequest, "request">): Promise<POIStatsResponse> {
      const body = { ...request, request: "stats" };
      return this.post<POIStatsResponse>("/pois", body);
   }

   // List all the POI categories you can search for
   async getCategories(): Promise<POICategoriesResponse> {
      return this.post<POICategoriesResponse>("/pois", { request: "list" });
   }
}
