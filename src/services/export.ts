/**
 * Export Service - Extract routing graph data within bounding boxes
 *
 * Ever wondered what the actual road network looks like under the hood? This service lets you
 * grab the raw graph data - nodes (intersections) and edges (road segments) with their weights.
 * Perfect for building custom routing algorithms or doing network analysis.
 */

import { OpenRouteServiceClient } from "../client.js";
import type { ClientConfig, Profile } from "../types/common.js";
import type { ExportRequest, ExportResponse, ExportTopoJSONResponse } from "../types/export.js";

const API_VERSION = 2;

/**
 * Service for extracting raw routing graph data within a bounding box.
 * Nodes are intersections, edges are road segments with their weights.
 */
export class ExportService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   /**
    * Export routing graph data within a bounding box
    *
    * Gets you the raw network data - all the nodes and edges with their weights.
    * This is the stuff routing algorithms actually use under the hood.
    *
    * @param profile - Routing profile to export the graph for, e.g. `"driving-car"`
    * @param request - Export request with bounding box and options
    * @returns Graph data with nodes and edges
    * @throws {OpenRouteServiceError} On invalid bounding box or API errors
    *
    * @example
    * ```typescript
    * const graphData = await client.export.exportGraph('driving-car', {
    *   bbox: [[8.681495, 49.41461], [8.686507, 49.41943]],
    *   geometry: true
    * });
    *
    * console.log(`Found ${graphData.nodes_count} nodes and ${graphData.edges_count} edges`);
    * ```
    */
   async exportGraph(profile: Profile, request: ExportRequest): Promise<ExportResponse> {
      return this.post(`/export/${profile}`, request);
   }

   /**
    * Export routing graph data as JSON (explicit format).
    * Same as `exportGraph` but hits the `/json` endpoint directly.
    *
    * @param profile - Routing profile to export the graph for
    * @param request - Bounding box and options
    * @returns Graph data with nodes and edges
    * @throws {OpenRouteServiceError} On invalid bounding box or API errors
    */
   async exportGraphJSON(profile: Profile, request: ExportRequest): Promise<ExportResponse> {
      return this.post(`/export/${profile}/json`, request);
   }

   /**
    * Export routing graph data as TopoJSON - more compact than GeoJSON and works great
    * with web mapping libraries that support the format.
    *
    * @param profile - Routing profile to export the graph for
    * @param request - Bounding box and options
    * @returns Road network topology in TopoJSON format
    * @throws {OpenRouteServiceError} On invalid bounding box or API errors
    */
   async exportGraphTopoJSON(profile: Profile, request: ExportRequest): Promise<ExportTopoJSONResponse> {
      const headers = { Accept: "application/json" };
      return this.post(`/export/${profile}/topojson`, request, headers);
   }
}
