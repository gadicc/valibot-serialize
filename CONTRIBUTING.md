# Contributing

Thanks for your interest in contributing! This project is Deno-first and
side‑effect free.

## Project Layout

- `main.ts` — Library entry, re-exporting public API from `src/`.
- `src/` — Implementation and tests.
  - Converters: `src/converters/` (`encode.ts`, `decode.ts`, `to_code.ts`,
    `to_jsonschema.ts`, `from_jsonschema.ts`) with colocated tests.
  - Core: `src/util/*` helpers (e.g., `guard.ts`, `patterns.ts`,
    `serialized_json_schema.ts`).
  - Types: `src/types/` contains only the type codec modules (`string.ts`,
    `number.ts`, …) and a single `index.ts` that re-exports them. Shared type
    plumbing lives in `src/types/lib/` (e.g., `registry.ts`,
    `type_interfaces.ts`).
  - Tests colocated: `*_test.ts` (e.g., `codec_test.ts`).
- `tools/` — Small scripts used for local development or docs.

## Development

- Run tests: `deno task test`
- Coverage (LCOV + HTML): `deno task coverage`
- Lint: `deno task lint`
- Format: `deno task fmt`
- Dev (watch main entry): `deno task dev`

Most NB: `deno task pre-commit` - will run the lint, test and fmt tasks.
Currently you should do run this by hand but we might add a hook for it.

## Testing Guidelines

- Use Deno’s built-in test runner with BDD helpers (`describe/it`) and `expect`
  from `@std/expect`.
- Tests are permission‑free and deterministic (no network/fs access).
- Name tests `file_test.ts` colocated next to the code under `src/`.
- When tests need the public API, import from the entry point:
  - `import { ... } from "../main.ts";`
- Prefer structural/behavioral assertions over implementation details.

## Coding Style

- TypeScript, ESM modules, 2‑space indentation.
- Named exports only; avoid default exports.
- Keep modules focused; avoid tangled cross‑dependencies.
- Add new modules under `src/` and export via `main.ts`.

## Dependencies

- Prefer JSR imports. Add new deps to `deno.json` `imports` and update the lock
  file locally.

## Pull Requests

- Keep PRs small and focused with a clear rationale.
- Include tests for new features and bug fixes.
- Ensure `deno task fmt` and `deno task lint` pass.
