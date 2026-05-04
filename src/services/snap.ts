import type { SnapRequest, SnapResponse, SnapGeoJSONResponse } from "../types/snap.js";
import type { ClientConfig, Profile } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 2;

/**
 * Snap service - clean up messy GPS coordinates
 *
 * Got GPS coordinates that are slightly off the road? This service will snap them
 * to the nearest actual road in the routing network. Super useful for cleaning up
 * tracking data or making sure your coordinates are actually on roads.
 */
export class SnapService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Snap coordinates to the nearest roads - returns JSON format.
    *
    * @param profile - Routing profile to use for snapping, e.g. `"driving-car"`
    * @param request - Coordinates to snap and the search radius in meters
    * @returns Array of snapped locations (null for any that couldn't be snapped within the radius)
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    *
    * @example
    * const snapped = await ors.snap.snapLocations("driving-car", {
    *   locations: [[8.681495, 49.41461]],
    *   radius: 350,
    * });
    */
   async snapLocations(profile: Profile, request: SnapRequest): Promise<SnapResponse> {
      return this.post<SnapResponse>(`/snap/${profile}`, request);
   }

   /**
    * Same as `snapLocations` but hits the `/json` endpoint explicitly.
    *
    * @param profile - Routing profile to use for snapping
    * @param request - Coordinates to snap and the search radius in meters
    * @returns Array of snapped locations
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    */
   async snapLocationsJSON(profile: Profile, request: SnapRequest): Promise<SnapResponse> {
      return this.post<SnapResponse>(`/snap/${profile}/json`, request);
   }

   /**
    * Snap coordinates and return as GeoJSON - perfect for displaying snapped points on a map.
    *
    * @param profile - Routing profile to use for snapping
    * @param request - Coordinates to snap and the search radius in meters
    * @returns Snapped locations as a GeoJSON FeatureCollection
    * @throws {OpenRouteServiceError} On invalid coordinates, unsupported profile, or API errors
    */
   async snapLocationsGeoJSON(profile: Profile, request: SnapRequest): Promise<SnapGeoJSONResponse> {
      return this.post<SnapGeoJSONResponse>(`/snap/${profile}/geojson`, request);
   }
}
