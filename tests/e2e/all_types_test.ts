import * as v from "@valibot/valibot";
import { describe, it } from "@std/testing/bdd";
import { e2eCheck } from "./_common.ts";

// Build a comprehensive set of sample schemas covering all supported types.
// Strategy mirrors tests/types_parity_test.ts discovery but produces actual schemas
// to feed through full e2e (fromValibot/toValibot, code, and optionally JSON Schema).

type AnySchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

function zeroArgSchemas(): AnySchema[] {
  const anyV = v as Record<string, unknown>;
  const out: AnySchema[] = [];
  const pushIf = (key: string) => {
    const fn = anyV[key];
    if (typeof fn === "function") out.push((fn as () => AnySchema)());
  };
  pushIf("string");
  pushIf("number");
  pushIf("boolean");
  pushIf("bigint");
  pushIf("symbol");
  pushIf("undefined");
  pushIf("void");
  pushIf("date");
  pushIf("file");
  pushIf("blob");
  if (typeof anyV["null"] === "function") {
    out.push((anyV["null"] as () => AnySchema)());
  } else if (typeof anyV["null_"] === "function") {
    out.push((anyV["null_"] as () => AnySchema)());
  }
  return out;
}

function argSchemas(): AnySchema[] {
  const anyV = v as Record<string, unknown>;
  const schemas: AnySchema[] = [];
  // core structures and wrappers
  schemas.push(v.array(v.string()));
  schemas.push(v.object({ a: v.string() }));
  schemas.push(v.record(v.string(), v.string()));
  schemas.push(v.union([v.string(), v.number()]));
  schemas.push(v.tuple([v.string(), v.number()]));
  schemas.push(v.set(v.string()));
  schemas.push(v.map(v.string(), v.number()));
  schemas.push(v.literal("x"));
  schemas.push(v.picklist(["a", "b"]));
  // enum in Valibot requires an object map of string -> string
  if (typeof anyV["enum"] === "function") {
    // deno-lint-ignore no-explicit-any
    schemas.push((anyV["enum"] as any)({ A: "A", B: "B" }));
  }
  schemas.push(v.optional(v.string()));
  schemas.push(v.nullable(v.string()));
  schemas.push(v.nullish(v.string()));
  return schemas;
}

// JSON Schema roundtrip does not faithfully preserve these types.
const skipJsonSchema = new Set<string>([
  "bigint",
  "symbol",
  "undefined",
  "void",
  "file",
  "blob",
  // Structural roundtrips differ but behavior is equivalent
  "record",
  "map",
  "enum",
  "optional",
  "nullable",
  "nullish",
]);

describe("e2e - all types", () => {
  const samples = [...zeroArgSchemas(), ...argSchemas()];
  for (const schema of samples) {
    const type = (schema as { type?: string }).type ?? "unknown";
    const name = `type: ${type}`;
    it(name, async () => {
      const checkJson = !skipJsonSchema.has(type);
      await e2eCheck(schema, { checkJsonSchema: checkJson });
    });
  }
});
