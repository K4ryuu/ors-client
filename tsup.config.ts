import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  outDir: 'dist',
  external: [],
  noExternal: [],
  banner: {
    js: '/* OpenRouteService TypeScript Client */'
  }
});