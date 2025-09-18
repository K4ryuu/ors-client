import { OpenRouteService } from "../src/index.js"; // or "ors-client" if using npm package
import "dotenv/config";

/**
 * Directions API Examples
 *
 * The bread and butter of any mapping service - getting from A to B.
 * We'll show you basic routing, advanced options, and different response formats.
 */

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function directionsExamples() {
   try {
      // Let's start simple - just get me from point A to point B
      console.log("Basic route calculation...");

      const basicRoute = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [19.054434, 47.497974], // Budapest - Deák Ferenc tér
            [19.022675, 47.507766], // Budapest - Széll Kálmán tér
         ],
      });

      const basicSummary = basicRoute.routes[0]?.summary;
      console.log(`Basic route: ${Math.round((basicSummary?.distance || 0) / 100) / 10} km, ${Math.round((basicSummary?.duration || 0) / 60)} min`);

      // Now let's get fancy - avoid highways, get turn-by-turn directions, elevation data
      console.log("\nAdvanced route with all the bells and whistles...");

      const advancedRoute = await client.directions.calculateRoute("driving-car", {
         coordinates: [
            [19.054434, 47.497974], // Budapest - Deák Ferenc tér
            [19.022675, 47.507766], // Budapest - Széll Kálmán tér
         ],
         instructions: true,
         language: "en",
         geometry: true,
         elevation: true,
         alternative_routes: {
            target_count: 2,
            weight_factor: 1.2,
         },
         options: {
            avoid_features: ["highways", "tollways"],
         },
      });

      const advSummary = advancedRoute.routes[0]?.summary;
      console.log(`Advanced route: ${Math.round((advSummary?.distance || 0) / 100) / 10} km, ${Math.round((advSummary?.duration || 0) / 60)} min`);
      console.log(`Elevation gain: ${advSummary?.ascent || 0}m up, ${advSummary?.descent || 0}m down`);

      const steps = advancedRoute.routes[0]?.segments[0]?.steps;
      console.log(`Got ${steps?.length || 0} turn-by-turn instructions`);

      // Sometimes you need the route as GeoJSON (great for mapping libraries)
      console.log("\nGetting route as GeoJSON for mapping...");

      const geoJsonRoute = await client.directions.calculateRouteGeoJSON("foot-walking", {
         coordinates: [
            [19.054434, 47.497974], // Budapest - Deák Ferenc tér
            [19.022675, 47.507766], // Budapest - Széll Kálmán tér
         ],
         instructions: true,
      });

      console.log(`GeoJSON route has ${geoJsonRoute.features.length} feature(s) - ready for your map!`);
   } catch (error) {
      console.error("Something went wrong:", error);
      console.log("Check your API key and network connection!");
   }
}

directionsExamples();
