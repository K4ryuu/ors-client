// Types for the Export service - extract routing graph data

import type { Coordinate, BaseRequest } from "./common.js";

// Export request parameters - get the routing graph for an area
export interface ExportRequest extends BaseRequest {
   bbox: [Coordinate, Coordinate]; // Bounding box coordinates as array of coordinate pairs [longitude, latitude]
   geometry?: boolean; // Include geometry information
}

// Graph node - a point in the routing network
export interface GraphNode {
   nodeId: number; // Node ID
   location: Coordinate; // Node location [longitude, latitude]
}

// Graph edge - a connection between two nodes
export interface GraphEdge {
   fromId: number; // Source node ID
   toId: number; // Target node ID
   weight: string; // Edge weight (travel cost/time)
}

// Export response (JSON format) - the routing graph data
export interface ExportResponse {
   nodes: GraphNode[]; // Array of graph nodes
   edges: GraphEdge[]; // Array of graph edges
   nodes_count: number; // Number of nodes in the graph
   edges_count: number; // Number of edges in the graph
}

// TopoJSON object base interface
export interface TopoJSONObject {
   type: "Topology";
   objects: Record<string, unknown>;
   arcs: number[][][];
   bbox?: [number, number, number, number];
   transform?: { scale: [number, number]; translate: [number, number] };
}

// Export response in TopoJSON format - compressed geographic data
export interface ExportTopoJSONResponse extends TopoJSONObject {
   // Graph topology data
   objects: {
      roads: {
         type: "GeometryCollection";
         geometries: Array<{
            type: "LineString";
            arcs: number[][];
            properties?: Record<string, unknown>;
         }>;
      };
   };
}
