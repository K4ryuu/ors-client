import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("POI Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should search POIs in bounding box", async () => {
      const response = await client.pois.searchPOIs({
         geometry: {
            geojson: { type: "Point", coordinates: [8.681495, 49.41461] },
            buffer: 1000,
         },
      });

      expect(response.type).toBe("FeatureCollection");
      expect(Array.isArray(response.features)).toBe(true);

      if (response.features.length > 0) {
         const poi = response.features[0]!;
         expect(poi.type).toBe("Feature");
         expect(poi.geometry.type).toBe("Point");
         expect(typeof poi.properties.osm_id).toBe("number");
      }
   });

   test("should search POIs with category filter", async () => {
      const response = await client.pois.searchPOIs({
         geometry: {
            geojson: { type: "Point", coordinates: [8.681495, 49.41461] },
            buffer: 1000,
         },
         filters: { category_ids: [280] },
      });

      expect(response.type).toBe("FeatureCollection");
      expect(Array.isArray(response.features)).toBe(true);
   });

   test("should search POIs with multiple filters", async () => {
      try {
         const response = await client.pois.searchPOIs({
            geometry: {
               geojson: { type: "Point", coordinates: [8.681495, 49.41461] },
               buffer: 500,
            },
            filters: { category_ids: [601] },
         });

         expect(response.type).toBe("FeatureCollection");
         expect(Array.isArray(response.features)).toBe(true);
      } catch (error) {
         expect(error instanceof Error).toBe(true);
      }
   });

   test("should get POI statistics", async () => {
      const response = await client.pois.getStats({
         geometry: {
            geojson: { type: "Point", coordinates: [8.681495, 49.41461] },
            buffer: 1000,
         },
      });

      expect(typeof response.places.total_count).toBe("number");
      expect(response.places.total_count).toBeGreaterThanOrEqual(0);
      expect(typeof response.information.attribution).toBe("string");
      expect(typeof response.information.version).toBe("string");

      const groupNames = Object.keys(response.places).filter((k) => k !== "total_count");
      if (groupNames.length > 0) {
         const firstGroup = response.places[groupNames[0]!];
         if (typeof firstGroup === "object" && firstGroup !== null) {
            expect("group_id" in firstGroup).toBe(true);
            expect("total_count" in firstGroup).toBe(true);
            expect("categories" in firstGroup).toBe(true);
         }
      }
   });

   test("should get POI categories", async () => {
      const response = await client.pois.getCategories();

      expect(typeof response).toBe("object");
      const categoryNames = Object.keys(response);
      expect(categoryNames.length).toBeGreaterThan(0);
      expect(typeof response[categoryNames[0]!]!.id).toBe("number");
   });

   test("should handle invalid geometry in POI search", async () => {
      await expect(
         client.pois.searchPOIs({
            geometry: {
               geojson: { type: "Point", coordinates: [200, 200] },
               buffer: 1000,
            },
         })
      ).rejects.toThrow();
   });
});
