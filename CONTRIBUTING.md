# Contributing

Hey, thanks for wanting to contribute! Here's what you need to know.

## Setup

```bash
git clone https://github.com/K4ryuu/ors-client.git
cd ors-client
bun install   # or pnpm/npm, whatever you prefer
```

Copy `.env.example` to `.env` and add your ORS API key — you'll need it for the integration tests.

## Running tests

```bash
bun test          # run all tests
bun test test/cache.test.ts  # run a specific file
```

Most tests hit the real ORS API so you need a valid key. If a test fails due to rate limiting, just try again.

## Making changes

- **Bugs** — open an issue first so we can confirm it's actually a bug
- **Features** — open an issue to discuss before spending time on it
- **Docs / examples** — just send the PR, no need to discuss

## Code style

- TypeScript, strict mode, no `any`
- No runtime dependencies — keep it that way
- Short inline comments only, no docblocks
- Follow the patterns already in the codebase

## Commits

```
type: description
```

Types: `feat` `fix` `docs` `chore` `refactor` `test`

Keep it lowercase, keep it short.

## Pull requests

- One thing per PR
- If it's a new feature, add or update the relevant example in `examples/`
- If it's a bug fix, add a test that catches it
- Update `CHANGELOG.md` under `[Unreleased]`

That's it. Don't overthink it.
