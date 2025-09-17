// Types for the Snap service - snap coordinates to the nearest road

import type { Coordinate, Profile, BaseRequest, GeoJSONFeatureCollection } from "./common.js";

// Snap request parameters - find the closest road to your coordinates
export interface SnapRequest extends BaseRequest {
   locations: Coordinate[]; // Array of coordinate pairs to snap to the routing graph
   radius: number; // Search radius in meters for snapping
}

// Snapped location result - where your point ended up on the road network
export interface SnappedLocation {
   location: Coordinate; // Snapped coordinates [longitude, latitude]
   name?: string; // Name of the snapped road/way
   snapped_distance: number; // Distance from original point to snapped location in meters
}

// Snap response (JSON format) - your snapped locations
export interface SnapResponse {
   locations: (SnappedLocation | null)[]; // Array of snapped locations (null for locations that couldn't be snapped)

   // Response metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: { profile: Profile; profileName: Profile; format: string; locations: Coordinate[]; radius: number };
      engine: { version: string; build_date: string; graph_date: string; osm_date: string };
   };
}

// Snap feature for GeoJSON response
export interface SnapFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: {
      source_id: number; // Source index from the input locations array
      name?: string; // Name of the snapped road/way
      snapped_distance: number; // Distance from original point to snapped location in meters
   };
}

// Snap response in GeoJSON format - ready for mapping
export interface SnapGeoJSONResponse extends GeoJSONFeatureCollection {
   features: SnapFeature[]; // Snapped locations as GeoJSON features
   bbox: [number, number, number, number]; // Bounding box [west, south, east, north]

   // Response metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: { profile: Profile; profileName: Profile; format: string; locations: Coordinate[]; radius: number };
      engine: { version: string; build_date: string; graph_date: string; osm_date: string };
   };
}
