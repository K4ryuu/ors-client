import type { Profile, ClientConfig } from "../types/common.js";
import type { DirectionsGetRequest, DirectionsPostRequest, DirectionsResponse, DirectionsGeoJSONResponse } from "../types/directions.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 2;

/**
 * Directions service - basically your GPS navigator
 *
 * This is what you use when you want to get from point A to point B,
 * with turn-by-turn instructions like "turn left in 200m". Works for
 * cars, bikes, walking, and pretty much any way of getting around.
 */
export class DirectionsService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Simple route calculation using GET request - good for basic routes without fancy options
    *
    * @param profile - How you're traveling (car, bike, walking, etc.)
    * @param request - Start and end coordinates
    *
    * @example
    * ```typescript
    * const route = await client.directions.getRoute('driving-car', {
    *   start: [8.681495, 49.41461],  // longitude, latitude
    *   end: [8.686507, 49.41943]
    * });
    * ```
    */
   async getRoute(profile: Profile, request: DirectionsGetRequest): Promise<DirectionsGeoJSONResponse> {
      const params = { start: request.start.join(","), end: request.end.join(",") };
      return this.get<DirectionsGeoJSONResponse>(`/directions/${profile}`, params);
   }

   /**
    * Advanced route calculation with all the bells and whistles
    *
    * Use this when you need turn-by-turn instructions, alternative routes,
    * or want to avoid highways/tolls. This is the full-featured version.
    *
    * @param profile - How you're traveling (car, bike, walking, etc.)
    * @param request - All your routing preferences and options
    *
    * @example
    * ```typescript
    * const route = await client.directions.calculateRoute('driving-car', {
    *   coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]],
    *   instructions: true,      // get turn-by-turn directions
    *   language: 'en',         // in English please
    *   options: {
    *     avoid_features: ['highways', 'tollways']  // avoid highways and tolls
    *   }
    * });
    * ```
    */
   async calculateRoute(profile: Profile, request: DirectionsPostRequest): Promise<DirectionsResponse> {
      return this.post<DirectionsResponse>(`/directions/${profile}`, request);
   }

   /**
    * Same as calculateRoute but returns GeoJSON format - perfect for displaying on maps
    */
   async calculateRouteGeoJSON(profile: Profile, request: DirectionsPostRequest): Promise<DirectionsGeoJSONResponse> {
      const headers = { Accept: "application/geo+json" }; // GeoJSON endpoint requires specific Accept header
      return this.post<DirectionsGeoJSONResponse>(`/directions/${profile}/geojson`, request, headers);
   }

   /**
    * Simple route in GeoJSON format - basically getRoute but returns GeoJSON
    */
   async getRouteGeoJSON(profile: Profile, request: DirectionsGetRequest): Promise<DirectionsGeoJSONResponse> {
      const params = { start: request.start.join(","), end: request.end.join(",") };
      return this.get<DirectionsGeoJSONResponse>(`/directions/${profile}/geojson`, params);
   }
}
