import { test, describe, expect } from "bun:test";
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

      expect(response.distances).toBeTruthy();
      expect(response.distances!.length).toBe(3);
      expect(response.distances![0]?.length).toBe(3);
      expect(response.distances![0]?.[0]).toBe(0);
   });

   test("should calculate duration matrix", async () => {
      const response = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         metrics: ["duration"],
      });

      expect(response.durations).toBeTruthy();
      expect(response.durations!.length).toBe(2);
      expect(response.durations![0]?.length).toBe(2);
      expect(response.durations![0]?.[0]).toBe(0);
   });

   test("should calculate matrix with both metrics", async () => {
      const response = await client.matrix.calculateMatrix("foot-walking", {
         locations: [
            [8.681495, 49.41461],
            [8.686507, 49.41943],
         ],
         metrics: ["duration", "distance"],
      });

      expect(response.durations).toBeTruthy();
      expect(response.distances).toBeTruthy();
      if (response.durations) expect(response.durations.length).toBe(2);
      if (response.distances) expect(response.distances.length).toBe(2);
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

      expect(response.durations).toBeTruthy();
      expect(response.durations!.length).toBe(2);
      expect(response.durations![0]?.length).toBe(2);
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

      expect(response.durations).toBeTruthy();
      expect(response.sources).toBeTruthy();
      expect(response.destinations).toBeTruthy();
      expect(response.sources!.length).toBe(2);
      expect(response.destinations!.length).toBe(2);
   });
});
