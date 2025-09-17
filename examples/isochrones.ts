import { OpenRouteService } from "../src/index.js";
import "dotenv/config";

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function isochroneExamples() {
   try {
      // Time-based isochrones
      const timeIsochrones = await client.isochrones.calculateIsochrones("driving-car", {
         locations: [[19.054434, 47.497974]], // Deák Ferenc tér
         range: [300, 600, 900], // 5, 10, 15 minutes
         range_type: "time",
         interval: 300,
      });

      console.log("Time isochrones features:", timeIsochrones.features.length);

      // Distance-based isochrones
      const distanceIsochrones = await client.isochrones.calculateIsochrones("foot-walking", {
         locations: [[19.054434, 47.497974]], // Deák Ferenc tér
         range: [500, 1000, 2000], // 500m, 1km, 2km
         range_type: "distance",
         smoothing: 0.9,
      });

      console.log("Distance isochrones features:", distanceIsochrones.features.length);

      // Multiple locations
      const multipleIsochrones = await client.isochrones.calculateIsochrones("cycling-regular", {
         locations: [
            [19.054434, 47.497974], // Deák Ferenc tér
            [19.063272, 47.505083], // Oktogon
         ],
         range: [600], // 10 minutes
         range_type: "time",
         location_type: "start",
      });

      console.log("Multiple location isochrones:", multipleIsochrones.features.length);
   } catch (error) {
      console.error("Error:", error);
   }
}

isochroneExamples();
