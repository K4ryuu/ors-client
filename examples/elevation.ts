import { OpenRouteService } from "../src/index.js"; // or "ors-client" if using npm package
import "dotenv/config";

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function elevationExamples() {
   try {
      // Get elevation for a specific point
      const pointElevation = await client.elevation.getPointElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "Point",
            coordinates: [19.054434, 47.497974], // Deák Ferenc tér
         },
      });

      console.log("Point elevations:", pointElevation);

      // Get elevation along a line (route profile)
      const lineElevation = await client.elevation.getLineElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "LineString",
            coordinates: [
               [19.054434, 47.497974], // Deák Ferenc tér
               [19.050625, 47.497066], // Vörösmarty tér
               [19.056067, 47.492944], // Ferenciek tere
               [19.059853, 47.494290], // Astoria
            ],
         },
      });

      console.log("Line elevation profile:", lineElevation);

      // Get another point elevation as GeoJSON
      const geoJsonElevation = await client.elevation.getPointElevation({
         format_in: "geojson",
         format_out: "geojson",
         geometry: {
            type: "Point",
            coordinates: [19.059853, 47.494290], // Astoria
         },
      });

      console.log("GeoJSON elevation features:", geoJsonElevation);
   } catch (error) {
      console.error("Error:", error);
   }
}

elevationExamples();
