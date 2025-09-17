// Types for the Isochrones service - draw areas you can reach within time/distance limits

import type { Coordinate, BaseRequest, GeoJSONFeatureCollection } from "./common.js";

// Range types for isochrone calculation - time or distance based
export type IsochroneRangeType = "time" | "distance";

// Isochrone request - "show me everywhere I can get in 15 minutes"
export interface IsochroneRequest extends BaseRequest {
   locations: Coordinate[]; // Array of coordinates for isochrone centers
   range: number[]; // Range values (in seconds for time, meters for distance)
   range_type?: IsochroneRangeType; // Type of range calculation
   interval?: number; // Interval for multiple ranges
   location_type?: "start" | "destination"; // Location type for calculation
   smoothing?: number; // Smoothing factor for isochrone shapes
   attributes?: string[]; // Include attributes in response
   intersections?: boolean; // Include intersections
   units?: "m" | "km" | "mi"; // Units for distance measurements
   area_units?: "m" | "km" | "ha" | "mi" | "ft"; // Units for area calculations
}

// Isochrone response (GeoJSON format) - ready to display on a map
export interface IsochroneResponse extends GeoJSONFeatureCollection {
   // Standard metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: Record<string, unknown>;
      engine: { version: string; build_date: string; graph_date: string };
   };
   bbox: [number, number, number, number]; // Bounding box
}
