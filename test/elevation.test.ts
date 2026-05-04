import { test, describe, expect } from "bun:test";
import { OpenRouteService } from "../src/index.js";

const API_KEY = process.env.ORS_API_KEY || "";

describe("Elevation Service", () => {
   const client = new OpenRouteService({ apiKey: API_KEY });

   test("should get point elevation", async () => {
      const response = await client.elevation.getPointElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: { type: "Point", coordinates: [8.681495, 49.41461] },
      });

      const res = response as unknown as Record<string, unknown> & { geometry: Record<string, unknown> };
      expect(res).toBeTruthy();
      expect("geometry" in res).toBe(true);
      expect("coordinates" in res.geometry).toBe(true);
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

      const res = response as unknown as Record<string, unknown> & { geometry: Record<string, unknown> };
      expect(res).toBeTruthy();
      expect("geometry" in res).toBe(true);
      expect("coordinates" in res.geometry).toBe(true);
   });

   test("should get line elevation with range", async () => {
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
         range: [0, 1000],
      });

      expect(response).toBeTruthy();
      expect(typeof response).toBe("object");
   });

   test("should handle invalid coordinates in point elevation", async () => {
      const error = await client.elevation
         .getPointElevation({
            format_in: "geojson",
            format_out: "geojson",
            geometry: { type: "Point", coordinates: [200, 200] },
         })
         .catch((e: unknown) => e);
      expect((error as { statusCode?: number }).statusCode).toBeGreaterThanOrEqual(400);
   });

   test("should handle invalid geometry in line elevation", async () => {
      const error = await client.elevation
         .getLineElevation({
            format_in: "geojson",
            format_out: "geojson",
            geometry: { type: "LineString", coordinates: [] as [number, number][] },
         })
         .catch((e: unknown) => e);
      expect((error as { statusCode?: number }).statusCode).toBeGreaterThanOrEqual(400);
   });
});
