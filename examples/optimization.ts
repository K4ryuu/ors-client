import { OpenRouteService } from "../src/index.js"; // or "ors-client" if using npm package
import "dotenv/config";

const client = new OpenRouteService({
   apiKey: process.env.ORS_API_KEY || "",
});

async function optimizationExamples() {
   try {
      // Vehicle Routing Problem with jobs
      const vrpSolution = await client.optimization.solve({
         vehicles: [
            {
               id: 1,
               start: [19.054434, 47.497974], // Deák Ferenc tér
               end: [19.054434, 47.497974], // Deák Ferenc tér
               capacity: [10],
               profile: "driving-car",
            },
            {
               id: 2,
               start: [19.063272, 47.505083], // Oktogon
               end: [19.063272, 47.505083], // Oktogon
               capacity: [15],
               profile: "driving-car",
            },
         ],
         jobs: [
            {
               id: 1,
               location: [19.050625, 47.497066], // Vörösmarty tér
               service: 300, // 5 minutes
               amount: [3],
            },
            {
               id: 2,
               location: [19.056067, 47.492944], // Ferenciek tere
               service: 240, // 4 minutes
               amount: [2],
            },
            {
               id: 3,
               location: [19.059853, 47.49429], // Astoria
               service: 180, // 3 minutes
               amount: [4],
            },
            {
               id: 4,
               location: [19.05618, 47.511], // Nyugati pályaudvar
               service: 360, // 6 minutes
               amount: [5],
            },
         ],
      });

      console.log("VRP Solution Code:", vrpSolution.code);
      console.log("Total Cost:", vrpSolution.summary.cost);
      console.log("Total Duration:", vrpSolution.summary.duration);
      console.log("Routes:", vrpSolution.routes.length);
      console.log("Unassigned jobs:", vrpSolution.unassigned.length);

      // Check for any violations (now properly typed)
      let hasViolations = false;
      vrpSolution.routes.forEach((route, i) => {
         if (route.violations?.length) {
            console.log(`Route ${i} violations:`, route.violations);
            hasViolations = true;
         }
         route.steps.forEach((step, j) => {
            if (step.violations?.length) {
               console.log(`Route ${i}, Step ${j} violations:`, step.violations);
               hasViolations = true;
            }
         });
      });
      if (vrpSolution.summary.violations?.length) {
         console.log("Summary violations:", vrpSolution.summary.violations);
         hasViolations = true;
      }
      if (!hasViolations) {
         console.log("No violations found - optimal solution!");
      }

      // Pickup and delivery problem
      const pickupDelivery = await client.optimization.solve({
         vehicles: [
            {
               id: 1,
               start: [19.054434, 47.497974], // Deák Ferenc tér
               end: [19.054434, 47.497974], // Deák Ferenc tér
               capacity: [20],
               profile: "driving-car",
            },
         ],
         shipments: [
            {
               amount: [5],
               pickup: {
                  id: 1,
                  location: [19.050625, 47.497066], // Vörösmarty tér
                  service: 300,
               },
               delivery: {
                  id: 2,
                  location: [19.059853, 47.49429], // Astoria
                  service: 240,
               },
            },
            {
               amount: [3],
               pickup: {
                  id: 3,
                  location: [19.056067, 47.492944], // Ferenciek tere
                  service: 180,
               },
               delivery: {
                  id: 4,
                  location: [19.05618, 47.511], // Nyugati pályaudvar
                  service: 300,
               },
            },
         ],
      });

      console.log("Pickup-Delivery Solution:", pickupDelivery.summary);
   } catch (error) {
      console.error("Error:", error);
   }
}

optimizationExamples();
