// Types for the Elevation service - get height info for your coordinates

import type { Coordinate, GeoJSONFeatureCollection } from "./common.js";

// Elevation point request - get elevation for a single point
export interface ElevationPointRequest {
   format_in: "geojson" | "point"; // Input format
   format_out: "geojson" | "point"; // Output format
   geometry: { type: "Point"; coordinates: Coordinate }; // Point geometry
}

// Elevation line request - get elevation profile along a route
export interface ElevationLineRequest {
   format_in: "geojson" | "polyline" | "encodedpolyline"; // Input format
   format_out: "geojson" | "polyline" | "encodedpolyline"; // Output format
   geometry: { type: "LineString"; coordinates: Coordinate[] }; // Line geometry
   range?: [number, number]; // Range for line interpolation
}

// Elevation point response (GeoJSON format)
export interface ElevationPointResponse {
   attribution: string;
   timestamp: number;
   version: string;
   geometry: { type: "Point"; coordinates: [number, number, number] }; // [lon, lat, elevation]
}

// Elevation line response (GeoJSON format)
export interface ElevationLineResponse {
   attribution: string;
   timestamp: number;
   version: string;
   geometry: { type: "LineString"; coordinates: Array<[number, number, number]> }; // Array of [lon, lat, elevation]
}

// Elevation GeoJSON feature properties
export interface ElevationProperties {
   elevation: number;
   distance?: number;
   [key: string]: unknown;
}

// Elevation GeoJSON feature
export interface ElevationFeature {
   type: "Feature";
   geometry: { type: "Point"; coordinates: [number, number, number] }; // [lon, lat, elevation]
   properties: ElevationProperties;
}

// Elevation GeoJSON response - collection of elevation points
export interface ElevationGeoJSONResponse extends GeoJSONFeatureCollection {
   features: ElevationFeature[]; // Elevation features
}
