# Changelog

All notable changes to this project will be documented here.

---

## 1.1.0 - 2026-05-04

### Added

- Built-in caching system — pass `cache: number` for zero-config in-memory TTL cache
- `CacheAdapter` interface for plugging in any backend (Redis, DB, Map, anything)
- `CacheConfig` type with optional `buildKey` lambda for custom cache key generation
- `MemoryCache` class and `defaultBuildKey` helper exported from the package
- `examples/caching.ts` with in-memory, Redis, custom key, and DB adapter patterns
- Unit tests for cache logic (`test/cache.test.ts`, 17 tests)

### Changed

- Migrated dev tooling to Bun (test runner, package manager)
- All devDependencies bumped to latest
- Added `bun` to `engines` in `package.json`

---

## 1.0.6 - 2025-01-01

### Fixed

- `baseUrl` option now respected for self-hosted ORS instances ([#1](https://github.com/K4ryuu/ors-client/issues/1))
- Updated devDependencies to resolve 12 audit vulnerabilities

---

## 1.0.5 - 2024-12-01

### Changed

- Updated all dependencies to latest versions

---

## 1.0.4 - 2024-11-01

### Fixed

- Rate limiting is now isolated per API key — multiple clients with different keys no longer interfere with each other

---

## 1.0.3 - 2024-10-15

### Fixed

- Removed `console.warn` from library code (was polluting consumer console output)
- Added missing `RouteGeometry` type export

---

## 1.0.2 - 2024-10-01

### Fixed

- `Route` interface now correctly supports GeoJSON `LineString` geometry

---

## 1.0.1 - 2024-09-15

### Fixed

- Module entry points corrected in `package.json`
- Import statement in Quick Example section of README

---

## 1.0.0 - 2024-09-01

### Added

- Initial release
- Full TypeScript client for the OpenRouteService API
- Directions, Matrix, Isochrones, Geocoding, POIs, Optimization, Elevation, Snap, Export services
- Zero runtime dependencies
- Built-in geocoding throttling
- `OpenRouteServiceError` with typed status code helpers
- Rate limit info tracking via `getLastRateLimitInfo()`
