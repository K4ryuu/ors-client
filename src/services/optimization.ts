import type { OptimizationRequest, OptimizationResponse } from "../types/optimization.js";
import type { ClientConfig } from "../types/common.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 1;

/**
 * Optimization service - solve vehicle routing problems (VRP).
 *
 * Figures out the most efficient way to assign jobs to vehicles, respecting
 * constraints like time windows, vehicle capacity, and required skills.
 * Think delivery route optimization, field technician scheduling, etc.
 */
export class OptimizationService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Solve a vehicle routing problem - assigns jobs to vehicles and finds optimal routes.
    *
    * @param request - Problem definition: vehicles, jobs (or shipments), and optional constraints
    * @returns Optimized solution with per-vehicle routes, a summary, and any unassigned jobs
    * @throws {OpenRouteServiceError} On invalid input, unsolvable constraints, or API errors
    *
    * @example
    * const solution = await ors.optimization.solve({
    *   vehicles: [{ id: 1, profile: "driving-car", start: [8.681495, 49.41461] }],
    *   jobs: [
    *     { id: 1, location: [8.686507, 49.41943] },
    *     { id: 2, location: [8.692, 49.425] },
    *   ],
    * });
    * console.log(solution.routes[0].steps);
    */
   async solve(request: OptimizationRequest): Promise<OptimizationResponse> {
      return this.post<OptimizationResponse>("/optimization", request);
   }
}
