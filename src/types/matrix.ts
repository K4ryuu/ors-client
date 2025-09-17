// Types for the matrix service (distance/duration calculations between points)

import type { Coordinate, BaseRequest } from "./common.js";

// What you want to calculate between your points
export type MatrixMetric = "duration" | "distance";

// Request for calculating matrices - throw in your locations and get back travel times/distances
export interface MatrixRequest extends BaseRequest {
   locations: Coordinate[]; // Array of coordinates
   destinations?: number[]; // Indices of destination points from locations array
   metrics?: MatrixMetric[]; // Metrics to calculate
   resolve_locations?: boolean; // Include resolved location information
   sources?: number[]; // Indices of source points from locations array
}

// Info about where ORS actually snapped your coordinates to the road network
export interface ResolvedLocation {
   location: Coordinate; // Resolved coordinates
   snapped_distance: number; // Distance from original to snapped location in meters
   name?: string; // Name of the street/location
}

// Response with your distance/duration matrices - the good stuff
export interface MatrixResponse {
   durations?: number[][]; // Duration matrix (in seconds)
   distances?: number[][]; // Distance matrix (in meters)
   destinations?: ResolvedLocation[]; // Resolved location information
   sources?: ResolvedLocation[];

   // Standard metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: Record<string, unknown>;
      engine: { version: string; build_date: string; graph_date: string };
   };
}
