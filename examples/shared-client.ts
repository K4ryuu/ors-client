import { Coordinate, OpenRouteService } from "../src/index.js"; // or "ors-client" if using npm package
import "dotenv/config";

/**
 * Shared Client Pattern
 *
 * Look, singletons are overrated. Here's how real devs share clients across
 * their apps - just export it from a module. Dead simple, works everywhere.
 *
 * Why this rocks:
 * - No weird global state nonsense
 * - Super easy to test (just mock the import)
 * - Your IDE actually understands what's going on
 */

// Set this bad boy up once and forget about it
export const orsClient = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
   timeout: 30000, // 30 seconds - POI searches can be slow
});

// Real world example #1: Your daily commute
async function checkCommuteTime() {
   const route = await orsClient.directions.calculateRoute("driving-car", {
      coordinates: [
         [19.054434, 47.497974], // Home - Deák Ferenc tér
         [19.05618, 47.511], // Office - Nyugati pályaudvar
      ],
      instructions: true,
      options: {
         avoid_features: ["ferries"], // Not trying to take a boat to work
      },
   });

   const minutes = Math.round(route.routes[0].summary.duration / 60);
   console.log(`Commute time: ${minutes} minutes - ${minutes > 30 ? "grab coffee on the way" : "you're good"}`);

   return route;
}

// Real world example #2: Friday night dinner spots
async function findFoodNearby(location: Coordinate) {
   console.log("Looking for grub nearby...");

   const spots = await orsClient.pois.searchPOIs({
      geometry: {
         geojson: {
            type: "Point",
            coordinates: location,
         },
         buffer: 1000, // 1km - walking distance after a few beers
      },
      filters: {
         category_ids: [570], // Food & drink
      },
      limit: 10,
      sortby: "distance",
   });

   const count = spots.features.length;
   console.log(`Found ${count} ${count === 1 ? "spot" : "spots"} to grab food`);

   return spots;
}

/**
 * Pro tip: In your actual app, you'd split this into separate files
 *
 * services/client.ts:
 *   export const orsClient = new OpenRouteService({...});
 *
 * services/routing.ts:
 *   import { orsClient } from './client.js';
 *   export const getDeliveryRoute = async (stops) => {...}
 *
 * services/places.ts:
 *   import { orsClient } from './client.js';
 *   export const nearbySearch = async (location) => {...}
 */

// Let's see this thing in action
async function demo() {
   try {
      console.log("Shared client demo\n");

      // Check how long it takes to get to work
      await checkCommuteTime();

      console.log(); // Some breathing room

      // Find dinner options near the office
      await findFoodNearby([19.05618, 47.511]); // Nyugati pályaudvar

      console.log("\nSame client instance used everywhere - no singleton BS needed!");
   } catch (error) {
      // Probably forgot to set the API key
      console.error("Something went wrong:", error);
      console.error("\nDid you set your ORS_API_KEY environment variable?");
   }
}

demo();
