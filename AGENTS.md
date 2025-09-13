# Repository Guidelines

## Project Structure & Module Organization
- `main.ts`: Library entry for Valibot schema (de)serialization.
- `main_test.ts`: BDD tests using `@std/testing` and `@std/expect`.
- `deno.json`/`deno.lock`: Tasks, import mappings, and locked deps (JSR).
- `.vscode/`: Editor settings for Deno, linting, and formatting.
- Add new modules as `.ts` files in the repo root or a folder you create (e.g., `src/`) and export via clear entry points.

## Build, Test, and Development Commands
- `deno task dev` — Run locally with file watching (`main.ts`).
- `deno task test` — Run all tests.
- `deno task lint` — Static analysis via Deno Lint.
- `deno task fmt` — Format the codebase with Deno Fmt.
- Examples: `deno test main_test.ts`, `deno test --coverage=coverage && deno coverage coverage --lcov > coverage.lcov`.

## Coding Style & Naming Conventions
- TypeScript, ESM modules, 2‑space indentation.
- Files: lowercase, concise names (e.g., `main.ts`, `schema_utils.ts`).
- Exports: favor named exports; avoid default exports.
- Identifiers: `camelCase` for functions/vars, `PascalCase` for types/interfaces.
- Use `deno.json` import aliases; add new dependencies to `imports` and lock them.
- Formatting and linting are enforced by `deno fmt` and `deno lint`.

## Testing Guidelines
- Use Deno’s built‑in test runner with BDD utilities: `describe/it` and `expect` from the standard library.
- Name tests `*_test.ts` beside the source.
- Keep tests deterministic and permission‑free (no network/fs). Aim for meaningful coverage.
- Run full suite with `deno task test`; add focused tests for new behavior.

## Commit & Pull Request Guidelines
- Commits: short, imperative subject; explain rationale in the body when needed.
- Prefer small, focused PRs. Include:
  - What changed and why
  - Linked issues (e.g., `Closes #123`)
  - Tests or screenshots/logs when applicable
- Ensure `deno task lint` and `deno task fmt` pass; include tests for new features and bug fixes.

## Security & Configuration Tips
- Keep the library side‑effect free; avoid runtime permissions.
- Prefer JSR imports; do not introduce `package.json` or Node‑specific tooling.
- Update `deno.lock` by running tasks locally when dependencies change.
