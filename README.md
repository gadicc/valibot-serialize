# valibot-serialize

A tiny library to serialize Valibot schemas into a stable, vendor/versioned AST, and to decode them back. It also includes helpers to export a JSON Schema (Draft 2020‑12) for the data that a schema validates.

## Install

This project is built for Deno/JSR and uses Valibot from JSR.

## API

- `serialize(schema: v.BaseSchema): SerializedSchema`
  - Encodes a Valibot schema to a JSON‑serializable AST with `{ kind, vendor, version, format, node }`.
- `deserialize(data: SerializedSchema): v.BaseSchema`
  - Decodes the AST back to a Valibot schema.
- `isSerializedSchema(x: unknown): x is SerializedSchema`
  - Runtime type guard for the AST envelope.
- `serializedSchemaJson`
  - JSON Schema for the AST envelope and node variants (useful to validate serialized payloads).
- `toJsonSchema(serialized: SerializedSchema): JsonSchema`
  - Best‑effort conversion from our AST to JSON Schema (Draft 2020‑12) for data validation.
- `fromJsonSchema(json: JsonSchemaLike): SerializedSchema`
  - Basic, lossy converter from a subset of JSON Schema → our AST (strings/numbers/booleans/literals/arrays/objects/enums/unions/tuples/sets/maps approximations).

## CLI

Convert a serialized AST (read from stdin) to JSON Schema:

```
echo '{"kind":"schema","vendor":"valibot","version":1,"format":1,"node":{"type":"object","entries":{"a":{"type":"string"}},"policy":"strict"}}' \
  | deno task tojson
```

Outputs a JSON Schema for the data shape.

## Notes

- The AST is independent of Valibot internals and versioned (`format: 1`).
- Some validators don’t map cleanly to JSON Schema and are approximated (e.g., word counts, ISO formats) using patterns.
- Complex constructs (custom transforms/effects) are intentionally unsupported and fail fast on `serialize`.
- `fromJsonSchema` is intentionally minimal and lossy; prefer authoring schemas in Valibot and using `serialize` as the source of truth.

## Development

- `deno task lint`
- `deno task test`
- `deno task fmt`

## License

MIT

