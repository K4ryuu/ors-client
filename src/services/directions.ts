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
    * Simple route calculation using GET request - good for basic A-to-B routes without extra options.
    *
    * @param profile - Routing profile, e.g. `"driving-car"` or `"foot-walking"`
    * @param request - Start and end coordinates
    * @returns Route as a GeoJSON FeatureCollection
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
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
    * Full-featured route calculation with turn-by-turn instructions, alternatives, avoidance, and more.
    *
    * Use this when you need more than just geometry - instructions, alternative routes,
    * waypoints, custom avoidances, elevation, extra info, etc.
    *
    * @param profile - Routing profile, e.g. `"driving-car"` or `"foot-walking"`
    * @param request - Route request options including coordinates and preferences
    * @returns Parsed route response with geometry, steps, summary, and any requested extras
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    *
    * @example
    * ```typescript
    * const route = await client.directions.calculateRoute('driving-car', {
    *   coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]],
    *   instructions: true,
    *   language: 'en',
    *   options: { avoid_features: ['highways', 'tollways'] }
    * });
    * ```
    */
   async calculateRoute(profile: Profile, request: DirectionsPostRequest): Promise<DirectionsResponse> {
      return this.post<DirectionsResponse>(`/directions/${profile}`, request);
   }

   /**
    * Same as `calculateRoute` but returns GeoJSON format - perfect for displaying on maps.
    *
    * @param profile - Routing profile, e.g. `"driving-car"` or `"foot-walking"`
    * @param request - Route request options including coordinates and preferences
    * @returns Route as a GeoJSON FeatureCollection with metadata
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    */
   async calculateRouteGeoJSON(profile: Profile, request: DirectionsPostRequest): Promise<DirectionsGeoJSONResponse> {
      const headers = { Accept: "application/geo+json" }; // GeoJSON endpoint requires specific Accept header
      return this.post<DirectionsGeoJSONResponse>(`/directions/${profile}/geojson`, request, headers);
   }

   /**
    * Simple A-to-B route as GeoJSON - same as `getRoute` but returns GeoJSON format.
    *
    * @param profile - Routing profile, e.g. `"driving-car"` or `"foot-walking"`
    * @param request - Start and end coordinates
    * @returns Route as a GeoJSON FeatureCollection
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    */
   async getRouteGeoJSON(profile: Profile, request: DirectionsGetRequest): Promise<DirectionsGeoJSONResponse> {
      const params = { start: request.start.join(","), end: request.end.join(",") };
      return this.get<DirectionsGeoJSONResponse>(`/directions/${profile}/geojson`, params);
   }
}
