import "dotenv/config";
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Optimization Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should solve basic vehicle routing problem", async () => {
      const response = await client.optimization.solve({
         jobs: [
            {
               id: 1,
               service: 300, // 5 minutes service time
               location: [8.686507, 49.41943],
            },
            {
               id: 2,
               service: 300,
               location: [8.687872, 49.420318],
            },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
            },
         ],
      });

      assert.equal(response.code, 0); // Success code
      assert.ok(response.summary);
      assert.ok(response.summary.cost >= 0); // Should have calculated cost
      assert.equal(response.summary.unassigned, 0);
      assert.ok(response.routes);
      assert.equal(response.routes.length, 1);

      const route = response.routes[0];
      assert.equal(route.vehicle, 1);
      assert.ok(route.steps);
      assert.ok(route.steps.length >= 4); // start + 2 jobs + end
   });

   test("should solve multi-vehicle routing problem", async () => {
      const response = await client.optimization.solve({
         jobs: [
            { id: 1, service: 300, location: [8.686507, 49.41943] },
            { id: 2, service: 300, location: [8.687872, 49.420318] },
            { id: 3, service: 300, location: [8.689123, 49.421456] },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
            },
            {
               id: 2,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
            },
         ],
      });

      assert.equal(response.code, 0);
      assert.ok(response.summary);
      assert.ok(response.routes);
      assert.ok(response.routes.length <= 2); // Max 2 vehicles
      assert.equal(response.summary.unassigned, 0); // All jobs assigned
   });

   test("should handle optimization with time windows", async () => {
      const response = await client.optimization.solve({
         jobs: [
            {
               id: 1,
               service: 300,
               location: [8.686507, 49.41943],
               time_windows: [[32400, 39600]], // 9:00-11:00 AM
            },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
               time_window: [32400, 43200], // 9:00 AM - 12:00 PM
            },
         ],
      });

      assert.equal(response.code, 0);
      assert.ok(response.routes);
      assert.equal(response.routes.length, 1);
   });

   test("should handle optimization with capacity constraints", async () => {
      const response = await client.optimization.solve({
         jobs: [
            {
               id: 1,
               service: 300,
               location: [8.686507, 49.41943],
               amount: [10], // Delivery amount
            },
            {
               id: 2,
               service: 300,
               location: [8.687872, 49.420318],
               amount: [15],
            },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
               capacity: [30], // Vehicle capacity
            },
         ],
      });

      assert.equal(response.code, 0);
      assert.equal(response.summary.unassigned, 0); // Should fit in capacity
   });

   test("should handle invalid optimization request", async () => {
      await assert.rejects(
         async () => {
            await client.optimization.solve({
               jobs: [], // No jobs
               vehicles: [], // No vehicles
            });
         },
         (error: Error & { statusCode?: number }) => (error.statusCode ?? 0) >= 400
      );
   });
});
