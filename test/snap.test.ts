import "dotenv/config";
import { describe, it } from "node:test";
import assert from "node:assert";
import { Coordinate, OpenRouteService } from "../src/index.js";

describe("Snap Service", () => {
   const apiKey = process.env.ORS_API_KEY;
   if (!apiKey) {
      throw new Error("ORS_API_KEY environment variable is required for testing");
   }
   const client = new OpenRouteService({ apiKey });

   const testLocations: [Coordinate, Coordinate] = [
      [19.0545, 47.4979], // Near Deák Ferenc tér (slightly off)
      [19.0227, 47.5078], // Near Széll Kálmán tér (slightly off)
   ];

   it("should snap locations to nearest roads (JSON)", async () => {
      const result = await client.snap.snapLocations("driving-car", {
         locations: testLocations,
         radius: 100,
      });

      assert(result, "Result should be defined");
      assert(result.locations, "Locations should be defined");
      assert(Array.isArray(result.locations), "Locations should be an array");
      assert.strictEqual(result.locations.length, testLocations.length, "Should have same number of locations");

      // Check that at least some locations were successfully snapped
      const snappedCount = result.locations.filter((loc) => loc !== null).length;
      assert(snappedCount > 0, "At least one location should be snapped");

      // Test structure of snapped locations
      const firstSnapped = result.locations.find((loc) => loc !== null);
      if (firstSnapped) {
         assert(firstSnapped.location, "Snapped location should have coordinates");
         assert(Array.isArray(firstSnapped.location), "Location should be an array");
         assert.strictEqual(firstSnapped.location.length, 2, "Location should have 2 coordinates");
         assert.strictEqual(typeof firstSnapped.snapped_distance, "number", "Snapped distance should be a number");
         assert(firstSnapped.snapped_distance >= 0, "Snapped distance should be non-negative");
         if (firstSnapped.name) {
            assert.strictEqual(typeof firstSnapped.name, "string", "Name should be a string");
         }
      }

      // Test response metadata
      assert(result.metadata, "Metadata should be defined");
      assert.strictEqual(result.metadata.service, "snap", "Service should be snap");
      assert(result.metadata.query, "Query should be defined");
      assert.strictEqual(result.metadata.query.profile, "driving-car", "Profile should match");
      assert.strictEqual(result.metadata.query.radius, 100, "Radius should match");
   });

   it("should snap locations as GeoJSON", async () => {
      const result = await client.snap.snapLocationsGeoJSON("foot-walking", {
         locations: testLocations,
         radius: 200,
      });

      assert(result, "Result should be defined");
      assert.strictEqual(result.type, "FeatureCollection", "Should be a FeatureCollection");
      assert(result.features, "Features should be defined");
      assert(Array.isArray(result.features), "Features should be an array");

      // Test GeoJSON feature structure
      if (result.features.length > 0) {
         const firstFeature = result.features[0];
         assert.strictEqual(firstFeature.type, "Feature", "Should be a Feature");
         assert(firstFeature.geometry, "Geometry should be defined");
         assert.strictEqual(firstFeature.geometry.type, "Point", "Geometry should be a Point");
         assert(firstFeature.geometry.coordinates, "Coordinates should be defined");
         assert(Array.isArray(firstFeature.geometry.coordinates), "Coordinates should be an array");
         assert.strictEqual(firstFeature.geometry.coordinates.length, 2, "Should have 2 coordinates");

         assert(firstFeature.properties, "Properties should be defined");
         assert.strictEqual(typeof firstFeature.properties.source_id, "number", "Source ID should be a number");
         assert(firstFeature.properties.source_id >= 0, "Source ID should be non-negative");
         assert.strictEqual(typeof firstFeature.properties.snapped_distance, "number", "Snapped distance should be a number");
         if (firstFeature.properties.name) {
            assert.strictEqual(typeof firstFeature.properties.name, "string", "Name should be a string");
         }
      }
   });
});
