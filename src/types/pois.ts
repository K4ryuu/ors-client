// Types for the POI (Points of Interest) service - find cool stuff near you

import type { Coordinate, GeoJSONFeatureCollection } from "./common.js";

// POI request parameters - find restaurants, gas stations, whatever you need
export interface POIRequest {
   request: "pois" | "stats" | "list"; // Request geometry (point, bbox, polygon)

   // Geometry for search area
   geometry?: {
      bbox?: [[number, number], [number, number]]; // Bounding box [[min_lon, min_lat], [max_lon, max_lat]]
      geojson?: { type: "Point"; coordinates: Coordinate }; // Geographic center point
      buffer?: number; // Buffer around geometry in meters
   };

   // POI filters - narrow down what you're looking for
   filters?: {
      category_group_ids?: number[]; // Category groups
      category_ids?: number[]; // Category IDs
      name?: string[]; // Name search
      wheelchair?: (boolean | "limited" | "designated")[]; // Wheelchair accessibility
      smoking?: string[]; // Smoking allowed
      fee?: (boolean | string)[]; // Fee required
   };

   limit?: number; // Maximum number of results
   sortby?: "distance" | "category"; // Result sorting
}

// POI properties - the details about each point of interest
export interface POIProperties {
   osm_id: number;
   osm_type: number;
   distance?: number;
   category_ids: Record<string, { category_name: string; category_group: string }>;
   osm_tags?: Record<string, string>;
   [key: string]: unknown;
}

// POI feature - a single point of interest
export interface POIFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: POIProperties;
}

// POI response - your search results
export interface POIResponse extends GeoJSONFeatureCollection {
   features: POIFeature[]; // POI features

   // Response info
   information: {
      attribution: string;
      version: string;
      timestamp: number;
      query: Record<string, unknown>;
   };
}

// POI statistics response - get counts of different POI types in an area
export interface POIStatsResponse {
   // Statistics about POIs found
   places: {
      total_count: number; // Total count of POIs
      // Category groups with their counts
      [categoryGroupName: string]:
         | {
              group_id: number; // Group ID
              total_count: number; // Total count for this group
              // Categories breakdown
              categories: Record<string, { count: number; category_id: number }>;
           }
         | number; // total_count is also a number property
   };

   // Response metadata
   information: {
      attribution: string;
      version: string;
      timestamp: number;
      query: Record<string, unknown>;
   };
}

// POI categories list response - what kinds of POIs are available
export interface POICategoriesResponse {
   // Available POI categories by group name
   [categoryGroupName: string]: {
      id: number; // Group ID
      children?: Record<string, Record<string, number>>; // Children categories
   };
}
