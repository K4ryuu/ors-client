import { describe, it, expect } from "bun:test";
import { Coordinate, OpenRouteService } from "../src/index.js";

describe("Snap Service", () => {
   const apiKey = process.env.ORS_API_KEY;
   if (!apiKey) throw new Error("ORS_API_KEY environment variable is required for testing");
   const client = new OpenRouteService({ apiKey });

   const testLocations: [Coordinate, Coordinate] = [
      [19.0545, 47.4979],
      [19.0227, 47.5078],
   ];

   it("should snap locations to nearest roads (JSON)", async () => {
      const result = await client.snap.snapLocations("driving-car", {
         locations: testLocations,
         radius: 100,
      });

      expect(result.locations).toBeTruthy();
      expect(Array.isArray(result.locations)).toBe(true);
      expect(result.locations.length).toBe(testLocations.length);

      const snappedCount = result.locations.filter((loc) => loc !== null).length;
      expect(snappedCount).toBeGreaterThan(0);

      const firstSnapped = result.locations.find((loc) => loc !== null);
      if (firstSnapped) {
         expect(Array.isArray(firstSnapped.location)).toBe(true);
         expect(firstSnapped.location.length).toBe(2);
         expect(typeof firstSnapped.snapped_distance).toBe("number");
         expect(firstSnapped.snapped_distance).toBeGreaterThanOrEqual(0);
         if (firstSnapped.name) expect(typeof firstSnapped.name).toBe("string");
      }

      expect(result.metadata.service).toBe("snap");
      expect(result.metadata.query.profile).toBe("driving-car");
      expect(result.metadata.query.radius).toBe(100);
   });

   it("should snap locations as GeoJSON", async () => {
      const result = await client.snap.snapLocationsGeoJSON("foot-walking", {
         locations: testLocations,
         radius: 200,
      });

      expect(result.type).toBe("FeatureCollection");
      expect(Array.isArray(result.features)).toBe(true);

      if (result.features.length > 0) {
         const f = result.features[0]!;
         expect(f.type).toBe("Feature");
         expect(f.geometry.type).toBe("Point");
         expect(Array.isArray(f.geometry.coordinates)).toBe(true);
         expect(f.geometry.coordinates.length).toBe(2);
         expect(typeof f.properties.source_id).toBe("number");
         expect(f.properties.source_id).toBeGreaterThanOrEqual(0);
         expect(typeof f.properties.snapped_distance).toBe("number");
         if (f.properties.name) expect(typeof f.properties.name).toBe("string");
      }
   });
});
