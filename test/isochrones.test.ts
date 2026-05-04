import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Isochrones Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should calculate time-based isochrones", async () => {
      const response = await client.isochrones.calculateIsochrones("driving-car", {
         locations: [[8.681495, 49.41461]],
         range: [600, 1200],
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features.length).toBe(2);

      const feature = response.features[0]!;
      expect(feature.type).toBe("Feature");
      expect(feature.properties.value).toBe(600);
      expect(feature.geometry.type).toBe("Polygon");
   });

   test("should calculate distance-based isochrones", async () => {
      const response = await client.isochrones.calculateIsochrones("foot-walking", {
         locations: [[8.681495, 49.41461]],
         range: [1000],
         range_type: "distance",
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features.length).toBe(1);
      expect(response.features[0]!.properties.value).toBe(1000);
      expect(response.features[0]!.geometry.type).toBe("Polygon");
   });

   test("should calculate isochrones for multiple locations", async () => {
      const response = await client.isochrones.calculateIsochrones("cycling-regular", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         range: [600],
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features.length).toBe(2);

      response.features.forEach((feature, index) => {
         expect(feature.type).toBe("Feature");
         expect(feature.properties.group_index).toBe(index);
         expect(feature.properties.value).toBe(600);
      });
   });

   test("should handle isochrones with custom options", async () => {
      const response = await client.isochrones.calculateIsochrones("driving-car", {
         locations: [[8.681495, 49.41461]],
         range: [300],
         smoothing: 0.9,
         location_type: "start",
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features.length).toBe(1);
   });

   test("should handle invalid coordinates in isochrones", async () => {
      const error = await client.isochrones
         .calculateIsochrones("driving-car", {
            locations: [[200, 200]],
            range: [600],
         })
         .catch((e: unknown) => e);
      expect((error as { statusCode?: number }).statusCode).toBeGreaterThanOrEqual(400);
   });
});
