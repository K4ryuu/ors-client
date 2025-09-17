import type { ElevationPointRequest, ElevationLineRequest, ElevationPointResponse, ElevationLineResponse, ElevationGeoJSONResponse } from "../types/elevation.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

export class ElevationService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   // Get elevation for specific points - how high above sea level?
   async getPointElevation(request: ElevationPointRequest): Promise<ElevationPointResponse | ElevationGeoJSONResponse> {
      return this.post<ElevationPointResponse | ElevationGeoJSONResponse>("/elevation/point", request);
   }

   // Get elevation profile along a path - perfect for hiking route planning
   async getLineElevation(request: ElevationLineRequest): Promise<ElevationLineResponse | ElevationGeoJSONResponse> {
      return this.post<ElevationLineResponse | ElevationGeoJSONResponse>("/elevation/line", request);
   }
}
