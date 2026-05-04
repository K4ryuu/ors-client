// Types for the Geocoding services - convert addresses to coordinates and vice versa

import type { Coordinate } from "./common.js";

/** Request parameters for free-text geocoding - turn a place name or address into coordinates. */
export interface GeocodingRequest {
   /** The search query, e.g. `"Heidelberg, Germany"` or `"123 Main St"`. */
   text: string;
   /** Max number of results to return. */
   size?: number;
   /** Filter results to specific place type layers. */
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   /** Filter to specific data sources: `"osm"`, `"oa"` (OpenAddresses), `"wof"` (Who's on First), `"gn"` (GeoNames). */
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   /** Restrict results to these countries (ISO 3166-1 alpha-2 codes). */
   "boundary.country"?: string[];
   /** Restrict results to a rectangle as `[min_lon, min_lat, max_lon, max_lat]`. */
   "boundary.rect"?: [number, number, number, number];
   /** Restrict results to a circle as `[lon, lat, radius_km]`. */
   "boundary.circle"?: [number, number, number];
   /** Bias results towards this point - doesn't filter, just bumps nearby results up. */
   "focus.point"?: Coordinate;
   [key: string]: unknown;
}

/** Request parameters for reverse geocoding - turn coordinates into an address. */
export interface ReverseGeocodingRequest {
   /** Longitude of the point to look up. */
   "point.lon": number;
   /** Latitude of the point to look up. */
   "point.lat": number;
   /** Max number of results to return. */
   size?: number;
   /** Filter results to specific place type layers. */
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   /** Filter to specific data sources. */
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   /** Restrict results to these countries. */
   "boundary.country"?: string[];
   [key: string]: unknown;
}

/**
 * Request parameters for structured geocoding - search using separate address components
 * instead of a single free-text query. More precise when you already have the parts.
 */
export interface StructuredGeocodingRequest {
   /** Street address, e.g. `"123 Main St"`. */
   address?: string;
   neighbourhood?: string;
   borough?: string;
   /** City or town name. */
   locality?: string;
   county?: string;
   /** State or province. */
   region?: string;
   postalcode?: string;
   /** Country name or code. */
   country?: string;
   /** Max number of results to return. */
   size?: number;
   /** Filter to specific data sources. */
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   [key: string]: unknown;
}

/** Request parameters for autocomplete - optimized for search-as-you-type. */
export interface AutocompleteRequest {
   /** Partial text query from the user, e.g. `"Heidel"`. */
   text: string;
   /** Max number of suggestions to return. */
   size?: number;
   /** Filter suggestions to specific place type layers. */
   layers?: Array<"venue" | "address" | "street" | "neighbourhood" | "borough" | "localadmin" | "locality" | "county" | "macrocounty" | "region" | "macroregion" | "country" | "coarse">;
   /** Filter to specific data sources. */
   sources?: Array<"osm" | "oa" | "wof" | "gn">;
   /** Restrict suggestions to these countries. */
   "boundary.country"?: string[];
   /** Restrict suggestions to a rectangle. */
   "boundary.rect"?: [number, number, number, number];
   /** Restrict suggestions to a circle. */
   "boundary.circle"?: [number, number, number];
   /** Bias suggestions towards this location. */
   "focus.point"?: Coordinate;
   [key: string]: unknown;
}

/** Properties on a geocoding result feature - all the details about a matched place. */
export interface GeocodingProperties {
   /** Internal feature ID. */
   id: string;
   /** Global ID across all sources. */
   gid: string;
   /** Place type layer, e.g. `"address"`, `"locality"`. */
   layer: string;
   /** Data source, e.g. `"osm"`. */
   source: string;
   /** ID within the source dataset. */
   source_id: string;
   /** Display name of the place. */
   name: string;
   /** Confidence score 0-1, higher = better match. */
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
   /** Full human-readable label, e.g. `"Main Street 42, Heidelberg, Germany"`. */
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

/** A single geocoding result as a GeoJSON feature. */
export interface GeocodingFeature {
   type: "Feature";
   /** Point geometry at the location of the result. */
   geometry: { type: "Point"; coordinates: Coordinate };
   properties: GeocodingProperties;
   bbox?: [number, number, number, number];
}

/** Full response from the geocoding API - a GeoJSON FeatureCollection with metadata. */
export interface GeocodingResponse {
   type: "FeatureCollection";
   /** Matched places, ordered by relevance. */
   features: GeocodingFeature[];
   /** Bounding box enclosing all results. */
   bbox?: [number, number, number, number];

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
