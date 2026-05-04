<a name="readme-top"></a>

<!-- BADGES -->
<div align="center">

![NPM Version](https://img.shields.io/npm/v/ors-client?style=for-the-badge&label=NPM)
![NPM Downloads](https://img.shields.io/npm/dm/ors-client?style=for-the-badge&label=Downloads)
![GitHub License](https://img.shields.io/github/license/K4ryuu/ors-client?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/K4ryuu/ors-client?style=for-the-badge)
![GitHub Issues](https://img.shields.io/github/issues/K4ryuu/ors-client?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/ors-client?style=for-the-badge&label=Bundle%20Size)

</div>

<!-- PROJECT TITLE -->
<br />
<div align="center">
  <h1 align="center">OpenRouteService JavaScript/TypeScript Client</h1>
  <p align="center">
    A modern, lightweight client library for the OpenRouteService API
    <br />
    <strong>Zero runtime dependencies • Full TypeScript support • Built-in rate limiting • Pluggable caching</strong>
    <br />
    <br />
    <a href="#installation"><strong>Get Started »</strong></a>
    <br />
    <br />
    <a href="https://github.com/K4ryuu/ors-client/tree/main/examples">View Examples</a>
    ·
    <a href="https://github.com/K4ryuu/ors-client/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/K4ryuu/ors-client/issues/new?labels=enhancement">Request Feature</a>
    ·
    <a href="https://openrouteservice.org/">OpenRouteService</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

Hey! 👋 This is a modern JavaScript/TypeScript client for the [OpenRouteService API](https://openrouteservice.org). I built this because I couldn't find a good client library for ORS and thought others might find it useful too.

## Why I made this

I was working on multiple projects that needed routing capabilities and while ORS has an amazing API, I couldn't find a good client library for it. So I decided to make one and share it with everyone who might need it.

What makes this client special:

-  **Zero runtime dependencies** - Seriously, check the package.json. All dependencies are just for building/development
-  **Works everywhere** - CommonJS, ES modules, TypeScript, plain JavaScript
-  **Full TypeScript support** - Complete type safety (no more `any` everywhere!)
-  **All ORS services** - Everything from routing to geocoding in one package
-  **Built-in throttling** - Automatic rate limiting compliance
-  **Pluggable caching** - Built-in in-memory cache or bring your own (Redis, DB, anything)
-  **Actually useful error messages** - Know exactly what went wrong

## What's inside?

This client covers all the main ORS services:

-  **Directions** - Get routes with turn-by-turn navigation
-  **Matrix** - Calculate distances between multiple points
-  **Isochrones** - Find reachable areas from a location
-  **Geocoding** - Search for addresses and places
-  **POIs** - Find points of interest
-  **Optimization** - Solve vehicle routing problems
-  **Elevation** - Get elevation data for coordinates
-  **Export** - Extract routing graph data within bounding boxes

## Installation

```bash
npm install ors-client
pnpm add ors-client
bun add ors-client
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Quick example

```typescript
import { OpenRouteService } from "ors-client";

const ors = new OpenRouteService({
   apiKey: "your-api-key", // get one free at openrouteservice.org
});

// Get a route
const route = await ors.directions.calculateRoute("driving-car", {
   coordinates: [
      [8.681495, 49.41461],
      [8.686507, 49.41943],
   ],
});

console.log(`Distance: ${route.routes[0].summary.distance}m`);
```

## Getting an API key

You'll need an API key from OpenRouteService. It's free and you can get one here: https://openrouteservice.org/sign-up/

The free tier is pretty generous for most projects.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## More examples

Check out the [examples](./examples) folder. I've added examples for pretty much everything:

-  Basic routing
-  Distance matrices
-  Finding POIs
-  Vehicle routing optimization
-  And more...

Each example file is runnable, just add your API key and you're good to go.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## For developers

If you want to contribute or just poke around:

```bash
# Clone the repo
git clone https://github.com/K4ryuu/ors-client.git
cd ors-client

# Install deps
bun install

# Run tests (you'll need a .env file with your API key)
cp .env.example .env
# add your key to .env
bun test

# Build it
bun run build
```

### A note about tests

All tests should pass with a valid API key. If some tests fail, it might be due to temporary API issues or rate limiting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TypeScript

Everything is fully typed. Your IDE will thank you. No more guessing what properties exist on the response object!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built-in Rate Limiting & Throttling

This wrapper automatically handles API rate limiting requirements to keep you compliant:

### Geocoding Services (Automatic)
- **Autocomplete, Search, Reverse geocoding** are automatically throttled to ~3.33 requests/second per endpoint
- Each endpoint has independent throttling (search + autocomplete can run simultaneously)
- This follows OpenRouteService's requirement that "requests must be throttled" for geocoding services

### Export Service (Manual)
- Export API has very strict rate limits - use sparingly
- Consider caching export results for reuse
- Export tests are skipped in CI due to rate limit sensitivity

### All Other Services
- No built-in throttling (directions, matrix, isochrones, etc.)
- Follow standard API rate limits based on your plan

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Dependencies

This package has **ZERO runtime dependencies**. None. Nada. Check the `package.json` if you don't believe me.

All the packages in `devDependencies` are only used for building, testing, and linting. When you install this in your project, it's just pure JavaScript/TypeScript code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## API Coverage

All OpenRouteService endpoints are supported:

- ✅ **Directions** - Routing with turn-by-turn navigation (GET/POST, JSON/GeoJSON)
- ✅ **Matrix** - Distance/duration calculations between multiple points
- ✅ **Isochrones** - Reachability analysis (time/distance polygons)
- ✅ **Geocoding** - Address search, reverse geocoding, autocomplete (with throttling)
- ✅ **POIs** - Points of interest search with category filtering
- ✅ **Optimization** - Vehicle routing problem solving (TSP, VRP)
- ✅ **Elevation** - Point and line elevation data
- ✅ **Snap** - Coordinate snapping to road network
- ✅ **Export** - Routing graph data extraction (with rate limit handling)

## Error Handling

The wrapper provides detailed error information through `OpenRouteServiceError`:

```typescript
try {
  const route = await ors.directions.calculateRoute('driving-car', {
    coordinates: [[8.681495, 49.41461], [8.686507, 49.41943]]
  });
} catch (error) {
  if (error instanceof OpenRouteServiceError) {
    console.log(`API Error: ${error.message}`);
    console.log(`Status: ${error.statusCode}`);

    // Quick error type checks
    if (error.isRateLimited()) {
      console.log('Rate limited! Try again later.');
      console.log(`Remaining requests: ${error.getRemainingRequests()}`);
    }

    if (error.isBadRequest()) {
      console.log('Invalid request parameters');
    }
  }
}
```

## Caching

Pass `cache` to the config and identical requests are served from cache — no extra network call.

**In-memory (zero setup):**

```typescript
const ors = new OpenRouteService({
   apiKey: "your-api-key",
   cache: 6 * 60 * 60_000, // 6h TTL, built-in Map-based cache
});
```

**Custom adapter (Redis, DB, anything):**

```typescript
import Redis from 'ioredis';
const redis = new Redis();

const ors = new OpenRouteService({
   apiKey: "your-api-key",
   cache: {
      adapter: {
         get: async (key) => {
            const val = await redis.get(key);
            return val ? JSON.parse(val) : null;
         },
         set: async (key, value, ttl) => {
            await redis.set(key, JSON.stringify(value), 'PX', ttl);
         },
      },
      ttl: 6 * 60 * 60_000, // 6h
   },
});
```

The `CacheAdapter` interface is dead simple — two methods, sync or async, any backend works. You can also pass a `buildKey` function to control exactly how cache keys are generated. Check out [examples/caching.ts](./examples/caching.ts) for more patterns.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Important notes

**Please consider supporting the OpenRouteService team!** If you can, definitely thank the OpenRouteService team for their work: https://openrouteservice.org/donations/

## Found a bug?

Open an issue on GitHub or send a PR. I try to keep this maintained but you know how it is with side projects 😅

## License

MIT - do whatever you want with it

---

## Credits

Built with ☕ by [K4ryuu](https://github.com/K4ryuu)

**Special thanks to the OpenRouteService team for providing an amazing routing API!** 🚀
