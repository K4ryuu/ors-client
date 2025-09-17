import type { OptimizationRequest, OptimizationResponse } from "../types/optimization.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

export class OptimizationService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   // Solve the traveling salesman problem - find the best route through multiple stops
   async solve(request: OptimizationRequest): Promise<OptimizationResponse> {
      return this.post<OptimizationResponse>("/optimization", request);
   }
}
