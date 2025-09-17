// Main wrapper class that gives you access to all ORS services
import type { ClientConfig } from "./types/common.js";
import { DirectionsService } from "./services/directions.js";
import { MatrixService } from "./services/matrix.js";
import { IsochronesService } from "./services/isochrones.js";
import { GeocodingService } from "./services/geocoding.js";
import { POIService } from "./services/pois.js";
import { OptimizationService } from "./services/optimization.js";
import { ElevationService } from "./services/elevation.js";
import { SnapService } from "./services/snap.js";
import { ExportService } from "./services/export.js";

/**
 * The main OpenRouteService client - this is what you'll use most of the time.
 *
 * Just pass in your API key and you're good to go! Each service handles its own thing,
 * so you can mix and match as needed.
 *
 * @example
 * ```typescript
 * const ors = new OpenRouteService({ apiKey: 'your-key-here' });
 *
 * // Get a route
 * const route = await ors.directions.calculateRoute('driving-car', {
 *   coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]]
 * });
 * ```
 */
export class OpenRouteService {
   /** Get routes with turn-by-turn directions */
   public readonly directions: DirectionsService;
   /** Calculate distances/times between multiple points */
   public readonly matrix: MatrixService;
   /** Find what's reachable within X minutes/km from a point */
   public readonly isochrones: IsochronesService;
   /** Search for addresses and places */
   public readonly geocoding: GeocodingService;
   /** Find restaurants, ATMs, shops, etc. */
   public readonly pois: POIService;
   /** Solve vehicle routing problems (like delivery optimization) */
   public readonly optimization: OptimizationService;
   /** Get elevation data for points or along routes */
   public readonly elevation: ElevationService;
   /** Snap coordinates to the nearest roads */
   public readonly snap: SnapService;
   /** Export routing graph data from specific areas */
   public readonly export: ExportService;

   constructor(config: ClientConfig) {
      // Each service handles its own API version internally, so no worries about version conflicts
      this.directions = new DirectionsService(config);
      this.matrix = new MatrixService(config);
      this.isochrones = new IsochronesService(config);
      this.geocoding = new GeocodingService(config);
      this.pois = new POIService(config);
      this.optimization = new OptimizationService(config);
      this.elevation = new ElevationService(config);
      this.snap = new SnapService(config);
      this.export = new ExportService(config);
   }

   /**
    * Quick health check to see if the API is working
    */
   async healthCheck(): Promise<{ status: string }> {
      return this.directions.health();
   }

   /**
    * Get rate limit info from the most recent request made by any service
    */
   getLastRateLimitInfo() {
      const services = [this.directions, this.matrix, this.isochrones, this.geocoding, this.pois, this.optimization, this.elevation, this.snap, this.export];

      let mostRecentInfo = null;
      let mostRecentTime = new Date(0);

      for (const service of services) {
         const info = service.getLastRateLimitInfo();
         if (info && info.requestTimestamp > mostRecentTime) {
            mostRecentInfo = info;
            mostRecentTime = info.requestTimestamp;
         }
      }

      return mostRecentInfo;
   }
}
