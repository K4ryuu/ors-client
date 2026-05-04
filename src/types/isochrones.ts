// Types for the Isochrones service - draw areas you can reach within time/distance limits

import type { Coordinate, BaseRequest, GeoJSONFeatureCollection } from "./common.js";
import type { RoutingOptions } from "./directions.js";

/**
 * How range values are interpreted.
 * - `"time"` - range is in seconds (e.g. 600 = 10 minutes)
 * - `"distance"` - range is in meters
 */
export type IsochroneRangeType = "time" | "distance";

/** Request to compute reachable area polygons from one or more center points. */
export interface IsochroneRequest extends BaseRequest {
   /** Center point(s) for the isochrones as `[longitude, latitude]`. */
   locations: Coordinate[];
   /** Range values - seconds for `time`, meters for `distance`. Multiple values produce multiple rings. */
   range: number[];
   /** Whether `range` values are in time (seconds) or distance (meters). Defaults to `"time"`. */
   range_type?: IsochroneRangeType;
   /** Step size for generating multiple evenly-spaced isochrones within the max range. */
   interval?: number;
   /** Whether to calculate from the location (`"start"`) or towards it (`"destination"`). */
   location_type?: "start" | "destination";
   /** Smoothing factor (0–100) for the polygon edges - higher = smoother shapes. */
   smoothing?: number;
   /** Extra attributes to include in each feature's properties. */
   attributes?: string[];
   /** Whether to compute and include intersections between isochrones. */
   intersections?: boolean;
   /** Unit for distance range values. */
   units?: "m" | "km" | "mi";
   /** Unit for area values in the response properties. */
   area_units?: "m" | "km" | "ha" | "mi" | "ft";
   /** Routing avoidance and vehicle restriction options - same as the directions endpoint. */
   options?: RoutingOptions;
   /**
    * Departure time as an ISO 8601 datetime string.
    * Affects time-based reachability when using time-dependent routing profiles.
    */
   time?: string;
}

/** Isochrone API response - a GeoJSON FeatureCollection of reachable area polygons. */
export interface IsochroneResponse extends GeoJSONFeatureCollection {
   // Standard metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: Record<string, unknown>;
      engine: { version: string; build_date: string; graph_date: string };
   };
   /** Bounding box enclosing all isochrone polygons as `[west, south, east, north]`. */
   bbox: [number, number, number, number];
}
