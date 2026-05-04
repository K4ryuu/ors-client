import type { ElevationPointRequest, ElevationLineRequest, ElevationPointResponse, ElevationLineResponse, ElevationGeoJSONResponse } from "../types/elevation.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

/**
 * Elevation service - get height above sea level for points or along routes.
 *
 * Useful for hiking/cycling route planning, terrain analysis, or any scenario
 * where you care about how hilly the path is.
 */
export class ElevationService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Get elevation for a single coordinate.
    *
    * @param request - Point geometry and desired input/output formats
    * @returns Elevation data in the requested format; GeoJSON if `format_out` is `"geojson"`, plain point otherwise
    * @throws {OpenRouteServiceError} On invalid coordinates or API errors
    *
    * @example
    * const result = await ors.elevation.getPointElevation({
    *   format_in: "point",
    *   format_out: "geojson",
    *   geometry: { type: "Point", coordinates: [8.681495, 49.41461] }
    * });
    */
   async getPointElevation(request: ElevationPointRequest): Promise<ElevationPointResponse | ElevationGeoJSONResponse> {
      return this.post<ElevationPointResponse | ElevationGeoJSONResponse>("/elevation/point", request);
   }

   /**
    * Get elevation profile along a line - returns elevation for every point on the path.
    * Perfect for charting elevation changes along a hiking or cycling route.
    *
    * @param request - Line geometry (GeoJSON, polyline, or encoded polyline) and output format preferences
    * @returns Elevation profile in the requested format
    * @throws {OpenRouteServiceError} On invalid geometry or API errors
    *
    * @example
    * const profile = await ors.elevation.getLineElevation({
    *   format_in: "geojson",
    *   format_out: "geojson",
    *   geometry: { type: "LineString", coordinates: [[8.681, 49.414], [8.686, 49.419]] }
    * });
    */
   async getLineElevation(request: ElevationLineRequest): Promise<ElevationLineResponse | ElevationGeoJSONResponse> {
      return this.post<ElevationLineResponse | ElevationGeoJSONResponse>("/elevation/line", request);
   }
}
