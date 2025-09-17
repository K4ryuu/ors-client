import { OpenRouteService, OpenRouteServiceError } from "../src/index.js";
import "dotenv/config";

/**
 * Basic Usage Example
 *
 * This is your quickstart guide to the OpenRouteService wrapper.
 * We'll cover the two most common use cases: routing and distance matrices.
 *
 * Get your free API key at https://openrouteservice.org/sign-up/
 * Then set it as: export ORS_API_KEY=your-actual-api-key
 */

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function basicUsage() {
   try {
      // Let's calculate a simple route between two famous Budapest locations
      console.log("Calculating route from Deák tér to Széll Kálmán tér...");

      const route = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [19.054434, 47.497974], // Budapest - Deák Ferenc tér
            [19.022675, 47.507766], // Budapest - Széll Kálmán tér
         ],
         instructions: true, // We want turn-by-turn directions
         language: "en", // English instructions please
      });

      const summary = route.routes[0]?.summary;
      const distanceKm = Math.round((summary?.distance || 0) / 100) / 10; // Convert to km, 1 decimal
      const durationMin = Math.round((summary?.duration || 0) / 60); // Convert to minutes

      console.log(`Distance: ${distanceKm} km`);
      console.log(`Duration: ${durationMin} minutes`);

      // Check rate limit after directions request
      const rateLimitInfo = client.getLastRateLimitInfo();
      if (rateLimitInfo) {
         console.log(`Directions API: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining`);
         console.log(`Resets at: ${rateLimitInfo.reset.toLocaleString()}`);
      }

      // Now let's see how far it is between multiple popular spots
      // This is super useful for delivery planning, travel time estimates, etc.
      console.log("\nCalculating distance matrix between 3 locations...");

      const matrix = await client.matrix.calculateMatrix("driving-car", {
         locations: [
            [19.054434, 47.497974], // Deák Ferenc tér
            [19.022675, 47.507766], // Széll Kálmán tér
            [19.063272, 47.505083], // Oktogon
         ],
         metrics: ["duration", "distance"], // Get both time and distance
      });

      console.log("\nDuration matrix (seconds):");
      console.log(matrix.durations);
      console.log("\nDistance matrix (meters):");
      console.log(matrix.distances);

      // Check rate limit after matrix request
      const matrixRateLimit = client.getLastRateLimitInfo();
      if (matrixRateLimit) {
         console.log(`Matrix API: ${matrixRateLimit.remaining}/${matrixRateLimit.limit} requests remaining`);
         console.log(`Resets at: ${matrixRateLimit.reset.toLocaleString()}`);
      }

      console.log("\nPro tip: Matrix [i][j] = time/distance from location i to location j");
   } catch (error) {
      console.error("Something went wrong:", error);

      // Check if it's our custom error with rate limit info
      if (error instanceof OpenRouteServiceError) {
         const rateLimitInfo = error.getRateLimitInfo();
         if (rateLimitInfo && rateLimitInfo.limit > 0) {
            console.log(`\nAPI rate limit: ${error.getRemainingRequests()}/${rateLimitInfo.limit} requests remaining`);

            if (rateLimitInfo.reset > 0) {
               const resetDate = new Date(rateLimitInfo.reset * 1000);
               console.log(`Rate limit resets at: ${resetDate.toLocaleString()}`);
            }
         }

         if (error.isRateLimited()) {
            console.log("You've hit the rate limit! Try again later.");
         }
      }

      console.log("\nMake sure you've set your ORS_API_KEY environment variable!");
   }
}

basicUsage();
