import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Geocoding Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should search for places", async () => {
      const response = await client.geocoding.search({
         text: "Berlin",
         size: 5,
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(response.features.length > 0);
      assert.ok(response.features.length <= 5);
      assert.ok(response.features[0]?.properties.name);
      assert.ok(response.features[0]?.geometry.coordinates);
   });

   test("should search with filters", async () => {
      const response = await client.geocoding.search({
         text: "Berlin",
         size: 3,
         layers: ["locality", "region"],
         "boundary.country": ["DE"],
      });

      assert.ok(response.features);
      assert.ok(response.features.length <= 3);
      response.features.forEach((feature) => {
         assert.ok(["locality", "region"].includes(feature.properties.layer));
      });
   });

   test("should do structured search", async () => {
      const response = await client.geocoding.searchStructured({
         locality: "Berlin",
         country: "Germany",
         size: 3,
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(response.features.length > 0);
   });

   test("should do reverse geocoding", async () => {
      const response = await client.geocoding.reverse({
         "point.lon": 13.404954,
         "point.lat": 52.520008,
         size: 5,
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(response.features.length > 0);
      assert.ok(response.features[0]?.properties.label);
   });

   test("should provide autocomplete suggestions", async () => {
      const response = await client.geocoding.autocomplete({
         text: "Berl",
         size: 5,
         "boundary.country": ["DE"],
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(Array.isArray(response.features));
      assert.ok(response.features.length <= 5);

      if (response.features.length > 0) {
         const feature = response.features[0];
         assert.equal(feature.type, "Feature");
         assert.ok(feature.properties);
         assert.ok(typeof feature.properties.name === "string");
         assert.ok(feature.properties.name.toLowerCase().includes("berl"));
      }
   });

   test("should handle autocomplete with focus point and boundary", async () => {
      const response = await client.geocoding.autocomplete({
         text: "restaurant",
         size: 3,
         "focus.point": [13.404954, 52.520008], // Berlin coordinates
         "boundary.circle": [13.404954, 52.520008, 5000], // 5km radius
      });

      assert.equal(response.type, "FeatureCollection");
      assert.ok(response.features);
      assert.ok(response.features.length <= 3);

      if (response.features.length > 0) {
         const feature = response.features[0];
         assert.equal(feature.type, "Feature");
         assert.ok(feature.properties);
         assert.ok(typeof feature.properties.name === "string");
      }
   });

   test("should handle invalid coordinates in reverse geocoding", async () => {
      const response = await client.geocoding.reverse({
         "point.lon": 200, // Invalid longitude
         "point.lat": 200, // Invalid latitude
         size: 1,
      });

      // API returns response even for invalid coords, just validate structure
      assert.equal(response.type, "FeatureCollection");
      assert.ok(Array.isArray(response.features));
   });
});
