import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Geocoding Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should search for places", async () => {
      const response = await client.geocoding.search({ text: "Berlin", size: 5 });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features).toBeTruthy();
      expect(response.features.length).toBeGreaterThan(0);
      expect(response.features.length).toBeLessThanOrEqual(5);
      expect(response.features[0]?.properties.name).toBeTruthy();
      expect(response.features[0]?.geometry.coordinates).toBeTruthy();
   });

   test("should search with filters", async () => {
      const response = await client.geocoding.search({
         text: "Berlin",
         size: 3,
         layers: ["locality", "region"],
         "boundary.country": ["DE"],
      });

      expect(response.features).toBeTruthy();
      expect(response.features.length).toBeLessThanOrEqual(3);
      response.features.forEach((feature) => {
         expect(["locality", "region"]).toContain(feature.properties.layer);
      });
   });

   test("should do structured search", async () => {
      const response = await client.geocoding.searchStructured({
         locality: "Berlin",
         country: "Germany",
         size: 3,
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features).toBeTruthy();
      expect(response.features.length).toBeGreaterThan(0);
   });

   test("should do reverse geocoding", async () => {
      const response = await client.geocoding.reverse({
         "point.lon": 13.404954,
         "point.lat": 52.520008,
         size: 5,
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features).toBeTruthy();
      expect(response.features.length).toBeGreaterThan(0);
      expect(response.features[0]?.properties.label).toBeTruthy();
   });

   test("should provide autocomplete suggestions", async () => {
      const response = await client.geocoding.autocomplete({
         text: "Berl",
         size: 5,
         "boundary.country": ["DE"],
      });

      expect(response.type).toBe("FeatureCollection");
      expect(Array.isArray(response.features)).toBe(true);
      expect(response.features.length).toBeLessThanOrEqual(5);

      if (response.features.length > 0) {
         const feature = response.features[0]!;
         expect(feature.type).toBe("Feature");
         expect(typeof feature.properties.name).toBe("string");
         expect(feature.properties.name.toLowerCase()).toContain("berl");
      }
   });

   test("should handle autocomplete with focus point and boundary", async () => {
      const response = await client.geocoding.autocomplete({
         text: "restaurant",
         size: 3,
         "focus.point": [13.404954, 52.520008],
         "boundary.circle": [13.404954, 52.520008, 5000],
      });

      expect(response.type).toBe("FeatureCollection");
      expect(response.features.length).toBeLessThanOrEqual(3);

      if (response.features.length > 0) {
         const feature = response.features[0]!;
         expect(feature.type).toBe("Feature");
         expect(typeof feature.properties.name).toBe("string");
      }
   });

   test("should handle invalid coordinates in reverse geocoding", async () => {
      const response = await client.geocoding.reverse({
         "point.lon": 200,
         "point.lat": 200,
         size: 1,
      });

      expect(response.type).toBe("FeatureCollection");
      expect(Array.isArray(response.features)).toBe(true);
   });
});
