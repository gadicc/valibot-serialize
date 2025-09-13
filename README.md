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

### Supported nodes and flags (AST)

- `string` with:
  - lengths: `minLength`, `maxLength`, exact `length`
  - patterns: `pattern` (+ `patternFlags`), `startsWith`, `endsWith`
  - formats/validators: `email`, `rfcEmail`, `url`, `uuid`, `ip`, `ipv4`, `ipv6`, `hexColor`, `slug`, `digits`, `emoji`, `hexadecimal`, `creditCard`, `imei`, `mac`, `mac48`, `mac64`, `base64`, ids `ulid`, `nanoid`, `cuid2`, ISO time/date variants `isoDate`, `isoDateTime`, `isoTime`, `isoTimeSecond`, `isoTimestamp`, `isoWeek`
  - counters: `minGraphemes`, `maxGraphemes`, `minWords`, `maxWords`
  - transforms: `trim`, `trimStart`, `trimEnd`, `toUpperCase`, `toLowerCase`, `normalize`
- `number` with `min`, `max`, `gt`, `lt`, `integer`, `safeInteger`, `multipleOf`, `finite`
- `boolean`, `literal`
- `array` with `item` + `minLength`, `maxLength`, `length`
- `object` with `entries`, `optionalKeys` hint, `policy` (`loose`/`strict`), `rest`, `minEntries`, `maxEntries`
- `optional`, `nullable`, `nullish`
- `union`, `tuple` (+ `rest`), `record`
- `enum` with `values`
- `set` with `value`, `minSize`, `maxSize`
- `map` with `key`, `value`, `minSize`, `maxSize`
- `date`, `file` (`minSize`, `maxSize`, `mimeTypes`), `blob` (`minSize`, `maxSize`, `mimeTypes`)

### JSON Schema conversion

- `toJsonSchema` converts:
  - Strings to string schemas, mapping common formats and adding regexes for selected validators (see notes).
    - IDs approximated: `ulid`, `nanoid`, `cuid2` via patterns.
    - Validators approximated: `creditCard`, `imei`, `mac`, `mac48`, `mac64`, `base64` via patterns.
  - Numbers, booleans, arrays, objects, tuples, enums, unions, sets/maps (approximate), records (as additionalProperties), date/file/blob as strings (binary for file/blob).
  - Union of literals becomes an `enum`.
- `fromJsonSchema` converts back a subset:
  - `type` string/number/integer/boolean, `const` (`literal`), `enum`, `array`/`object`, `tuple` (`prefixItems`), `union` (`anyOf`), and `anyOf` of constants → `enum`.
  - Recognizes string format/email/uri/uuid/ipv4/ipv6, and common patterns produced by `toJsonSchema` for startsWith/endsWith, `hexColor`, `slug`, `digits`, `hexadecimal`, ids (`ulid`, `nanoid`, `cuid2`) and sets flags accordingly.

## CLI

Convert a serialized AST (read from stdin) to JSON Schema:

```
echo '{"kind":"schema","vendor":"valibot","version":1,"format":1,"node":{"type":"object","entries":{"a":{"type":"string"}},"policy":"strict"}}' \
  | deno task tojson
```

Outputs a JSON Schema for the data shape.

## Notes

- The AST is independent of Valibot internals and versioned (`format: 1`).
- Some validators don’t map cleanly to JSON Schema and are approximated (e.g., word counts, ISO formats, IDs) using patterns.
- Complex constructs (custom transforms/effects) are intentionally unsupported and fail fast on `serialize`.
- `fromJsonSchema` is intentionally minimal and lossy; prefer authoring schemas in Valibot and using `serialize` as the source of truth.

### Compatibility mapping (selected)

| Valibot/AST               | toJsonSchema                           | fromJsonSchema back |
|---------------------------|----------------------------------------|---------------------|
| string.email              | type: string, format: email            | email: true         |
| string.url                | type: string, format: uri              | url: true           |
| string.uuid               | type: string, format: uuid             | uuid: true          |
| string.ipv4/ipv6          | format: ipv4/ipv6                      | ipv4/ipv6: true     |
| string.ip                 | anyOf [ipv4, ipv6]                     | ip: true            |
| string.startsWith/endsWith| pattern/allOf anchored                 | starts/ends: true   |
| string.hexColor           | regex                                  | hexColor: true      |
| string.slug               | regex                                  | slug: true          |
| string.digits/hexadecimal | regex                                  | digits/hexadecimal  |
| ulid/nanoid/cuid2         | regex                                  | flags: true         |
| creditCard/imei/mac/...   | regex                                  | flags: true         |
| number min/max/gt/lt      | min/max/exclusiveMin/Max               | fields restored     |
| array min/max/len         | minItems/maxItems                      | fields restored     |
| object min/max entries    | minProperties/maxProperties            | fields restored     |
| union of literals         | enum                                   | enum node           |
| enum values               | enum                                   | enum node           |
| set/map                   | array uniqueItems / object additional  | approximated        |
| tuple/rest                | prefixItems (+ items/rest)             | fields restored     |
| date                      | string (format: date-time)             | approximated        |
| file/blob                 | string binary (+ mediaType)            | approximated        |

## Development

- `deno task lint`
- `deno task test`
- `deno task fmt`

## License

MIT
