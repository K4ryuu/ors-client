import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Isochrones Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should calculate time-based isochrones", async () => {
      const response = await client.isochrones.calculateIsochrones("driving-car", {
         locations: [[8.681495, 49.41461]],
         range: [600, 1200], // 10 and 20 minutes
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.equal(response.features.length, 2); // Two time ranges

      // Check first isochrone
      const feature = response.features[0];
      assert.equal(feature.type, "Feature");
      assert.ok(feature.properties);
      assert.equal(feature.properties.value, 600);
      assert.ok(feature.geometry);
      assert.equal(feature.geometry.type, "Polygon");
   });

   test("should calculate distance-based isochrones", async () => {
      const response = await client.isochrones.calculateIsochrones("foot-walking", {
         locations: [[8.681495, 49.41461]],
         range: [1000], // 1km
         range_type: "distance",
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.equal(response.features.length, 1);

      const feature = response.features[0];
      assert.equal(feature.properties.value, 1000);
      assert.equal(feature.geometry.type, "Polygon");
   });

   test("should calculate isochrones for multiple locations", async () => {
      const response = await client.isochrones.calculateIsochrones("cycling-regular", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         range: [600], // 10 minutes
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.equal(response.features.length, 2); // Two locations

      response.features.forEach((feature, index) => {
         assert.equal(feature.type, "Feature");
         assert.equal(feature.properties.group_index, index);
         assert.equal(feature.properties.value, 600);
      });
   });

   test("should handle isochrones with custom options", async () => {
      const response = await client.isochrones.calculateIsochrones("driving-car", {
         locations: [[8.681495, 49.41461]],
         range: [300],
         smoothing: 0.9,
         location_type: "start",
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.equal(response.features.length, 1);
   });

   test("should handle invalid coordinates in isochrones", async () => {
      await assert.rejects(
         async () => {
            await client.isochrones.calculateIsochrones("driving-car", {
               locations: [[200, 200]], // Invalid coordinates
               range: [600],
            });
         },
         (error: Error & { statusCode?: number }) => (error.statusCode ?? 0) >= 400
      );
   });
});
