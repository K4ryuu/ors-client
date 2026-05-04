// Types for the Snap service - snap coordinates to the nearest road

import type { Coordinate, Profile, BaseRequest, GeoJSONFeatureCollection } from "./common.js";

/** Request to snap one or more coordinates to the nearest road in the routing graph. */
export interface SnapRequest extends BaseRequest {
   /** Coordinates to snap as `[longitude, latitude]` pairs. */
   locations: Coordinate[];
   /** Search radius in meters - only roads within this distance will be considered. */
   radius: number;
}

/** Result for a single snapped location. */
export interface SnappedLocation {
   /** The snapped coordinates on the road network as `[longitude, latitude]`. */
   location: Coordinate;
   /** Name of the road or way the point was snapped to, if available. */
   name?: string;
   /** Distance from the original input point to the snapped location in meters. */
   snapped_distance: number;
}

/** Snap API response in JSON format. */
export interface SnapResponse {
   /**
    * Snapped locations in the same order as the input.
    * `null` for any point that couldn't be snapped within the given radius.
    */
   locations: (SnappedLocation | null)[];

   // Response metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: { profile: Profile; profileName: Profile; format: string; locations: Coordinate[]; radius: number };
      engine: { version: string; build_date: string; graph_date: string; osm_date: string };
   };
}

/** A single snapped point as a GeoJSON feature. */
export interface SnapFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: {
      /** Index of this point in the original input `locations` array. */
      source_id: number;
      /** Name of the road or way the point was snapped to. */
      name?: string;
      /** Distance from the original point to the snapped location in meters. */
      snapped_distance: number;
   };
}

/** Snap API response in GeoJSON format - ready for display on a map. */
export interface SnapGeoJSONResponse extends GeoJSONFeatureCollection {
   /** Snapped locations as GeoJSON point features. */
   features: SnapFeature[];
   /** Bounding box enclosing all snapped points as `[west, south, east, north]`. */
   bbox: [number, number, number, number];

   // Response metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: { profile: Profile; profileName: Profile; format: string; locations: Coordinate[]; radius: number };
      engine: { version: string; build_date: string; graph_date: string; osm_date: string };
   };
}
