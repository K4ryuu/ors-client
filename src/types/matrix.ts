// Types for the matrix service (distance/duration calculations between points)

import type { Coordinate, BaseRequest } from "./common.js";

/**
 * What to calculate between locations.
 * - `"duration"` - travel time in seconds
 * - `"distance"` - distance in meters
 */
export type MatrixMetric = "duration" | "distance";

/** Request to compute a distance/duration matrix between multiple locations. */
export interface MatrixRequest extends BaseRequest {
   /** All locations as `[longitude, latitude]` pairs. */
   locations: Coordinate[];
   /**
    * Indices from `locations` to use as destinations.
    * If omitted, all locations are used as destinations.
    */
   destinations?: number[];
   /** Which metrics to compute. Defaults to `["duration"]`. */
   metrics?: MatrixMetric[];
   /** Include snapped coordinate info for sources and destinations in the response. */
   resolve_locations?: boolean;
   /**
    * Indices from `locations` to use as sources.
    * If omitted, all locations are used as sources.
    */
   sources?: number[];
}

/** Where ORS snapped a coordinate to the road network. */
export interface ResolvedLocation {
   /** The snapped coordinates on the road network. */
   location: Coordinate;
   /** Distance from the original input point to the snapped location in meters. */
   snapped_distance: number;
   /** Name of the road or place at the snapped location, if available. */
   name?: string;
}

/** Matrix API response - 2D arrays of durations and/or distances plus metadata. */
export interface MatrixResponse {
   /**
    * Duration matrix in seconds. `durations[i][j]` = travel time from source `i` to destination `j`.
    * Only present when `"duration"` was requested.
    */
   durations?: number[][];
   /**
    * Distance matrix in meters. `distances[i][j]` = distance from source `i` to destination `j`.
    * Only present when `"distance"` was requested.
    */
   distances?: number[][];
   /** Snapped destination locations (present when `resolve_locations: true`). */
   destinations?: ResolvedLocation[];
   /** Snapped source locations (present when `resolve_locations: true`). */
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
