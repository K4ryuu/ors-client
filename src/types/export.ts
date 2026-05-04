// Types for the Export service - extract routing graph data

import type { Coordinate, BaseRequest } from "./common.js";

/** Request to export routing graph data within a bounding box. */
export interface ExportRequest extends BaseRequest {
   /** Bounding box as `[[min_lon, min_lat], [max_lon, max_lat]]`. */
   bbox: [Coordinate, Coordinate];
   /** Whether to include geometry for each edge. */
   geometry?: boolean;
}

/** A node (intersection) in the routing graph. */
export interface GraphNode {
   /** Internal ORS node ID. */
   nodeId: number;
   /** Geographic location of the node as `[longitude, latitude]`. */
   location: Coordinate;
}

/** An edge (road segment) connecting two nodes in the routing graph. */
export interface GraphEdge {
   /** ID of the source node. */
   fromId: number;
   /** ID of the target node. */
   toId: number;
   /** Edge traversal cost/time as a string value. */
   weight: string;
}

/** Routing graph export response in JSON format. */
export interface ExportResponse {
   /** All nodes within the requested area. */
   nodes: GraphNode[];
   /** All edges connecting the nodes. */
   edges: GraphEdge[];
   /** Total count of nodes in the response. */
   nodes_count: number;
   /** Total count of edges in the response. */
   edges_count: number;
}

/** Base TopoJSON topology object. */
export interface TopoJSONObject {
   type: "Topology";
   objects: Record<string, unknown>;
   arcs: number[][][];
   /** Bounding box of the topology as `[west, south, east, north]`. */
   bbox?: [number, number, number, number];
   /** Scale and translation for quantized coordinates. */
   transform?: { scale: [number, number]; translate: [number, number] };
}

/** Routing graph export response in TopoJSON format. */
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
