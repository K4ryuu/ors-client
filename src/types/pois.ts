// Types for the POI (Points of Interest) service - find cool stuff near you

import type { Coordinate, GeoJSONFeatureCollection } from "./common.js";

/**
 * POI API request body - shared structure for searching POIs, getting stats, or listing categories.
 * The `request` field determines what the API does; you don't set it directly (the service methods handle it).
 */
export interface POIRequest {
   /** Request type - set automatically by the service methods. */
   request: "pois" | "stats" | "list";

   // Geometry for search area
   geometry?: {
      /** Bounding box for the search area as `[[min_lon, min_lat], [max_lon, max_lat]]`. */
      bbox?: [[number, number], [number, number]];
      /** Center point for a radius search. */
      geojson?: { type: "Point"; coordinates: Coordinate };
      /** Radius around the geometry in meters. */
      buffer?: number;
   };

   // POI filters - narrow down what you're looking for
   filters?: {
      /** Filter by category group IDs (broad categories). */
      category_group_ids?: number[];
      /** Filter by specific category IDs. */
      category_ids?: number[];
      /** Filter by place name (partial match). */
      name?: string[];
      /** Filter by wheelchair accessibility. */
      wheelchair?: (boolean | "limited" | "designated")[];
      /** Filter by smoking policy. */
      smoking?: string[];
      /** Filter by whether a fee is required. */
      fee?: (boolean | string)[];
   };

   /** Max number of POIs to return. */
   limit?: number;
   /** Sort results by distance from the search center or by category. */
   sortby?: "distance" | "category";
}

/** Properties on a POI result feature. */
export interface POIProperties {
   /** OpenStreetMap element ID. */
   osm_id: number;
   /** OSM element type code (0=node, 1=way, 2=relation). */
   osm_type: number;
   /** Distance from the search center in meters (when sorting by distance). */
   distance?: number;
   /** Category IDs this POI belongs to, with names. */
   category_ids: Record<string, { category_name: string; category_group: string }>;
   /** Raw OSM tags for this POI. */
   osm_tags?: Record<string, string>;
   [key: string]: unknown;
}

/** A single POI as a GeoJSON feature. */
export interface POIFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: POIProperties;
}

/** POI search response - a GeoJSON FeatureCollection of matching points of interest. */
export interface POIResponse extends GeoJSONFeatureCollection {
   /** The POI features found. */
   features: POIFeature[];

   // Response info
   information: {
      attribution: string;
      version: string;
      timestamp: number;
      query: Record<string, unknown>;
   };
}

/** POI statistics response - counts of POI types in the search area, grouped by category. */
export interface POIStatsResponse {
   // Statistics about POIs found
   places: {
      /** Total number of POIs found across all categories. */
      total_count: number;
      // Category groups with their counts
      [categoryGroupName: string]:
         | {
              group_id: number;
              total_count: number;
              categories: Record<string, { count: number; category_id: number }>;
           }
         | number;
   };

   // Response metadata
   information: {
      attribution: string;
      version: string;
      timestamp: number;
      query: Record<string, unknown>;
   };
}

/**
 * POI categories list response - all available category groups and their child categories.
 * Keyed by group name, with each group containing an ID and its children.
 */
export interface POICategoriesResponse {
   [categoryGroupName: string]: {
      /** Category group ID, used in `category_group_ids` filter. */
      id: number;
      /** Child categories within this group, keyed by category name. */
      children?: Record<string, Record<string, number>>;
   };
}
