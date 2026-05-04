import { describe, it, expect } from "bun:test";
import { Coordinate, OpenRouteService } from "../src/index.js";

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// NOTE: skipped in CI — strict rate limits require significant delays between calls
describe.skip("Export Service", () => {
   const apiKey = process.env.ORS_API_KEY;
   if (!apiKey) throw new Error("ORS_API_KEY environment variable is required for testing");
   const client = new OpenRouteService({ apiKey });

   const testBBox: [Coordinate, Coordinate] = [
      [8.681495, 49.41461],
      [8.686507, 49.41943],
   ];

   let testCount = 0;

   it("should export graph data in JSON format", async () => {
      await delay(5000 + testCount++ * 1500);
      const result = await client.export.exportGraph("driving-car", {
         bbox: testBBox,
         geometry: true,
         id: "test-export",
      });

      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.edges)).toBe(true);
      expect(typeof result.nodes_count).toBe("number");
      expect(typeof result.edges_count).toBe("number");
      expect(result.nodes.length).toBe(result.nodes_count);
      expect(result.edges.length).toBe(result.edges_count);

      if (result.nodes.length > 0) {
         const node = result.nodes[0]!;
         expect(typeof node.nodeId).toBe("number");
         expect(Array.isArray(node.location)).toBe(true);
         expect(node.location.length).toBe(2);
      }

      if (result.edges.length > 0) {
         const edge = result.edges[0]!;
         expect(typeof edge.fromId).toBe("number");
         expect(typeof edge.toId).toBe("number");
         expect(typeof edge.weight).toBe("string");
      }
   });

   it("should export graph data with explicit JSON format", async () => {
      await delay(5000 + testCount++ * 1500);
      const result = await client.export.exportGraphJSON("cycling-regular", {
         bbox: testBBox,
         geometry: false,
      });

      expect(result.nodes).toBeTruthy();
      expect(result.edges).toBeTruthy();
      expect(typeof result.nodes_count).toBe("number");
      expect(typeof result.edges_count).toBe("number");
   });

   it("should export graph data in TopoJSON format", async () => {
      await delay(5000 + testCount++ * 1500);
      const result = await client.export.exportGraphTopoJSON("foot-walking", {
         bbox: testBBox,
         id: "topojson-test",
      });

      expect(result.type).toBe("Topology");
      expect(result.objects).toBeTruthy();
      expect(Array.isArray(result.arcs)).toBe(true);
   });

   it("should handle export with different profiles", async () => {
      const profiles = ["driving-car", "foot-walking"] as const;

      for (let i = 0; i < profiles.length; i++) {
         if (i > 0) await delay(2000);
         const profile = profiles[i]!;
         const result = await client.export.exportGraph(profile, { bbox: testBBox });
         expect(result.nodes_count).toBeGreaterThanOrEqual(0);
         expect(result.edges_count).toBeGreaterThanOrEqual(0);
      }
   });

   it("should handle invalid bounding box", async () => {
      await delay(5000 + testCount++ * 1500);
      try {
         await client.export.exportGraph("driving-car", {
            bbox: [[180, 90] as [number, number], [-180, -90] as [number, number]],
         });
         throw new Error("Should have thrown an error for invalid bbox");
      } catch (error) {
         expect(error instanceof Error).toBe(true);
         if ("statusCode" in (error as object)) {
            expect((error as { statusCode: number }).statusCode).toBeGreaterThanOrEqual(400);
         }
      }
   });
});
