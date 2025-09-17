import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Matrix Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should calculate distance matrix", async () => {
      const response = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
            [8.687872, 49.420318],
         ],
         metrics: ["distance"],
      });

      assert.ok(response.distances);
      assert.equal(response.distances.length, 3);
      assert.equal(response.distances[0]?.length, 3);
      assert.equal(response.distances[0]?.[0], 0); // Distance from point to itself
   });

   test("should calculate duration matrix", async () => {
      const response = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         metrics: ["duration"],
      });

      assert.ok(response.durations);
      assert.equal(response.durations.length, 2);
      assert.equal(response.durations[0]?.length, 2);
      assert.equal(response.durations[0]?.[0], 0); // Duration from point to itself
   });

   test("should calculate matrix with both metrics", async () => {
      const response = await client.matrix.calculateMatrix("foot-walking", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         metrics: ["duration", "distance"],
      });

      assert.ok(response.durations);
      assert.ok(response.distances);
      if (response.durations) {
         assert.equal(response.durations.length, 2);
      }
      if (response.distances) {
         assert.equal(response.distances.length, 2);
      }
   });

   test("should calculate matrix with sources and destinations", async () => {
      const response = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
            [8.687872, 49.420318],
            [8.690123, 49.425456],
         ],
         sources: [0, 1],
         destinations: [2, 3],
         metrics: ["duration"],
      });

      assert.ok(response.durations);
      assert.equal(response.durations.length, 2); // 2 sources
      assert.equal(response.durations[0]?.length, 2); // 2 destinations
   });

   test("should resolve locations when requested", async () => {
      const response = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         metrics: ["duration"],
         resolve_locations: true,
      });

      assert.ok(response.durations);
      assert.ok(response.sources);
      assert.ok(response.destinations);
      assert.equal(response.sources.length, 2);
      assert.equal(response.destinations.length, 2);
   });
});
