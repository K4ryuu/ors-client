// Types for the Elevation service - get height info for your coordinates

import type { Coordinate, GeoJSONFeatureCollection } from "./common.js";

/** Request to get elevation for a single coordinate point. */
export interface ElevationPointRequest {
   /** Format of the input geometry: GeoJSON object or a bare point coordinate. */
   format_in: "geojson" | "point";
   /** Desired output format. */
   format_out: "geojson" | "point";
   /** Point to get elevation for. */
   geometry: { type: "Point"; coordinates: Coordinate };
}

/** Request to get elevation profile along a path. */
export interface ElevationLineRequest {
   /** Format of the input geometry. */
   format_in: "geojson" | "polyline" | "encodedpolyline";
   /** Desired output format. */
   format_out: "geojson" | "polyline" | "encodedpolyline";
   /** Line to get elevation profile for. */
   geometry: { type: "LineString"; coordinates: Coordinate[] };
   /** Optional interpolation range. */
   range?: [number, number];
}

/** Elevation response for a single point (non-GeoJSON format). */
export interface ElevationPointResponse {
   attribution: string;
   timestamp: number;
   version: string;
   /** Point geometry with elevation as the third coordinate: `[lon, lat, elevation_m]`. */
   geometry: { type: "Point"; coordinates: [number, number, number] };
}

/** Elevation response for a line (non-GeoJSON format). */
export interface ElevationLineResponse {
   attribution: string;
   timestamp: number;
   version: string;
   /** Line geometry with elevation added as the third coordinate: `[lon, lat, elevation_m][]`. */
   geometry: { type: "LineString"; coordinates: Array<[number, number, number]> };
}

/** Properties on an elevation GeoJSON feature. */
export interface ElevationProperties {
   /** Elevation in meters above sea level. */
   elevation: number;
   /** Distance along the line in meters (only present in line elevation responses). */
   distance?: number;
   [key: string]: unknown;
}

/** A single elevation point as a GeoJSON feature. */
export interface ElevationFeature {
   type: "Feature";
   /** Point geometry with elevation as third coordinate: `[lon, lat, elevation_m]`. */
   geometry: { type: "Point"; coordinates: [number, number, number] };
   properties: ElevationProperties;
}

/** Elevation response in GeoJSON FeatureCollection format. */
export interface ElevationGeoJSONResponse extends GeoJSONFeatureCollection {
   /** Elevation point features. */
   features: ElevationFeature[];
}
