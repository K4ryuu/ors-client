/** A geographic coordinate as `[longitude, latitude]`. Note: longitude comes first! */
export type Coordinate = [number, number];

/**
 * Routing profile - defines the mode of transport and the road network to use.
 *
 * - `"driving-car"` - regular passenger car
 * - `"driving-hgv"` - heavy goods vehicle (trucks), respects weight/height limits
 * - `"cycling-regular"` - standard bike
 * - `"cycling-road"` - road bike, prefers smooth surfaces and faster roads
 * - `"cycling-mountain"` - mountain bike, handles rougher terrain
 * - `"cycling-electric"` - e-bike, slightly faster than regular cycling
 * - `"foot-walking"` - walking on footpaths and roads
 * - `"foot-hiking"` - hiking, can use trails and paths not suitable for walking
 * - `"wheelchair"` - wheelchair-accessible routes only
 */
export type Profile =
   | "driving-car"
   | "driving-hgv"
   | "cycling-regular"
   | "cycling-road"
   | "cycling-mountain"
   | "cycling-electric"
   | "foot-walking"
   | "foot-hiking"
   | "wheelchair";

/** Auth-only config - just the API key. Prefer `ClientConfig` for full client setup. */
export interface AuthConfig {
   /** Your OpenRouteService API key. Get one free at https://openrouteservice.org/sign-up/ */
   apiKey: string;
}

/** Configuration for the OpenRouteService client. */
export interface ClientConfig {
   /** Your ORS API key. Required for the public API; omit for self-hosted instances. */
   apiKey?: string;
   /** Custom API base URL. Only needed for self-hosted ORS instances. */
   baseUrl?: string;
   /** Request timeout in milliseconds. Defaults to 30000 (30s). */
   timeout?: number;
   /** Extra HTTP headers to include with every request. */
   headers?: Record<string, string>;
   /**
    * Cache configuration. Pass a number to use the built-in in-memory cache with that TTL (in ms),
    * or a `CacheConfig` object to use a custom adapter (e.g. Redis).
    */
   cache?: number | CacheConfig;
}

/** Standard error response shape returned by the ORS API on failure. */
export interface ApiError {
   error: {
      /** ORS-specific error code number. */
      code: number;
      /** Human-readable description of what went wrong. */
      message: string;
   };
}

/** Available response formats for some ORS endpoints. */
export type ResponseFormat = "json" | "geojson" | "gpx" | "topojson";

/** Distance units supported across ORS services. */
export type DistanceUnit = "m" | "km" | "mi";

/**
 * ISO 639-1 language codes supported for turn-by-turn instruction text.
 * Use the 2-letter code, e.g. `"en"` for English, `"de"` for German.
 */
export type LanguageCode = "en" | "de" | "fr" | "es" | "it" | "nl" | "pt" | "ru" | "zh" | "ja" | "ko" | "pl" | "cs" | "sk" | "hu" | "ro" | "bg" | "hr" | "sr" | "sl" | "et" | "lv" | "lt" | "fi" | "sv" | "no" | "da";

/** Base fields shared by most ORS request bodies. */
export interface BaseRequest {
   /** Optional identifier for correlating requests/responses. Passed through as-is. */
   id?: string;
}

/** Standard GeoJSON geometry object. */
export interface GeoJSONGeometry {
   type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
   coordinates: number[] | number[][] | number[][][];
}

/** Standard GeoJSON Feature - a geometry plus arbitrary properties. */
export interface GeoJSONFeature {
   type: "Feature";
   geometry: GeoJSONGeometry;
   properties: Record<string, unknown>;
}

/** Standard GeoJSON FeatureCollection - a list of features. */
export interface GeoJSONFeatureCollection {
   type: "FeatureCollection";
   features: GeoJSONFeature[];
}

/** Bounding box as `[west, south, east, north]` - the geographic extent of an area. */
export type BoundingBox = [number, number, number, number];

/**
 * Full request context passed to a `buildKey` function.
 * Contains everything needed to build a unique cache key for any request.
 */
export interface CacheKeyContext {
   /** HTTP method of the request. */
   method: 'GET' | 'POST';
   /** Endpoint path, e.g. `/directions/driving-car`. */
   endpoint: string;
   /** Query parameters for GET requests. */
   params?: Record<string, unknown>;
   /** Request body for POST requests. */
   body?: unknown;
}

/**
 * Plug in any cache storage backend - Redis, a DB, a plain Map, whatever.
 * Both sync and async implementations are supported.
 */
export interface CacheAdapter {
   /**
    * Retrieve a cached value by key.
    * @returns The cached value, or `null`/`undefined` on miss
    */
   get(key: string): unknown | Promise<unknown>;
   /**
    * Store a value under a key with a TTL.
    * @param ttl - Time-to-live in milliseconds
    */
   set(key: string, value: unknown, ttl: number): void | Promise<void>;
}

/** Full cache configuration when you need control over adapter, TTL, or key generation. */
export interface CacheConfig {
   /** The cache storage backend to use. */
   adapter: CacheAdapter;
   /** Cache TTL in milliseconds. Defaults to 60000 (60s). */
   ttl?: number;
   /** Custom key builder. Defaults to `defaultBuildKey` if not provided. */
   buildKey?: (ctx: CacheKeyContext) => string;
}
