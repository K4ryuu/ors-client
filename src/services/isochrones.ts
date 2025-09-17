import type { Profile, ClientConfig } from "../types/common.js";
import type { IsochroneRequest, IsochroneResponse } from "../types/isochrones.js";
import { OpenRouteServiceClient } from "../client.js";

const API_VERSION = 2;

export class IsochronesService extends OpenRouteServiceClient {
   constructor(config: ClientConfig) {
      super(config, API_VERSION);
   }

   // Calculate travel time zones - "show me everywhere I can reach in 15 minutes"
   async calculateIsochrones(profile: Profile, request: IsochroneRequest): Promise<IsochroneResponse> {
      const headers = { Accept: "application/geo+json" };
      return this.post<IsochroneResponse>(`/isochrones/${profile}`, request, headers);
   }
}
