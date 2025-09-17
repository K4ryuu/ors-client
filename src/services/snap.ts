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
    * Snap coordinates to the nearest roads - returns JSON format
    *
    * Takes your slightly-off coordinates and moves them to the nearest actual road.
    * Perfect for cleaning up GPS tracks or ensuring coordinates are routable.
    */
   async snapLocations(profile: Profile, request: SnapRequest): Promise<SnapResponse> {
      return this.post<SnapResponse>(`/snap/${profile}`, request);
   }

   /**
    * Same as snapLocations but explicitly asks for JSON format
    *
    * Sometimes the API gets confused about formats, so this is more explicit.
    */
   async snapLocationsJSON(profile: Profile, request: SnapRequest): Promise<SnapResponse> {
      return this.post<SnapResponse>(`/snap/${profile}/json`, request);
   }

   /**
    * Snap coordinates and return as GeoJSON - great for mapping
    *
    * Same snapping but returns GeoJSON format, perfect if you want to display
    * the results on a map or use with mapping libraries.
    */
   async snapLocationsGeoJSON(profile: Profile, request: SnapRequest): Promise<SnapGeoJSONResponse> {
      return this.post<SnapGeoJSONResponse>(`/snap/${profile}/geojson`, request);
   }
}
