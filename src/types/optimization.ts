// Types for the Optimization service - solve vehicle routing problems like a boss

import type { Coordinate } from "./common.js";

/** A constraint violation in the optimization solution - something that couldn't be fully satisfied. */
export interface OptimizationViolation {
   /** The type of constraint that was violated. */
   cause: "delay" | "lead_time" | "load" | "max_tasks" | "skills" | "precedence" | "missing_break" | "max_travel_time" | "max_distance" | "max_load";
   /** How long the violation lasts in seconds (for time-related violations). */
   duration?: number;
}

/** A vehicle in the fleet - defines its routing profile, location, capacity, and schedule. */
export interface OptimizationVehicle {
   /** Unique vehicle ID. */
   id: number;
   /** Routing profile for this vehicle. */
   profile?: "driving-car" | "driving-hgv" | "cycling-regular" | "foot-walking";
   /** Starting location of the vehicle. */
   start?: Coordinate;
   /** Ending location (depot) of the vehicle. */
   end?: Coordinate;
   /** Capacity array - dimensions must match job `amount` arrays. */
   capacity?: number[];
   /** Skill IDs this vehicle has - only jobs requiring these skills will be assigned. */
   skills?: number[];
   /** Working time window as Unix timestamps `[start, end]`. */
   time_window?: [number, number];

   // Service breaks
   breaks?: Array<{ id: number; time_windows: [number, number][]; service?: number }>;
}

/** A single job (task) to be assigned to a vehicle. */
export interface OptimizationJob {
   /** Unique job ID. */
   id: number;
   /** Whether this is a pickup or delivery job. */
   type?: "pickup" | "delivery";
   /** Time in seconds needed at the location to complete the job. */
   service?: number;
   /** Demand array - must match the vehicle's `capacity` dimensions. */
   amount?: number[];
   /** Where the job needs to be done. */
   location: Coordinate;
   /** Required skill IDs - only vehicles with all these skills can do the job. */
   skills?: number[];
   /** Priority level - higher priority jobs are scheduled first. */
   priority?: number;
   /** Allowed time windows for the job as Unix timestamp pairs. */
   time_windows?: [number, number][];
}

/** A paired pickup + delivery task - the vehicle must do both in order. */
export interface OptimizationShipment {
   /** Shipment demand - must match vehicle capacity dimensions. */
   amount: number[];
   /** Required skill IDs for this shipment. */
   skills?: number[];
   /** Shipment priority. */
   priority?: number;

   // Pickup location
   pickup: {
      id: number;
      service?: number;
      location: Coordinate;
      time_windows?: [number, number][];
   };

   // Delivery location
   delivery: {
      id: number;
      service?: number;
      location: Coordinate;
      time_windows?: [number, number][];
   };
}

/** The full optimization problem definition - vehicles, jobs/shipments, and options. */
export interface OptimizationRequest {
   /** Jobs to be assigned and completed by vehicles. */
   jobs?: OptimizationJob[];
   /** Paired pickup/delivery shipments. */
   shipments?: OptimizationShipment[];
   /** Available vehicles. At least one is required. */
   vehicles: OptimizationVehicle[];

   // Distance matrix override
   matrix?: {
      /** Pre-computed duration matrix in seconds (overrides ORS routing). */
      durations?: number[][];
      /** Pre-computed distance matrix in meters. */
      distances?: number[][];
   };

   // Optimization options
   options?: { g?: boolean };
}

/** A single action step within an optimized vehicle route. */
export interface OptimizationStep {
   /** What happens at this step. */
   type: "start" | "job" | "pickup" | "delivery" | "break" | "end";
   /** Location of this step (if applicable). */
   location?: Coordinate;
   /** Job/shipment ID associated with this step. */
   id?: number;
   /** Service time at this location in seconds. */
   service?: number;
   /** Waiting time before service starts in seconds. */
   waiting_time?: number;
   /** Arrival time as a Unix timestamp. */
   arrival?: number;
   /** Cumulative route duration in seconds up to this step. */
   duration?: number;
   /** Cumulative distance in meters up to this step. */
   distance?: number;
   /** Current vehicle load after this step. */
   load?: number[];
   /** Setup time at this location in seconds. */
   setup?: number;
   /** The job ID serviced at this step. */
   job?: number;
   /** Any constraint violations at this step. */
   violations?: OptimizationViolation[];
}

/** The complete optimized route for a single vehicle. */
export interface OptimizationRoute {
   /** ID of the vehicle this route is assigned to. */
   vehicle: number;
   /** Total cost of this route. */
   cost: number;
   /** Total service time in seconds. */
   service: number;
   /** Total route duration in seconds (travel + service + waiting). */
   duration: number;
   /** Total waiting time in seconds. */
   waiting_time: number;
   /** Accumulated priority of all completed jobs. */
   priority: number;
   /** Total distance in meters. */
   distance?: number;
   /** Total setup time in seconds. */
   setup?: number;
   /** Ordered list of steps in this route. */
   steps: OptimizationStep[];
   /** Encoded polyline geometry of the route (if `options.g` was true). */
   geometry?: string;
   delivery?: number[];
   amount?: number[];
   pickup?: number[];
   violations?: OptimizationViolation[];
}

/** A job or shipment that couldn't be assigned to any vehicle. */
export interface OptimizationUnassigned {
   /** ID of the unassigned job or shipment. */
   id: number;
   /** Whether it's a job, pickup, or delivery. */
   type: "job" | "pickup" | "delivery";
   /** Reason why it couldn't be assigned. */
   description: string;
}

/** High-level summary of the optimization solution. */
export interface OptimizationSummary {
   /** Total solution cost. */
   cost: number;
   /** Number of unassigned jobs/shipments. */
   unassigned: number;
   /** Total service time in seconds across all routes. */
   service: number;
   /** Total duration in seconds across all routes. */
   duration: number;
   /** Total waiting time in seconds across all routes. */
   waiting_time: number;
   /** Total accumulated priority. */
   priority: number;
   /** Total distance in meters. */
   distance?: number;
   /** Number of routes in the solution. */
   routes?: number;
   delivery?: number[];
   amount?: number[];
   pickup?: number[];
   setup?: number;
   violations?: OptimizationViolation[];

   // Computing times
   computing_times?: { loading: number; solving: number; routing: number };
}

/** The complete optimization API response - solution routes, unassigned tasks, and summary. */
export interface OptimizationResponse {
   /** Solution status code. */
   code: number;
   /** Error message if the solver failed. */
   error?: string;
   /** High-level solution stats. */
   summary: OptimizationSummary;
   /** Jobs/shipments that couldn't be assigned to any vehicle. */
   unassigned: OptimizationUnassigned[];
   /** Optimized per-vehicle routes. */
   routes: OptimizationRoute[];
}
