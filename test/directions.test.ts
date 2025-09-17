import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
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

      assert.ok(response.routes);
      assert.ok(response.routes.length > 0);
      assert.ok(response.routes[0]?.summary);
      assert.ok(typeof response.routes[0]?.summary.distance === "number");
      assert.ok(typeof response.routes[0]?.summary.duration === "number");
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

      assert.ok(response.routes[0]?.segments);
      assert.ok(response.routes[0]?.segments.length > 0);
      assert.ok(response.routes[0]?.segments[0]?.steps);
   });

   test("should calculate route with alternative routes", async () => {
      const response = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         alternative_routes: {
            target_count: 2,
         },
      });

      assert.ok(response.routes);
      assert.ok(response.routes.length >= 1);
   });

   test("should get GeoJSON route", async () => {
      const response = await client.directions.calculateRouteGeoJSON("foot-walking", {
         coordinates: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(response.features.length > 0);
   });

   test("should handle invalid coordinates", async () => {
      await assert.rejects(async () => {
         await client.directions.calculateRoute("driving-car", {
            coordinates: [
               [200, 200],
               [300, 300],
            ], // Invalid coordinates
         });
      });
   });
});
