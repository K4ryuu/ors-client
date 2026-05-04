import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Directions Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should calculate basic route", async () => {
      const response = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
      });

      expect(response.routes).toBeTruthy();
      expect(response.routes.length).toBeGreaterThan(0);
      expect(response.routes[0]?.summary).toBeTruthy();
      expect(typeof response.routes[0]?.summary.distance).toBe("number");
      expect(typeof response.routes[0]?.summary.duration).toBe("number");
   });

   test("should calculate route with instructions", async () => {
      const response = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         instructions: true,
         language: "en",
      });

      expect(response.routes[0]?.segments).toBeTruthy();
      expect(response.routes[0]?.segments.length).toBeGreaterThan(0);
      expect(response.routes[0]?.segments[0]?.steps).toBeTruthy();
   });

   test("should calculate route with alternative routes", async () => {
      const response = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         alternative_routes: { target_count: 2 },
      });

      expect(response.routes).toBeTruthy();
      expect(response.routes.length).toBeGreaterThanOrEqual(1);
   });

   test("should get GeoJSON route", async () => {
      const response = await client.directions.calculateRouteGeoJSON("foot-walking", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features).toBeTruthy();
      expect(response.features.length).toBeGreaterThan(0);
   });

   test("should handle invalid coordinates", async () => {
      await expect(
         client.directions.calculateRoute("driving-car", {
            coordinates: [
               [200, 200],
               [300, 300],
            ],
         })
      ).rejects.toThrow();
   });
});
