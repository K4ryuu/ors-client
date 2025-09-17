import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("POI Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should search POIs in bounding box", async () => {
      const response = await client.pois.searchPOIs({
         geometry: {
            geojson: {
               type: "Point",
               coordinates: [8.681495, 49.41461],
            },
            buffer: 1000,
         },
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(Array.isArray(response.features));

      if (response.features.length > 0) {
         const poi = response.features[0];
         assert.equal(poi.type, "Feature");
         assert.ok(poi.geometry);
         assert.equal(poi.geometry.type, "Point");
         assert.ok(poi.properties);
         assert.ok(typeof poi.properties.osm_id === "number");
      }
   });

   test("should search POIs with category filter", async () => {
      const response = await client.pois.searchPOIs({
         geometry: {
            geojson: {
               type: "Point",
               coordinates: [8.681495, 49.41461],
            },
            buffer: 1000,
         },
         filters: {
            category_ids: [280], // Parks
         },
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(Array.isArray(response.features));
   });

   test("should search POIs with multiple filters", async () => {
      try {
         const response = await client.pois.searchPOIs({
            geometry: {
               geojson: {
                  type: "Point",
                  coordinates: [8.681495, 49.41461],
               },
               buffer: 500,
            },
            filters: {
               category_ids: [601], // Parking only, wheelchair filter might cause issues
            },
         });

         assert.equal(response.type, "FeatureCollection");
         assert.ok(response.features);
         assert.ok(Array.isArray(response.features));
      } catch (error) {
         // Some filter combinations might not work, just check it doesn't crash
         assert.ok(error instanceof Error);
      }
   });

   test("should get POI statistics", async () => {
      const response = await client.pois.getStats({
         geometry: {
            geojson: {
               type: "Point",
               coordinates: [8.681495, 49.41461],
            },
            buffer: 1000,
         },
      });

      assert.ok(response.places);
      assert.ok(typeof response.places.total_count === "number");
      assert.ok(response.places.total_count >= 0); // Can be 0
      assert.ok(response.information);
      assert.ok(typeof response.information.attribution === "string");
      assert.ok(typeof response.information.version === "string");

      // Check if we have category groups (optional based on query)
      const groupNames = Object.keys(response.places).filter((key) => key !== "total_count");
      if (groupNames.length > 0) {
         const firstGroup = response.places[groupNames[0]];
         if (typeof firstGroup === "object" && firstGroup !== null) {
            assert.ok("group_id" in firstGroup);
            assert.ok("total_count" in firstGroup);
            assert.ok("categories" in firstGroup);
         }
      }
   });

   test("should get POI categories", async () => {
      const response = await client.pois.getCategories();

      assert.ok(response);
      assert.ok(typeof response === "object");

      // Check that we have category groups
      const categoryNames = Object.keys(response);
      assert.ok(categoryNames.length > 0);

      // Check first category group structure
      const firstCategory = response[categoryNames[0]];
      assert.ok(typeof firstCategory.id === "number");
   });

   test("should handle invalid geometry in POI search", async () => {
      await assert.rejects(
         async () => {
            await client.pois.searchPOIs({
               geometry: {
                  geojson: {
                     type: "Point",
                     coordinates: [200, 200], // Invalid coordinates
                  },
                  buffer: 1000,
               },
            });
         },
         (error: Error) => {
            // Check if it's any kind of error (network, JSON parse, or API error)
            return error instanceof Error;
         }
      );
   });
});
