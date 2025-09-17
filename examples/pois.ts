import { OpenRouteService } from "../src/index.js";
import 'dotenv/config';

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function poisExamples() {
   try {
      // Get available POI categories
      const categories = await client.pois.getCategories();
      console.log("Available POI categories:", Object.keys(categories).length);

      // Search for POIs around a point
      const poisAroundPoint = await client.pois.searchPOIs({
         geometry: {
            bbox: [
               [19.04, 47.49],
               [19.06, 47.51]
            ],
            geojson: {
               type: "Point",
               coordinates: [19.054434, 47.497974], // Deák Ferenc tér
            },
            buffer: 1000, // 1km radius
         },
         filters: {
            category_ids: [180, 245], // Waste baskets and benches
         },
         limit: 10,
      });

      console.log("POIs around Deák tér:", poisAroundPoint.features?.length || 0);
      if (poisAroundPoint.features?.length > 0) {
         const firstPOI = poisAroundPoint.features[0];
         console.log("First POI:", firstPOI.properties.category_ids);
         console.log("Distance:", Math.round(firstPOI.properties.distance || 0), "meters");
      }

      // Search for POIs using category groups
      const poisByGroup = await client.pois.searchPOIs({
         geometry: {
            bbox: [
               [19.04, 47.49],
               [19.06, 47.51]
            ],
            geojson: {
               type: "Point",
               coordinates: [19.054434, 47.497974],
            },
            buffer: 500
         },
         filters: {
            category_group_ids: [160], // Facilities group
         },
         limit: 15,
      });

      console.log("POIs by group:", poisByGroup.features?.length || 0);

      // Get POI statistics
      const stats = await client.pois.getStats({
         geometry: {
            bbox: [
               [19.04, 47.49],
               [19.06, 47.51]
            ],
            geojson: {
               type: "Point",
               coordinates: [19.054434, 47.497974],
            },
            buffer: 1000
         },
      });

      console.log("POI statistics:", stats.places.total_count);

      // Get category groups (excluding total_count)
      const groupNames = Object.keys(stats.places).filter((key) => key !== "total_count");
      console.log("Category groups found:", groupNames.length);

      if (groupNames.length > 0) {
         const firstGroup = stats.places[groupNames[0]];
         if (typeof firstGroup === "object" && firstGroup !== null) {
            console.log(`First group "${groupNames[0]}":`, firstGroup.total_count, "places");
            console.log("Categories in group:", Object.keys(firstGroup.categories).length);
         }
      }
   } catch (error) {
      console.error("Error:", error);
   }
}

poisExamples();
