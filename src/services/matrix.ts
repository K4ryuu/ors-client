import type { Profile, ClientConfig } from "../types/common.js";
import type { MatrixRequest, MatrixResponse } from "../types/matrix.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 2;

/**
 * Matrix service - calculate distances and travel times between multiple points
 *
 * Think of it like a spreadsheet where you have multiple locations and want to know
 * how far each one is from all the others. Super useful for delivery route planning
 * or finding the closest store to a customer.
 */
export class MatrixService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Calculate distance and/or duration matrix between multiple points
    *
    * You give it a bunch of coordinates and it tells you how far/long it takes
    * to get from each point to every other point. Perfect for logistics and routing.
    *
    * @param profile - How you're traveling (car, bike, walking, etc.)
    * @param request - Your locations and what you want to calculate
    *
    * @example
    * ```typescript
    * // Get distances and travel times between 3 points
    * const matrix = await client.matrix.calculateMatrix('driving-car', {
    *   locations: [
    *     [8.681495, 49.41461],   // point A
    *     [8.686507, 49.41943],   // point B
    *     [8.687872, 49.420318]   // point C
    *   ],
    *   metrics: ['duration', 'distance']  // want both time and distance
    * });
    *
    * // matrix.durations[0][1] = time from A to B
    * // matrix.distances[0][1] = distance from A to B
    * ```
    *
    * @example
    * ```typescript
    * // Calculate delivery times from 2 warehouses to 3 customers
    * const matrix = await client.matrix.calculateMatrix('driving-car', {
    *   locations: [
    *     [8.681495, 49.41461],   // warehouse 1
    *     [8.686507, 49.41943],   // warehouse 2
    *     [8.687872, 49.420318],  // customer 1
    *     [8.690123, 49.425456],  // customer 2
    *     [8.692456, 49.428789]   // customer 3
    *   ],
    *   sources: [0, 1],          // only start from warehouses
    *   destinations: [2, 3, 4],  // only deliver to customers
    *   metrics: ['duration']
    * });
    * ```
    */
   async calculateMatrix(profile: Profile, request: MatrixRequest): Promise<MatrixResponse> {
      return this.post<MatrixResponse>(`/matrix/${profile}`, request);
   }
}
