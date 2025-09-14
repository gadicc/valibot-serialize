# valibot-serialize

A tiny library to serialize Valibot schemas into a stable, vendor/versioned AST,
and to decode them back. It also includes helpers to export a JSON Schema (Draft
2020‑12) for the data that a schema validates.

Copyright (c) 2025 by Gadi Cohen. [MIT licensed](./LICENSE.txt).

Badges TBD.

## Quick Start

```ts
import * as v from "@valibot/valibot";
import { deserialize, serialize, toCode } from "valibot-serialize";

const LoginSchema = v.object({
  email: v.string(),
  password: v.string(),
});

const serialized = serialize(LoginSchema);
const NewLoginSchema = deserialize(serialized);

// { email: 'jane@example.com', password: '12345678' }
const parsed = v.parse(NewLoginSchema, {
  email: "hello@example.com",
  password: "password",
});
```

### Generate Builder Code

`toCode(serialized: SerializedSchema): string` returns compact Valibot builder
code that reconstructs the schema (assumes `v` is in scope):

```ts
import * as v from "@valibot/valibot";
import { serialize, toCode } from "valibot-serialize";

const schema = v.object({ email: v.string(), password: v.string() });
const code = toCode(serialize(schema));
// "v.object({email:v.string(),password:v.string()});"

// You can eval it if you want a runtime instance:
const factory = new Function("v", "return " + code) as (
  vx: typeof v,
) => unknown;
const rebuilt = factory(v);
```

## Motivation

I use [`drizzle-valibot`](http://npmjs.com/package/drizzle-valibot) to create
validation schemas (valibot) from my database schemas (drizzle-orm /
postgresql), which works great, but, sometimes I want them on the client side
too without bundling `drizzle` and `pg`. This way, we can use a small script to
create dep-free versions of those schemas.

## Relevant issues / discussions on valibot repo:

- [Issue #30: Allow schema serialization](https://github.com/fabian-hiller/valibot/issues/30)
- [Discussion #733: Can you generate a schema from the Reflection API?](https://github.com/fabian-hiller/valibot/discussions/733)
-

## API

- `serialize(schema: v.BaseSchema): SerializedSchema`
  - Encodes a Valibot schema to a JSON‑serializable AST with
    `{ kind, vendor, version, format, node }`.
- `deserialize(data: SerializedSchema): v.BaseSchema`
  - Decodes the AST back to a Valibot schema.
- `isSerializedSchema(x: unknown): x is SerializedSchema`
  - Runtime type guard for the AST envelope.
- `serializedSchemaJson`
  - JSON Schema for the AST envelope and node variants (useful to validate
    serialized payloads).
- `toJsonSchema(serialized: SerializedSchema): JsonSchema`
  - Best‑effort conversion from our AST to JSON Schema (Draft 2020‑12) for data
    validation.
- `fromJsonSchema(json: JsonSchemaLike): SerializedSchema`
  - Basic, lossy converter from a subset of JSON Schema → our AST
    (strings/numbers/booleans/literals/arrays/objects/enums/unions/tuples/sets/maps
    approximations).
- `toCode(serialized: SerializedSchema): string`
  - Emits concise Valibot builder code for the given AST (no imports), ending
    with a semicolon. Intended for code‑gen/export; format it as you like.

### Supported nodes and flags (AST)

- `string` with:
  - lengths: `minLength`, `maxLength`, exact `length`
  - patterns: `pattern` (+ `patternFlags`), `startsWith`, `endsWith`
  - formats/validators: `email`, `rfcEmail`, `url`, `uuid`, `ip`, `ipv4`,
    `ipv6`, `hexColor`, `slug`, `digits`, `emoji`, `hexadecimal`, `creditCard`,
    `imei`, `mac`, `mac48`, `mac64`, `base64`, ids `ulid`, `nanoid`, `cuid2`,
    ISO time/date variants `isoDate`, `isoDateTime`, `isoTime`, `isoTimeSecond`,
    `isoTimestamp`, `isoWeek`
  - counters: `minGraphemes`, `maxGraphemes`, `minWords`, `maxWords`
  - transforms: `trim`, `trimStart`, `trimEnd`, `toUpperCase`, `toLowerCase`,
    `normalize`
- `number` with `min`, `max`, `gt`, `lt`, `integer`, `safeInteger`,
  `multipleOf`, `finite`
- `boolean`, `literal`
- `array` with `item` + `minLength`, `maxLength`, `length`
- `object` with `entries`, `optionalKeys` hint, `policy` (`loose`/`strict`),
  `rest`, `minEntries`, `maxEntries`
- `optional`, `nullable`, `nullish`
- `union`, `tuple` (+ `rest`), `record`
- `enum` with `values`
- `set` with `value`, `minSize`, `maxSize`
- `map` with `key`, `value`, `minSize`, `maxSize`
- `date`, `file` (`minSize`, `maxSize`, `mimeTypes`), `blob` (`minSize`,
  `maxSize`, `mimeTypes`)

### JSON Schema conversion

- `toJsonSchema` converts:
  - Strings to string schemas, mapping common formats and adding regexes for
    selected validators (see notes).
    - IDs approximated: `ulid`, `nanoid`, `cuid2` via patterns.
    - Validators approximated: `creditCard`, `imei`, `mac`, `mac48`, `mac64`,
      `base64` via patterns.
  - Numbers, booleans, arrays, objects, tuples, enums, unions, sets/maps
    (approximate), records (as additionalProperties), date/file/blob as strings
    (binary for file/blob).
  - Union of literals becomes an `enum`.
- `fromJsonSchema` converts back a subset:
  - `type` string/number/integer/boolean, `const` (`literal`), `enum`,
    `array`/`object`, `tuple` (`prefixItems`), `union` (`anyOf`), and `anyOf` of
    constants → `enum`.
  - Recognizes string format/email/uri/uuid/ipv4/ipv6, and common patterns
    produced by `toJsonSchema` for startsWith/endsWith, `hexColor`, `slug`,
    `digits`, `hexadecimal`, ids (`ulid`, `nanoid`, `cuid2`) and sets flags
    accordingly.

## CLI

Convert a serialized AST (read from stdin) to JSON Schema:

```
echo '{"kind":"schema","vendor":"valibot","version":1,"format":1,"node":{"type":"object","entries":{"a":{"type":"string"}},"policy":"strict"}}' \
  | deno task tojson
```

Outputs a JSON Schema for the data shape.

Generate Valibot builder code from a serialized AST (read from stdin):

```
echo '{"kind":"schema","vendor":"valibot","version":1,"format":1,"node":{"type":"object","entries":{"email":{"type":"string"},"password":{"type":"string"}}}}' \
  | deno task tocode
```

Outputs:

```
v.object({email:v.string(),password:v.string()});
```

## Notes

- The AST is independent of Valibot internals and versioned (`format: 1`).
- Some validators don’t map cleanly to JSON Schema and are approximated (e.g.,
  word counts, ISO formats, IDs) using patterns.
- Complex constructs (custom transforms/effects) are intentionally unsupported
  and fail fast on `serialize`.
- `fromJsonSchema` is intentionally minimal and lossy; prefer authoring schemas
  in Valibot and using `serialize` as the source of truth.

### Compatibility mapping (selected)

| Valibot/AST                | toJsonSchema                          | fromJsonSchema back |
| -------------------------- | ------------------------------------- | ------------------- |
| string.email               | type: string, format: email           | email: true         |
| string.url                 | type: string, format: uri             | url: true           |
| string.uuid                | type: string, format: uuid            | uuid: true          |
| string.ipv4/ipv6           | format: ipv4/ipv6                     | ipv4/ipv6: true     |
| string.ip                  | anyOf [ipv4, ipv6]                    | ip: true            |
| string.startsWith/endsWith | pattern/allOf anchored                | starts/ends: true   |
| string.hexColor            | regex                                 | hexColor: true      |
| string.slug                | regex                                 | slug: true          |
| string.digits/hexadecimal  | regex                                 | digits/hexadecimal  |
| ulid/nanoid/cuid2          | regex                                 | flags: true         |
| creditCard/imei/mac/...    | regex                                 | flags: true         |
| number min/max/gt/lt       | min/max/exclusiveMin/Max              | fields restored     |
| array min/max/len          | minItems/maxItems                     | fields restored     |
| object min/max entries     | minProperties/maxProperties           | fields restored     |
| union of literals          | enum                                  | enum node           |
| enum values                | enum                                  | enum node           |
| set/map                    | array uniqueItems / object additional | approximated        |
| tuple/rest                 | prefixItems (+ items/rest)            | fields restored     |
| date                       | string (format: date-time)            | approximated        |
| file/blob                  | string binary (+ mediaType)           | approximated        |

## Development

- `deno task lint`
- `deno task test`
- `deno task fmt`

See CONTRIBUTING.md for project layout, test naming, and workflow conventions.

### Developer Notes

- Internal registry lives at `src/types/lib/registry.ts` and wires codecs from
  `src/types/*`.
- Converter modules live under `src/converters/`: `encode.ts`, `decode.ts`,
  `to_code.ts`, `to_jsonschema.ts`, `from_jsonschema.ts`.
- Each `src/types/<name>.ts` module exports a consistent API:
  - `typeName`, `matchesValibotType`, `encode`, `decode`, `toCode`,
    `toJsonSchema`, `fromJsonSchema`.
  - The common function shapes are defined in
    `src/types/lib/type_interfaces.ts`.
- Ambient module typings for `src/types/*` are in `src/type-mod.d.ts`.
- For convenience, `src/types/index.ts` re-exports each type module as a
  namespace (e.g., `string`, `number`, ...). Example usage in internal tooling:
  `import { string as stringMod } from "./src/types/index.ts"`.

- Directory policy: the `src/types/` folder only contains the individual type
  modules and a single `index.ts` that re-exports them. Shared helpers live in
  `src/util/`, and type-specific shared plumbing (like the codec registry and
  interfaces) live in `src/types/lib/`.

## License

MIT
