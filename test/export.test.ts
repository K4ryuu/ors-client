import "dotenv/config";
import { describe, it } from "node:test";
import assert from "node:assert";
import { Coordinate, OpenRouteService } from "../src/index.js";

// Helper function to add delay between API calls to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// NOTE: Export Service tests are skipped in CI due to very strict rate limiting.
// The service works correctly, but requires significant delays between tests.
// To run these tests manually: change describe.skip to describe
describe.skip("Export Service", () => {
   const apiKey = process.env.ORS_API_KEY;
   if (!apiKey) {
      throw new Error("ORS_API_KEY environment variable is required for testing");
   }
   const client = new OpenRouteService({ apiKey });

   // Test area around Heidelberg, Germany (small area for faster tests)
   const testBBox: [Coordinate, Coordinate] = [
      [8.681495, 49.41461], // Southwest corner
      [8.686507, 49.41943], // Northeast corner
   ];

   // Global delay tracker for the export service
   let testCount = 0;

   it("should export graph data in JSON format", async () => {
      await delay(5000 + testCount++ * 1500); // Initial 5s delay + progressive delay to avoid rate limiting
      const result = await client.export.exportGraph("driving-car", {
         bbox: testBBox,
         geometry: true,
         id: "test-export",
      });

      assert(result, "Result should be defined");
      assert(result.nodes, "Nodes should be defined");
      assert(Array.isArray(result.nodes), "Nodes should be an array");
      assert(result.edges, "Edges should be defined");
      assert(Array.isArray(result.edges), "Edges should be an array");

      assert.strictEqual(typeof result.nodes_count, "number", "Nodes count should be a number");
      assert.strictEqual(typeof result.edges_count, "number", "Edges count should be a number");
      assert.strictEqual(result.nodes.length, result.nodes_count, "Nodes array length should match nodes_count");
      assert.strictEqual(result.edges.length, result.edges_count, "Edges array length should match edges_count");

      // Test node structure
      if (result.nodes.length > 0) {
         const firstNode = result.nodes[0];
         assert.strictEqual(typeof firstNode.nodeId, "number", "Node ID should be a number");
         assert(firstNode.location, "Node location should be defined");
         assert(Array.isArray(firstNode.location), "Node location should be an array");
         assert.strictEqual(firstNode.location.length, 2, "Node location should have 2 coordinates");
      }

      // Test edge structure
      if (result.edges.length > 0) {
         const firstEdge = result.edges[0];
         assert.strictEqual(typeof firstEdge.fromId, "number", "From ID should be a number");
         assert.strictEqual(typeof firstEdge.toId, "number", "To ID should be a number");
         assert.strictEqual(typeof firstEdge.weight, "string", "Weight should be a string");
      }
   });

   it("should export graph data with explicit JSON format", async () => {
      await delay(5000 + testCount++ * 1500); // Initial 5s delay + progressive delay to avoid rate limiting
      const result = await client.export.exportGraphJSON("cycling-regular", {
         bbox: testBBox,
         geometry: false,
      });

      assert(result, "Result should be defined");
      assert(result.nodes, "Nodes should be defined");
      assert(result.edges, "Edges should be defined");
      assert.strictEqual(typeof result.nodes_count, "number", "Nodes count should be a number");
      assert.strictEqual(typeof result.edges_count, "number", "Edges count should be a number");
   });

   it("should export graph data in TopoJSON format", async () => {
      await delay(5000 + testCount++ * 1500); // Initial 5s delay + progressive delay to avoid rate limiting
      const result = await client.export.exportGraphTopoJSON("foot-walking", {
         bbox: testBBox,
         id: "topojson-test",
      });

      assert(result, "Result should be defined");
      assert.strictEqual(result.type, "Topology", "Should be a Topology object");
      assert(result.objects, "Objects should be defined");
      assert(result.arcs, "Arcs should be defined");
      assert(Array.isArray(result.arcs), "Arcs should be an array");
   });

   it("should handle export with different profiles", async () => {
      const profiles = ["driving-car", "foot-walking"] as const;

      for (let i = 0; i < profiles.length; i++) {
         const profile = profiles[i];

         // Add delay between requests to avoid rate limiting
         if (i > 0) {
            await delay(2000); // 2 second delay between requests
         }

         const result = await client.export.exportGraph(profile, {
            bbox: testBBox,
         });

         assert(result, `Result should be defined for ${profile}`);
         assert(result.nodes_count >= 0, `Should have valid node count for ${profile}`);
         assert(result.edges_count >= 0, `Should have valid edge count for ${profile}`);
      }
   });

   it("should handle invalid bounding box", async () => {
      await delay(5000 + testCount++ * 1500); // Initial 5s delay + progressive delay to avoid rate limiting
      try {
         await client.export.exportGraph("driving-car", {
            bbox: [[180, 90] as [number, number], [-180, -90] as [number, number]], // Invalid bbox (coordinates out of range)
         });
         assert.fail("Should have thrown an error for invalid bbox");
      } catch (error) {
         assert(error instanceof Error, "Should throw an error");
         if ("statusCode" in error) {
            assert((error as { statusCode: number }).statusCode >= 400, "Should return a 4xx error");
         }
      }
   });
});
