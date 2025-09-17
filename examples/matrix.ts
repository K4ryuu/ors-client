import { Coordinate, OpenRouteService } from "../src/index.js";
import "dotenv/config";

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function matrixExamples() {
   try {
      // Basic matrix calculation
      const basicMatrix = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [19.054434, 47.497974], // Deák Ferenc tér
            [19.022675, 47.507766], // Széll Kálmán tér
            [19.063272, 47.505083], // Oktogon
         ],
         metrics: ["duration", "distance"],
      });

      console.log("Duration matrix:", basicMatrix.durations);
      console.log("Distance matrix:", basicMatrix.distances);

      // Matrix with specific sources and destinations
      const sourceDestMatrix = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [19.054434, 47.497974], // Index 0 - Deák Ferenc tér
            [19.022675, 47.507766], // Index 1 - Széll Kálmán tér
            [19.063272, 47.505083], // Index 2 - Oktogon
            [19.059853, 47.49429], // Index 3 - Astoria
         ],
         sources: [0, 1], // Start from first two locations
         destinations: [2, 3], // Go to last two locations
         metrics: ["duration"],
         resolve_locations: true,
      });

      console.log("Source-destination matrix:", sourceDestMatrix.durations);
      console.log("Resolved sources:", sourceDestMatrix.sources?.length);
      console.log("Resolved destinations:", sourceDestMatrix.destinations?.length);

      // Large matrix calculation
      const locations: Array<Coordinate> = [
         [19.054434, 47.497974], // Deák Ferenc tér
         [19.022675, 47.507766], // Széll Kálmán tér
         [19.063272, 47.505083], // Oktogon
         [19.059853, 47.49429], // Astoria
         [19.05618, 47.511], // Nyugati pályaudvar
      ];

      const largeMatrix = await client.matrix.calculateMatrix("foot-walking", {
         locations,
         metrics: ["duration", "distance"],
      });

      console.log(`Large matrix size: ${largeMatrix.durations?.length}x${largeMatrix.durations?.[0]?.length}`);
   } catch (error) {
      console.error("Error:", error);
   }
}

matrixExamples();
