import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Optimization Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should solve basic vehicle routing problem", async () => {
      const response = await client.optimization.solve({
         jobs: [
            { id: 1, service: 300, location: [8.686507, 49.41943] },
            { id: 2, service: 300, location: [8.687872, 49.420318] },
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

      expect(response.code).toBe(0);
      expect(response.summary).toBeTruthy();
      expect(response.summary.cost).toBeGreaterThanOrEqual(0);
      expect(response.summary.unassigned).toBe(0);
      expect(response.routes.length).toBe(1);
      expect(response.routes[0]!.vehicle).toBe(1);
      expect(response.routes[0]!.steps.length).toBeGreaterThanOrEqual(4);
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

      expect(response.code).toBe(0);
      expect(response.routes.length).toBeLessThanOrEqual(2);
      expect(response.summary.unassigned).toBe(0);
   });

   test("should handle optimization with time windows", async () => {
      const response = await client.optimization.solve({
         jobs: [
            {
               id: 1,
               service: 300,
               location: [8.686507, 49.41943],
               time_windows: [[32400, 39600]],
            },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
               time_window: [32400, 43200],
            },
         ],
      });

      expect(response.code).toBe(0);
      expect(response.routes.length).toBe(1);
   });

   test("should handle optimization with capacity constraints", async () => {
      const response = await client.optimization.solve({
         jobs: [
            { id: 1, service: 300, location: [8.686507, 49.41943], amount: [10] },
            { id: 2, service: 300, location: [8.687872, 49.420318], amount: [15] },
         ],
         vehicles: [
            {
               id: 1,
               profile: "driving-car",
               start: [8.681495, 49.41461],
               end: [8.681495, 49.41461],
               capacity: [30],
            },
         ],
      });

      expect(response.code).toBe(0);
      expect(response.summary.unassigned).toBe(0);
   });

   test("should handle invalid optimization request", async () => {
      const error = await client.optimization
         .solve({ jobs: [], vehicles: [] })
         .catch((e: unknown) => e);
      expect((error as { statusCode?: number }).statusCode).toBeGreaterThanOrEqual(400);
   });
});
