import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService, OpenRouteServiceError } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("OpenRouteService Client", () => {
   test("should create client instance", () => {
      const client = new OpenRouteService({ apiKey: API_KEY });
      assert.ok(client);
      assert.ok(client.directions);
      assert.ok(client.matrix);
      assert.ok(client.isochrones);
      assert.ok(client.geocoding);
      assert.ok(client.pois);
      assert.ok(client.optimization);
      assert.ok(client.elevation);
   });

   test("should throw error with invalid API key", async () => {
      const client = new OpenRouteService({ apiKey: "invalid-key" });

      await assert.rejects(async () => {
         await client.directions.calculateRoute("driving-car", {
            coordinates: [
               [8.681495, 49.41461],
               [8.686507, 49.41943],
            ],
         });
      }, OpenRouteServiceError);
   });

   test("should handle network errors", async () => {
      // Use a service that actually respects custom baseUrl
      const client = new OpenRouteService({
         apiKey: API_KEY,
         baseUrl: "https://nonexistent-api.example.com",
         timeout: 1000,
      });

      await assert.rejects(async () => {
         await client.directions.calculateRoute("driving-car", {
            coordinates: [
               [200, 200],
               [201, 201],
            ], // Invalid coordinates
         });
      }, OpenRouteServiceError);
   });

   test("should handle timeout", async () => {
      const client = new OpenRouteService({
         apiKey: API_KEY,
         timeout: 1, // 1ms timeout
      });

      await assert.rejects(
         async () => {
            await client.directions.calculateRoute("driving-car", {
               coordinates: [
                  [8.681495, 49.41461],
                  [8.686507, 49.41943],
               ],
            });
         },
         (error: OpenRouteServiceError) => error.message.includes("timeout")
      );
   });
});
