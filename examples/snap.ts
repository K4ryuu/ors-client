import { Coordinate, OpenRouteService, Profile } from "../src/index.js";
import "dotenv/config";

/**
 * Snap API Examples
 *
 * The Snap service aligns your coordinates to the nearest roads in the routing network.
 * Super useful when working with GPS data or when you need precise road positioning.
 */

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function snapExamples() {
   try {
      // Define some test coordinates around Budapest
      // These might be slightly off the actual roads (like GPS coordinates often are)
      const roughCoordinates: Coordinate[] = [
         [19.0545, 47.4979], // Near Deák Ferenc tér (slightly off)
         [19.0227, 47.5078], // Near Széll Kálmán tér (slightly off)
         [19.0633, 47.5051], // Near Oktogon (slightly off)
         [19.0599, 47.4943], // Near Astoria (slightly off)
      ];

      console.log("Snapping coordinates to nearest roads...");
      console.log("Original coordinates:");
      roughCoordinates.forEach((coord, i) => {
         console.log(`  ${i + 1}. [${coord[0]}, ${coord[1]}]`);
      });

      // Snap to driving roads with 100m search radius
      const snappedDriving = await client.snap.snapLocations("driving-car", {
         locations: roughCoordinates,
         radius: 100, // Search within 100 meters
      });

      console.log("\nSnapped to driving roads:");
      snappedDriving.locations.forEach((snapped, i) => {
         if (snapped) {
            console.log(`  ${i + 1}. [${snapped.location[0]}, ${snapped.location[1]}] (${snapped.name || "unnamed road"})`);
         } else {
            console.log(`  ${i + 1}. Could not snap within radius`);
         }
      });

      // Try snapping with a smaller radius to see what happens
      console.log("\nTrying with smaller 20m radius...");

      const snappedTight = await client.snap.snapLocationsJSON("driving-car", {
         locations: roughCoordinates,
         radius: 20, // Much tighter search radius
      });

      const successCount = snappedTight.locations.filter((loc) => loc !== null).length;
      console.log(`Successfully snapped ${successCount}/${roughCoordinates.length} locations`);

      // Get results as GeoJSON for mapping applications
      console.log("\nGetting results as GeoJSON for mapping...");

      const geoJsonSnapped = await client.snap.snapLocationsGeoJSON("foot-walking", {
         locations: roughCoordinates,
         radius: 150, // Larger radius for walking paths
      });

      console.log(`GeoJSON response with ${geoJsonSnapped.features.length} features`);

      geoJsonSnapped.features.forEach((feature, i) => {
         const sourceId = feature.properties.source_id;
         const coords = feature.geometry.coordinates;
         const name = feature.properties.name || "unnamed";
         console.log(`  Feature ${i + 1}: Source ${sourceId} -> [${coords[0]}, ${coords[1]}] on ${name}`);
      });

      // Compare different profiles
      console.log("\nComparing different transportation profiles...");

      const profiles = ["driving-car", "cycling-regular", "foot-walking"];

      for (const profile of profiles) {
         const result = await client.snap.snapLocations(profile as Profile, {
            locations: [roughCoordinates[0]], // Just test the first coordinate
            radius: 100,
         });

         const snapped = result.locations[0];
         if (snapped) {
            console.log(`${profile}: [${snapped.location[0]}, ${snapped.location[1]}] on ${snapped.name || "unnamed"}`);
         } else {
            console.log(`${profile}: Could not snap`);
         }
      }

      console.log("\nPro tip: Snap is perfect for:");
      console.log("- Cleaning up GPS tracks");
      console.log("- Ensuring coordinates are on actual roads");
      console.log("- Converting between different transportation networks");
      console.log("- Preparing data for routing algorithms");
   } catch (error) {
      console.error("Something went wrong:", error);
      console.log("\nCheck your API key and make sure coordinates are in a supported area!");
   }
}

snapExamples();
