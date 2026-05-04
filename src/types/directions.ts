// Types for the directions/routing service

import type { Coordinate, BaseRequest, DistanceUnit, LanguageCode, GeoJSONFeatureCollection } from "./common.js";

/** GeoJSON LineString geometry representing a decoded route path. */
export interface RouteGeometry {
   type: "LineString";
   /** Array of `[longitude, latitude]` coordinate pairs along the route. */
   coordinates: Coordinate[];
}

/**
 * How you want the route optimized.
 * - `"recommended"` - ORS's default, balances speed and road quality
 * - `"fastest"` - minimize travel time
 * - `"shortest"` - minimize distance
 */
export type RoutingPreference = "recommended" | "fastest" | "shortest";

/**
 * Format for turn-by-turn instruction text.
 * - `"text"` - plain string like "Turn left onto Main Street"
 * - `"json"` - structured object with separate fields
 */
export type InstructionFormat = "text" | "json";

/** Config for requesting alternative routes alongside the main one. */
export interface AlternativeRoutes {
   /** How many alternative routes to return (in addition to the primary). */
   target_count?: number;
   /** How different alternatives should be from each other - higher = more distinct routes. */
   weight_factor?: number;
}

/**
 * Extra route attributes to include in the response.
 * - `"avgspeed"` - average speed per segment
 * - `"percentage"` - what percentage of the route each segment covers
 * - `"detourfactor"` - how much longer this route is vs. a straight line
 * - `"tollways"` - whether segments use tollways
 */
export type RouteAttribute = "avgspeed" | "percentage" | "detourfactor" | "tollways";

/** Custom routing model - fine-grained control over speed limits and road priority. */
export interface CustomModel {
   /** Speed rules: conditionally cap speed to a value. */
   speed?: Array<{ if: boolean | string; limit_to?: number }>;
   /** Priority rules: multiply the cost of certain roads. */
   priority?: Array<{ if: string; multiply_by: number }>;
   /** How much distance vs. time is weighted: 0 = only time, 1 = only distance. */
   distance_influence?: number;
}

/** Extra routing options - avoidance rules, vehicle specs, border crossing preferences. */
export interface RoutingOptions {
   /** Border crossing preference: `"all"` avoids all borders, `"controlled"` avoids uncontrolled ones. */
   avoid_borders?: "all" | "controlled" | "none";
   /** Road/route feature types to avoid. */
   avoid_features?: Array<"highways" | "tollways" | "ferries" | "fords" | "steps">;
   /** ISO 3166-1 alpha-2 country codes to avoid, e.g. `["DE", "FR"]`. */
   avoid_countries?: string[];
   /** Vehicle type for HGV-specific routing rules. */
   vehicle_type?: "hgv" | "agricultural" | "delivery" | "forestry" | "goods";

   // Vehicle specifications (mainly for trucks)
   profile_params?: {
      restrictions?: {
         /** Max vehicle length in meters. */
         length?: number;
         /** Max vehicle width in meters. */
         width?: number;
         /** Max vehicle height in meters. */
         height?: number;
         /** Max axle load in tons. */
         axleload?: number;
         /** Max total weight in tons. */
         weight?: number;
         /** Whether the vehicle is carrying hazardous materials. */
         hazmat?: boolean;
      };
      /** Only use roads where surface quality is known. */
      surface_quality_known?: boolean;
      /** Allow roads marked as unsuitable for the profile. */
      allow_unsuitable?: boolean;
   };
}

/** Simple GET request for basic A-to-B directions - just start and end, no extra options. */
export interface DirectionsGetRequest {
   /** Start coordinate as `[longitude, latitude]`. */
   start: Coordinate;
   /** End coordinate as `[longitude, latitude]`. */
   end: Coordinate;
}

/**
 * Full POST request for directions with all options.
 * Use this for anything beyond a basic A-to-B route.
 */
export interface DirectionsPostRequest extends BaseRequest {
   /** Route waypoints as `[longitude, latitude]` pairs. Minimum two points (start + end). */
   coordinates: Coordinate[];
   /** Request alternative routes alongside the primary one. */
   alternative_routes?: AlternativeRoutes;
   /** Extra per-segment attributes to include in the response. */
   attributes?: RouteAttribute[];
   /** Force the route to continue straight at intermediate waypoints - no U-turns. */
   continue_straight?: boolean;
   /** Custom routing model for advanced speed/priority rules. */
   custom_model?: CustomModel;
   /** Extra layer info to include (surface type, steepness, OSM IDs, etc.). */
   extra_info?: ("steepness" | "suitability" | "surface" | "waycategory" | "waytype" | "tollways" | "traildifficulty" | "osmid" | "roadaccessrestrictions" | "countryinfo" | "green" | "noise")[];
   /** Include elevation data in the route geometry (adds a third Z coordinate). */
   elevation?: boolean;
   /** Reduce the number of geometry points in the response to save bandwidth. */
   geometry_simplify?: boolean;
   /** Include turn-by-turn instruction steps. */
   instructions?: boolean;
   /** Format for instruction text. */
   instructions_format?: InstructionFormat;
   /** Language for instruction text. */
   language?: LanguageCode;
   /** Include detailed maneuver info per step - useful for nav apps. */
   maneuvers?: boolean;
   /** Routing avoidance and vehicle restriction options. */
   options?: RoutingOptions;
   /** How to optimize the route. */
   preference?: RoutingPreference;
   /** Search radius in meters for snapping each coordinate to the road network. */
   radiuses?: number[];
   /** Include roundabout exit numbers in instructions. */
   roundabout_exits?: boolean;
   /** Segment indices to skip - advanced use only. */
   skip_segments?: number[];
   /** Suppress API warning messages in the response. */
   suppress_warnings?: boolean;
   /** Distance unit for the response. */
   units?: DistanceUnit;
   /** Include route geometry in the response. */
   geometry?: boolean;
   /** Maximum speed (km/h) to consider when routing. */
   maximum_speed?: number;
   /** Explicit response format override. */
   format?: "json" | "geojson";
}

/** A single turn-by-turn step within a route segment. */
export interface RouteStep {
   /** Distance covered by this step in meters. */
   distance: number;
   /** Time to complete this step in seconds. */
   duration: number;
   /** ORS internal instruction type code. */
   type: number;
   /** Human-readable instruction, e.g. `"Turn left onto Main Street"`. */
   instruction: string;
   /** Name of the road or path for this step. */
   name: string;
   /** `[start, end]` indices into the route geometry array for this step. */
   way_points: [number, number];

   // Detailed maneuver info (for navigation apps)
   maneuver?: {
      /** Bearing (degrees) you'll face after the maneuver. */
      bearing_after: number;
      /** Bearing (degrees) you were facing before the maneuver. */
      bearing_before: number;
      /** Exact coordinates where the maneuver happens. */
      location: Coordinate;
      /** Type of maneuver, e.g. `"turn"`, `"merge"`. */
      type: string;
   };
}

/**
 * A segment of the route - the portion between two consecutive waypoints.
 * If you have A → B → C, you get two segments.
 */
export interface RouteSegment {
   /** Total distance of this segment in meters. */
   distance: number;
   /** Total time for this segment in seconds. */
   duration: number;
   /** Turn-by-turn steps within this segment. */
   steps: RouteStep[];
}

/** High-level summary of a route. */
export interface RouteSummary {
   /** Total route distance in meters. */
   distance: number;
   /** Estimated total travel time in seconds. */
   duration: number;
   /** Total elevation gain in meters (only when `elevation: true`). */
   ascent?: number;
   /** Total elevation loss in meters (only when `elevation: true`). */
   descent?: number;
}

/** A complete route from start to finish, including geometry, steps, and optional extras. */
export interface Route {
   /** High-level overview of the route. */
   summary: RouteSummary;
   /** Detailed segments with turn-by-turn steps. */
   segments: RouteSegment[];
   /** Route path - encoded polyline string or decoded GeoJSON LineString depending on request options. */
   geometry: string | RouteGeometry;
   /** Indices of key points (start, waypoints, end) in the route geometry. */
   way_points: number[];
   /** Bounding box of the route as `[west, south, east, north]`. */
   bbox: [number, number, number, number];

   // Extra route information when requested
   extras?: Record<
      string,
      {
         values: [number, number, number][];
         summary: Array<{ value: number; distance: number; amount: number }>;
      }
   >;
}

/** Response from the directions API - contains one or more routes with full metadata. */
export interface DirectionsResponse {
   /** All computed routes - first is primary, rest are alternatives. */
   routes: Route[];
   /** Bounding box covering all returned routes. */
   bbox: [number, number, number, number];

   // API metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: Record<string, unknown>;
      engine: { version: string; build_date: string; graph_date: string };
   };
}

/** Directions response in GeoJSON format - perfect for mapping libraries. */
export interface DirectionsGeoJSONResponse extends GeoJSONFeatureCollection {
   /** API metadata, same as in `DirectionsResponse`. */
   metadata: DirectionsResponse["metadata"];
   /** Bounding box covering all returned routes. */
   bbox: [number, number, number, number];
}
