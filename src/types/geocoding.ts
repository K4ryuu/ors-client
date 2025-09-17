// Types for the Geocoding services - convert addresses to coordinates and vice versa

import type { Coordinate } from "./common.js";

// Geocoding request parameters - turn "123 Main St" into lat/lng
export interface GeocodingRequest {
   text: string;
   size?: number;
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   "boundary.country"?: string[];
   "boundary.rect"?: [number, number, number, number];
   "boundary.circle"?: [number, number, number];
   "focus.point"?: Coordinate;
   [key: string]: unknown;
}

// Reverse geocoding request parameters - turn lat/lng into "123 Main St"
export interface ReverseGeocodingRequest {
   "point.lon": number;
   "point.lat": number;
   size?: number;
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   "boundary.country"?: string[];
   [key: string]: unknown;
}

// Structured geocoding request parameters - when you have address components separated
export interface StructuredGeocodingRequest {
   address?: string;
   neighbourhood?: string;
   borough?: string;
   locality?: string;
   county?: string;
   region?: string;
   postalcode?: string;
   country?: string;
   size?: number;
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   [key: string]: unknown;
}

// Autocomplete request parameters - for search-as-you-type functionality
export interface AutocompleteRequest {
   text: string;
   size?: number;
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   "boundary.country"?: string[];
   "boundary.rect"?: [number, number, number, number];
   "boundary.circle"?: [number, number, number];
   "focus.point"?: Coordinate;
   [key: string]: unknown;
}

// Geocoding feature properties - all the juicy details about a location
export interface GeocodingProperties {
   id: string;
   gid: string;
   layer: string;
   source: string;
   source_id: string;
   name: string;
   confidence: number;
   match_type?: string;
   accuracy?: string;
   country?: string;
   country_a?: string;
   country_code?: string;
   region?: string;
   region_a?: string;
   county?: string;
   locality?: string;
   neighbourhood?: string;
   label?: string;
   housenumber?: string;
   street?: string;
   postalcode?: string;
   continent?: string;
   continent_gid?: string;
   macroregion?: string;
   macroregion_gid?: string;
   region_gid?: string;
   locality_gid?: string;
   country_gid?: string;
   [key: string]: unknown;
}

// Geocoding feature - a single result with location and properties
export interface GeocodingFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: GeocodingProperties;
   bbox?: [number, number, number, number];
}

// Geocoding response - the complete response with metadata and results
export interface GeocodingResponse {
   type: "FeatureCollection";
   features: GeocodingFeature[]; // Result features
   bbox?: [number, number, number, number]; // Bounding box

   // Geocoding metadata
   geocoding: {
      version: string;
      attribution: string;
      query: Record<string, unknown>;
      warnings?: string[];
      timestamp: number;
      engine: { name: string; author: string; version: string };
   };
}
