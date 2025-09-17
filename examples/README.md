# Examples

Alright, so you want to see this thing in action? Cool! Here are some examples to get you started.

## Before you dive in

You'll need an API key first. Go grab one from [OpenRouteService](https://openrouteservice.org/sign-up/) - it's free and takes like 30 seconds.

Then just swap out `'your-api-key-here'` in the examples with your actual key.

## Running these bad boys

Each example is its own thing, so just pick what you need:

```bash
# I recommend using tsx, it's way easier
pnpm exec tsx examples/basic-usage.ts

# Or if you're old school and want to compile first
pnpm run build
node dist/examples/basic-usage.js
```

## What's in the box?

### `basic-usage.ts`
The dead simple example. Just get from A to B and see how long it takes. Perfect if you're just getting started.

### `directions.ts`
This is the good stuff - routing with all the bells and whistles. Basic routes, turn-by-turn directions, alternative routes, avoiding highways because who likes traffic, right?

### `matrix.ts`
Want to know distances between a bunch of places? This calculates travel times and distances between multiple points. Super handy for delivery apps or "find the nearest pizza place".

### `isochrones.ts`
Ever wondered "what can I reach in 10 minutes by bike?" This creates those cool reachability maps. Great for "how far can I get from here" type questions.

### `geocoding.ts`
Turn "123 Main Street" into coordinates and vice versa. Also does fancy stuff like structured search and filtering by country.

### `pois.ts`
Find restaurants, ATMs, gas stations, whatever. Basically "what's around me" but with proper filtering and distance sorting.

### `elevation.ts`
Get elevation data for your routes. Perfect for hiking apps or figuring out if that bike route is gonna kill your legs.

### `optimization.ts`
The fancy stuff - vehicle routing optimization. Think delivery route planning with multiple trucks and constraints. Pretty advanced but super powerful.

### `export.ts`
Extract the underlying routing graph data for advanced analysis. Get nodes and edges with weights - perfect for custom routing algorithms or network analysis.

### `snap.ts`
Snap GPS coordinates to the nearest roads. Super useful for cleaning up tracking data or ensuring coordinates are on actual roads.

### `shared-client.ts`
Shows how to create a shared client instance for your app. Better than singleton pattern - just export a configured client from a module. Simple and clean.

## Pro tips

- All examples should work with free API keys
- Don't spam the API too hard, it has rate limits
- Coordinates are `[longitude, latitude]` - yeah I know, it's backwards from what you'd expect but that's just how it is 🤷‍♂️
- If something's not working, check the console - the error messages are actually pretty helpful

## Stuck?

Check the main README or throw an issue on GitHub. I try to respond when I'm not too buried in work!