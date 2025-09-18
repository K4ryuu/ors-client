import { Coordinate, OpenRouteService } from "../src/index.js"; // or "ors-client" if using npm package
import "dotenv/config";

/**
 * Export API Examples
 *
 * The Export service allows you to extract the underlying routing graph data
 * for a specific area. This includes nodes (points) and edges (connections)
 * with weights, perfect for advanced routing applications or analysis.
 */

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function exportExamples() {
   try {
      // Define a small area around Heidelberg, Germany for testing
      // Using a small bbox to keep the response manageable
      const heidelbergBBox: [Coordinate, Coordinate] = [
         [8.681495, 49.41461], // Southwest corner [longitude, latitude]
         [8.686507, 49.41943], // Northeast corner [longitude, latitude]
      ];

      console.log("Exporting routing graph data from Heidelberg...");
      console.log(`Bounding box: SW[${heidelbergBBox[0]}] to NE[${heidelbergBBox[1]}]`);

      // Basic graph export for driving
      console.log("\n1. Exporting driving network graph...");
      const drivingGraph = await client.export.exportGraph("driving-car", {
         bbox: heidelbergBBox,
         geometry: true,
         id: "heidelberg-driving-network",
      });

      console.log(`Found ${drivingGraph.nodes_count} nodes and ${drivingGraph.edges_count} edges`);
      console.log("Sample nodes:");
      drivingGraph.nodes.slice(0, 3).forEach((node, i) => {
         console.log(`  ${i + 1}. Node ${node.nodeId} at [${node.location[0]}, ${node.location[1]}]`);
      });

      console.log("Sample edges:");
      drivingGraph.edges.slice(0, 3).forEach((edge, i) => {
         console.log(`  ${i + 1}. ${edge.fromId} → ${edge.toId} (weight: ${edge.weight})`);
      });

      // Compare different transportation modes
      console.log("\n2. Comparing network sizes across different modes...");
      const profiles = ["driving-car", "cycling-regular", "foot-walking"] as const;

      for (const profile of profiles) {
         const graph = await client.export.exportGraphJSON(profile, {
            bbox: heidelbergBBox,
            geometry: false,
         });

         console.log(`${profile.padEnd(20)}: ${graph.nodes_count} nodes, ${graph.edges_count} edges`);
      }

      // Export as TopoJSON for mapping applications
      console.log("\n3. Exporting as TopoJSON for mapping...");
      const topoData = await client.export.exportGraphTopoJSON("foot-walking", {
         bbox: heidelbergBBox,
         id: "pedestrian-network-heidelberg",
      });

      console.log(`TopoJSON export successful: ${topoData.type} with ${topoData.arcs.length} arcs`);
      if (topoData.bbox) {
         console.log(`Data bounding box: [${topoData.bbox.join(", ")}]`);
      }

      // Analyze network connectivity
      console.log("\n4. Analyzing network connectivity...");
      const connectedNodes = new Set<number>();

      drivingGraph.edges.forEach((edge) => {
         connectedNodes.add(edge.fromId);
         connectedNodes.add(edge.toId);
      });

      const isolatedNodes = drivingGraph.nodes.filter((node) => !connectedNodes.has(node.nodeId));
      console.log(`Total nodes: ${drivingGraph.nodes_count}`);
      console.log(`Connected nodes: ${connectedNodes.size}`);
      console.log(`Isolated nodes: ${isolatedNodes.length}`);

      if (isolatedNodes.length > 0) {
         console.log("Sample isolated nodes:");
         isolatedNodes.slice(0, 3).forEach((node, i) => {
            console.log(`  ${i + 1}. Node ${node.nodeId} at [${node.location[0]}, ${node.location[1]}]`);
         });
      }

      // Find nodes with most connections
      console.log("\n5. Finding highly connected intersections...");
      const nodeDegree = new Map<number, number>();

      drivingGraph.edges.forEach((edge) => {
         nodeDegree.set(edge.fromId, (nodeDegree.get(edge.fromId) || 0) + 1);
         nodeDegree.set(edge.toId, (nodeDegree.get(edge.toId) || 0) + 1);
      });

      const sortedByDegree = Array.from(nodeDegree.entries())
         .sort((a, b) => b[1] - a[1])
         .slice(0, 5);

      console.log("Top 5 most connected nodes (intersections):");
      sortedByDegree.forEach(([nodeId, degree], i) => {
         const node = drivingGraph.nodes.find((n) => n.nodeId === nodeId);
         if (node) {
            console.log(`  ${i + 1}. Node ${nodeId}: ${degree} connections at [${node.location[0]}, ${node.location[1]}]`);
         }
      });

      console.log("\nPro tips for using Export data:");
      console.log("- Use smaller bounding boxes for better performance");
      console.log("- Graph data is perfect for custom routing algorithms");
      console.log("- TopoJSON format is great for web mapping libraries");
      console.log("- Node degrees help identify important intersections");
      console.log("- Different profiles give you specialized networks (car, bike, pedestrian)");
   } catch (error) {
      console.error("Something went wrong:", error);
      console.log("\nTroubleshooting tips:");
      console.log("- Check your API key is valid");
      console.log("- Make sure the bounding box is reasonable size");
      console.log("- Try a smaller area if you get timeouts");
   }
}

exportExamples();
