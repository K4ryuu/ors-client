export { OpenRouteService } from './openrouteservice.js';
export { OpenRouteServiceClient, OpenRouteServiceError } from './client.js';

export { DirectionsService } from './services/directions.js';
export { MatrixService } from './services/matrix.js';
export { IsochronesService } from './services/isochrones.js';
export { GeocodingService } from './services/geocoding.js';
export { POIService } from './services/pois.js';
export { OptimizationService } from './services/optimization.js';
export { ElevationService } from './services/elevation.js';
export { SnapService } from './services/snap.js';
export { ExportService } from './services/export.js';

export type {
	Coordinate,
	Profile,
	ClientConfig,
	AuthConfig,
	BaseRequest,
	DistanceUnit,
	LanguageCode,
	GeoJSONFeatureCollection
} from './types/common.js';

export type {
	RoutingPreference,
	InstructionFormat,
	AlternativeRoutes,
	RouteAttribute,
	CustomModel,
	RoutingOptions,
	DirectionsGetRequest,
	DirectionsPostRequest,
	RouteSegment,
	RouteStep,
	RouteSummary,
	Route,
	DirectionsResponse,
	DirectionsGeoJSONResponse
} from './types/directions.js';

export type {
	MatrixMetric,
	MatrixRequest,
	ResolvedLocation,
	MatrixResponse
} from './types/matrix.js';

export type {
	IsochroneRangeType,
	IsochroneRequest,
	IsochroneResponse
} from './types/isochrones.js';

export type {
	GeocodingRequest,
	ReverseGeocodingRequest,
	StructuredGeocodingRequest,
	AutocompleteRequest,
	GeocodingProperties,
	GeocodingFeature,
	GeocodingResponse
} from './types/geocoding.js';

export type {
	POIRequest,
	POIProperties,
	POIFeature,
	POIResponse,
	POIStatsResponse,
	POICategoriesResponse
} from './types/pois.js';

export type {
	OptimizationVehicle,
	OptimizationJob,
	OptimizationShipment,
	OptimizationRequest,
	OptimizationStep,
	OptimizationRoute,
	OptimizationUnassigned,
	OptimizationSummary,
	OptimizationResponse,
	OptimizationViolation
} from './types/optimization.js';

export type {
	ElevationPointRequest,
	ElevationLineRequest,
	ElevationPointResponse,
	ElevationLineResponse,
	ElevationProperties,
	ElevationFeature,
	ElevationGeoJSONResponse
} from './types/elevation.js';

export type {
	SnapRequest,
	SnapResponse,
	SnapGeoJSONResponse,
	SnappedLocation,
	SnapFeature
} from './types/snap.js';

export type {
	ExportRequest,
	ExportResponse,
	ExportTopoJSONResponse,
	GraphNode,
	GraphEdge
} from './types/export.js';