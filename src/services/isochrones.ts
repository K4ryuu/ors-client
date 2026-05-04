import type { Profile, ClientConfig } from "../types/common.js";
import type { IsochroneRequest, IsochroneResponse } from "../types/isochrones.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 2;

/**
 * Isochrones service - calculate reachable areas within time or distance limits.
 *
 * An isochrone is a polygon showing everywhere you can reach from a point within
 * a given time or distance. Great for "show all apartments within 20 min of work" queries.
 */
export class IsochronesService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Calculate isochrone polygons around one or more center points.
    *
    * @param profile - Routing profile to use, e.g. `"driving-car"` or `"foot-walking"`
    * @param request - Center locations, range values, and display options
    * @returns GeoJSON FeatureCollection of isochrone polygons, ready to display on a map
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    *
    * @example
    * // Find everywhere reachable within 10 and 20 minutes by car from Heidelberg
    * const isochrones = await ors.isochrones.calculateIsochrones("driving-car", {
    *   locations: [[8.681495, 49.41461]],
    *   range: [600, 1200], // 10 min and 20 min in seconds
    *   range_type: "time",
    * });
    */
   async calculateIsochrones(profile: Profile, request: IsochroneRequest): Promise<IsochroneResponse> {
      const headers = { Accept: "application/geo+json" };
      return this.post<IsochroneResponse>(`/isochrones/${profile}`, request, headers);
   }
}
