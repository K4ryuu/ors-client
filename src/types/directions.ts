// Types for the directions/routing service

import type { Coordinate, BaseRequest, DistanceUnit, LanguageCode, GeoJSONFeatureCollection } from "./common.js";

// GeoJSON LineString geometry for decoded routes
export interface RouteGeometry {
   type: "LineString";
   coordinates: Coordinate[]; // Array of [longitude, latitude] coordinates
}

// How you want your route calculated - choose your adventure
export type RoutingPreference = "recommended" | "fastest" | "shortest";

// Format for turn-by-turn instructions
export type InstructionFormat = "text" | "json";

// Config for getting alternative routes - when you want "show me 2-3 different ways to get there"
export interface AlternativeRoutes {
   target_count?: number; // How many alternative routes you want (besides the main one)
   weight_factor?: number; // How different the alternatives should be (higher = more different routes)
}

// Extra info you can request about your route
export type RouteAttribute = "avgspeed" | "percentage" | "detourfactor" | "tollways";

// Custom routing rules - for when you want to get fancy with "avoid roads over 50km/h" etc.
export interface CustomModel {
   speed?: Array<{ if: boolean | string; limit_to?: number }>;
   priority?: Array<{ if: string; multiply_by: number }>;
   distance_influence?: number; // How much distance vs time matters (0 = only time, 1 = only distance)
}

// Extra routing options - all the ways to customize your route
export interface RoutingOptions {
   avoid_borders?: "all" | "controlled" | "none"; // Border crossing preferences
   avoid_features?: Array<"highways" | "tollways" | "ferries" | "fords" | "steps">; // Road/route features to avoid
   avoid_countries?: string[]; // Countries to avoid (2-letter codes like 'DE', 'FR')
   vehicle_type?: "hgv" | "agricultural" | "delivery" | "forestry" | "goods"; // Vehicle type for heavy vehicle routing

   // Vehicle specifications (mainly for trucks)
   profile_params?: {
      restrictions?: {
         length?: number; // Max length in meters
         width?: number; // Max width in meters
         height?: number; // Max height in meters
         axleload?: number; // Max axle load in tons
         weight?: number; // Max total weight in tons
         hazmat?: boolean; // Carrying hazardous materials
      };
      surface_quality_known?: boolean; // Only use roads with known surface quality
      allow_unsuitable?: boolean; // Allow roads marked as "unsuitable"
   };
}

// Simple GET request for basic directions - just start and end points, no fancy options
export interface DirectionsGetRequest {
   start: Coordinate; // Where you're starting from [longitude, latitude]
   end: Coordinate; // Where you want to go [longitude, latitude]
}

// Advanced POST request for directions with all the bells and whistles
export interface DirectionsPostRequest extends BaseRequest {
   coordinates: Coordinate[]; // Your route points [longitude, latitude] - can be just start+end, or include waypoints
   alternative_routes?: AlternativeRoutes; // Get alternative routes
   attributes?: RouteAttribute[]; // Extra route info to include
   continue_straight?: boolean; // Force going straight at waypoints (don't allow U-turns)
   custom_model?: CustomModel; // Custom routing rules
   extra_info?: ("steepness" | "suitability" | "surface" | "waycategory" | "waytype" | "tollways" | "traildifficulty" | "osmid" | "roadaccessrestrictions" | "countryinfo" | "green" | "noise")[];
   elevation?: boolean; // Include elevation changes in the route
   geometry_simplify?: boolean; // Simplify the route geometry (fewer points, smaller response)
   instructions?: boolean; // Get turn-by-turn instructions
   instructions_format?: InstructionFormat; // Format for the instructions
   language?: LanguageCode; // Language for instructions
   maneuvers?: boolean; // Include detailed maneuver info (for navigation apps)
   options?: RoutingOptions; // Routing preferences and restrictions
   preference?: RoutingPreference; // Route optimization preference
   radiuses?: number[]; // Search radius around each coordinate (in meters)
   roundabout_exits?: boolean; // Include roundabout exit numbers
   skip_segments?: number[]; // Skip certain segments (advanced usage)
   suppress_warnings?: boolean; // Don't show warning messages
   units?: DistanceUnit; // Units for distances
   geometry?: boolean; // Include route geometry
   maximum_speed?: number; // Maximum speed limit to consider
   format?: "json" | "geojson"; // Response format
}

// A single step in your route with turn-by-turn instructions
export interface RouteStep {
   distance: number; // Distance of this step in meters
   duration: number; // How long this step takes in seconds
   type: number; // Type of instruction (internal ORS code)
   instruction: string; // The actual instruction text like "Turn left onto Main Street"
   name: string; // Street/road name for this step
   way_points: [number, number]; // Start and end points of this step in the route geometry

   // Detailed maneuver info (for navigation apps)
   maneuver?: {
      bearing_after: number; // Direction you'll be facing after the turn
      bearing_before: number; // Direction you were facing before the turn
      location: Coordinate; // Exact coordinates of the turn
      type: string; // Type of maneuver (turn, merge, etc.)
   };
}

// A segment of your route (between waypoints) - if you're going A -> B -> C, you'll get 2 segments
export interface RouteSegment {
   distance: number; // Distance of this segment in meters
   duration: number; // How long this segment takes in seconds
   steps: RouteStep[]; // Turn-by-turn steps for this segment
}

// Overall summary of your route
export interface RouteSummary {
   distance: number; // Total distance in meters
   duration: number; // Total travel time in seconds
   ascent?: number; // Total ascent in meters (when elevation=true)
   descent?: number; // Total descent in meters (when elevation=true)
}

// A complete route from start to finish
export interface Route {
   summary: RouteSummary; // Quick overview of the route
   segments: RouteSegment[]; // Detailed segments with turn-by-turn instructions
   geometry: string | RouteGeometry; // Encoded route geometry (polyline format) or decoded GeoJSON LineString
   way_points: number[]; // Important points along the route (start, waypoints, end)
   bbox: [number, number, number, number]; // Bounding box of the route [west, south, east, north]

   // Extra route information when requested
   extras?: Record<
      string,
      {
         values: [number, number, number][];
         summary: Array<{ value: number; distance: number; amount: number }>;
      }
   >;
}

// Response from the directions API
export interface DirectionsResponse {
   routes: Route[]; // All the routes (main route + alternatives)
   bbox: [number, number, number, number]; // Bounding box covering all routes

   // API metadata
   metadata: {
      attribution: string;
      service: string;
      timestamp: number;
      query: Record<string, unknown>;
      engine: { version: string; build_date: string; graph_date: string };
   };
}

// Directions response in GeoJSON format - perfect for displaying routes on maps
export interface DirectionsGeoJSONResponse extends GeoJSONFeatureCollection {
   metadata: DirectionsResponse["metadata"]; // API metadata
   bbox: [number, number, number, number]; // Bounding box of all routes
}
