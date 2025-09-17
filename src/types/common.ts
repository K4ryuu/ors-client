// [longitude, latitude] - yep, longitude comes first like everyone expects!
export type Coordinate = [number, number];

// How you're getting around - pick your poison
export type Profile =
   | "driving-car" // Regular car
   | "driving-hgv" // Heavy goods vehicle (trucks)
   | "cycling-regular" // Regular bike
   | "cycling-road" // Road bike (faster, avoids rough surfaces)
   | "cycling-mountain" // Mountain bike (can handle rougher terrain)
   | "cycling-electric" // E-bike (bit faster than regular)
   | "foot-walking" // Walking
   | "foot-hiking" // Hiking (can use trails, paths)
   | "wheelchair"; // Wheelchair accessible routes

// Your API authentication config
export interface AuthConfig {
   apiKey: string; // Your OpenRouteService API key
}

// Configuration for the OpenRouteService client
export interface ClientConfig extends AuthConfig {
   baseUrl?: string; // API base URL (leave default unless you know what you're doing)
   timeout?: number; // Request timeout in milliseconds (default: 30000)
   headers?: Record<string, string>; // Extra headers to send with requests
}

// Standard API error response from ORS
export interface ApiError {
   error: {
      code: number; // Error code number
      message: string; // What went wrong
   };
}

// Response format options - pick what works best for your use case
export type ResponseFormat = "json" | "geojson" | "gpx" | "topojson";

// Distance units - because not everyone uses meters
export type DistanceUnit = "m" | "km" | "mi";

// Language codes for instructions - supports most major languages, use the 2-letter code
export type LanguageCode = "en" | "de" | "fr" | "es" | "it" | "nl" | "pt" | "ru" | "zh" | "ja" | "ko" | "pl" | "cs" | "sk" | "hu" | "ro" | "bg" | "hr" | "sr" | "sl" | "et" | "lv" | "lt" | "fi" | "sv" | "no" | "da";

// Base request interface - most API calls extend this
export interface BaseRequest {
   id?: string; // Optional request identifier
}

// GeoJSON geometry object - the standard way to represent geographic shapes
export interface GeoJSONGeometry {
   type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
   coordinates: number[] | number[][] | number[][][];
}

// GeoJSON feature object - a geographic feature with properties
export interface GeoJSONFeature {
   type: "Feature";
   geometry: GeoJSONGeometry;
   properties: Record<string, unknown>;
}

// GeoJSON feature collection - a collection of geographic features
export interface GeoJSONFeatureCollection {
   type: "FeatureCollection";
   features: GeoJSONFeature[];
}

// Bounding box coordinates [west, south, east, north] - the extent of your area
export type BoundingBox = [number, number, number, number];
