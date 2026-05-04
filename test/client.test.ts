import { test, describe, expect } from "bun:test";
import { OpenRouteService, OpenRouteServiceError } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("OpenRouteService Client", () => {
   test("should create client instance", () => {
      const client = new OpenRouteService({ apiKey: API_KEY });
      expect(client).toBeTruthy();
      expect(client.directions).toBeDefined();
      expect(client.matrix).toBeDefined();
      expect(client.isochrones).toBeDefined();
      expect(client.geocoding).toBeDefined();
      expect(client.pois).toBeDefined();
      expect(client.optimization).toBeDefined();
      expect(client.elevation).toBeDefined();
   });

   test("should throw error with invalid API key", async () => {
      const client = new OpenRouteService({ apiKey: "invalid-key" });
      await expect(
         client.directions.calculateRoute("driving-car", {
            coordinates: [
               [8.681495, 49.41461],
               [8.686507, 49.41943],
            ],
         })
      ).rejects.toBeInstanceOf(OpenRouteServiceError);
   });

   test("should handle network errors", async () => {
      const client = new OpenRouteService({
         apiKey: API_KEY,
         baseUrl: "https://nonexistent-api.example.com",
         timeout: 1000,
      });
      await expect(
         client.directions.calculateRoute("driving-car", {
            coordinates: [
               [200, 200],
               [201, 201],
            ],
         })
      ).rejects.toBeInstanceOf(OpenRouteServiceError);
   });

   test("should handle timeout", async () => {
      const client = new OpenRouteService({ apiKey: API_KEY, timeout: 1 });
      const error = await client.directions
         .calculateRoute("driving-car", {
            coordinates: [
               [8.681495, 49.41461],
               [8.686507, 49.41943],
            ],
         })
         .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(OpenRouteServiceError);
      expect((error as OpenRouteServiceError).message).toContain("timeout");
   });
});
