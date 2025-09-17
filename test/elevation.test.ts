import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Elevation Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should get point elevation", async () => {
      const response = await client.elevation.getPointElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "Point",
            coordinates: [8.681495, 49.41461],
         },
      });

      assert.ok(response);
      assert.ok(typeof response === "object");
      assert.ok("geometry" in response);
      assert.ok("coordinates" in response.geometry);
   });

   test("should get line elevation", async () => {
      const response = await client.elevation.getLineElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "LineString",
            coordinates: [
               [8.681495, 49.41461],
               [8.686507, 49.41943],
               [8.687872, 49.420318],
            ],
         },
      });

      assert.ok(response);
      assert.ok(typeof response === "object");
      assert.ok("geometry" in response);
      assert.ok("coordinates" in response.geometry);
   });

   test("should get point elevation with range", async () => {
      const response = await client.elevation.getLineElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "LineString",
            coordinates: [
               [8.681495, 49.41461],
               [8.686507, 49.41943],
            ],
         },
         range: [0, 1000], // Sample every 1000m along the line
      });

      assert.ok(response);
      assert.ok(typeof response === "object");
   });

   test("should handle invalid coordinates in point elevation", async () => {
      await assert.rejects(
         async () => {
            await client.elevation.getPointElevation({
               format_in: "geojson",
               format_out: "geojson",
               geometry: {
                  type: "Point",
                  coordinates: [200, 200], // Invalid coordinates
               },
            });
         },
         (error: Error & { statusCode?: number }) => (error.statusCode ?? 0) >= 400
      );
   });

   test("should handle invalid geometry in line elevation", async () => {
      await assert.rejects(
         async () => {
            await client.elevation.getLineElevation({
               format_in: "geojson",
               format_out: "geojson",
               geometry: {
                  type: "LineString",
                  coordinates: [], // Empty coordinates
               },
            });
         },
         (error: Error & { statusCode?: number }) => (error.statusCode ?? 0) >= 400
      );
   });
});
