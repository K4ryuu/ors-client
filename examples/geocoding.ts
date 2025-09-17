import { OpenRouteService } from "../src/index.js";
import "dotenv/config";

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function geocodingExamples() {
   try {
      // Search for a place
      const searchResults = await client.geocoding.search({
         text: "Berlin",
         size: 5,
         layers: ["locality", "region"],
         "boundary.country": ["DE"],
      });

      console.log("Search results:", searchResults.features.length);
      console.log("First result:", searchResults.features[0]?.properties.name);

      // Structured search
      const structuredResults = await client.geocoding.searchStructured({
         locality: "Berlin",
         country: "Germany",
         size: 3,
      });

      console.log("Structured search results:", structuredResults.features.length);

      // Reverse geocoding
      const reverseResults = await client.geocoding.reverse({
         "point.lon": 13.404954,
         "point.lat": 52.520008,
         size: 5,
         layers: ["address", "street"],
      });

      console.log("Reverse geocoding results:", reverseResults.features.length);
      console.log("Address:", reverseResults.features[0]?.properties.label);
   } catch (error) {
      console.error("Error:", error);
   }
}

geocodingExamples();
