// Types for the Optimization service - solve vehicle routing problems like a boss

import type { Coordinate } from "./common.js";

// Optimization violation - when things don't go according to plan
export interface OptimizationViolation {
   cause: "delay" | "lead_time" | "load" | "max_tasks" | "skills" | "precedence" | "missing_break" | "max_travel_time" | "max_distance" | "max_load";
   duration?: number; // Duration of the violation in seconds (optional, for time-related violations)
}

// Vehicle for optimization - your fleet
export interface OptimizationVehicle {
   id: number; // Vehicle ID
   profile?: "driving-car" | "driving-hgv" | "cycling-regular" | "foot-walking"; // Vehicle profile
   start?: Coordinate;
   end?: Coordinate;
   capacity?: number[]; // Start/end locations and capacity
   skills?: number[];
   time_window?: [number, number]; // Skills and time window

   // Service breaks
   breaks?: Array<{ id: number; time_windows: [number, number][]; service?: number }>;
}

// Job for optimization - individual tasks
export interface OptimizationJob {
   id: number; // Job ID
   type?: "pickup" | "delivery"; // Job type
   service?: number; // Service duration
   amount?: number[]; // Amount/demand
   location: Coordinate; // Location
   skills?: number[]; // Skills required
   priority?: number; // Priority
   time_windows?: [number, number][]; // Time windows
}

// Shipment for optimization - pickup and delivery pairs
export interface OptimizationShipment {
   amount: number[]; // Shipment amount
   skills?: number[]; // Skills required
   priority?: number; // Priority

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

// Optimization request - the whole problem definition
export interface OptimizationRequest {
   jobs?: OptimizationJob[]; // List of jobs
   shipments?: OptimizationShipment[]; // List of shipments
   vehicles: OptimizationVehicle[]; // List of vehicles

   // Distance matrix override
   matrix?: {
      durations?: number[][]; // Duration matrix
      distances?: number[][]; // Distance matrix
   };

   // Optimization options
   options?: { g?: boolean }; // Routing granularity
}

// Optimization route step - individual actions in a route
export interface OptimizationStep {
   type: "start" | "job" | "pickup" | "delivery" | "break" | "end"; // Step type
   location?: Coordinate;
   id?: number;
   service?: number; // Location, ID, and service time
   waiting_time?: number;
   arrival?: number;
   duration?: number; // Timing info
   distance?: number;
   load?: number[];
   setup?: number; // Distance, load, and setup
   job?: number;
   violations?: OptimizationViolation[]; // Job ID and violations
}

// Optimization route - complete route for one vehicle
export interface OptimizationRoute {
   vehicle: number;
   cost: number;
   service: number;
   duration: number;
   waiting_time: number;
   priority: number;
   distance?: number;
   setup?: number;
   steps: OptimizationStep[];
   geometry?: string;
   delivery?: number[];
   amount?: number[];
   pickup?: number[];
   violations?: OptimizationViolation[];
}

// Unassigned job/shipment - tasks that couldn't be assigned to any vehicle
export interface OptimizationUnassigned {
   id: number; // Job/shipment ID
   type: "job" | "pickup" | "delivery"; // Type
   description: string; // Reason for being unassigned
}

// Optimization summary - high-level results
export interface OptimizationSummary {
   cost: number;
   unassigned: number;
   service: number;
   duration: number;
   waiting_time: number;
   priority: number;
   distance?: number;
   routes?: number;
   delivery?: number[];
   amount?: number[];
   pickup?: number[];
   setup?: number;
   violations?: OptimizationViolation[];

   // Computing times
   computing_times?: { loading: number; solving: number; routing: number };
}

// Optimization response - the complete solution
export interface OptimizationResponse {
   code: number; // Solution code
   error?: string; // Error message if failed
   summary: OptimizationSummary; // Summary
   unassigned: OptimizationUnassigned[]; // Unassigned jobs/shipments
   routes: OptimizationRoute[]; // Routes
}
