import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";

// Import our codec registry to introspect implemented types
import {
  array,
  blob,
  boolean,
  date,
  enum as enumCodec,
  file,
  literal,
  map,
  nullable,
  nullish,
  number,
  object,
  optional,
  picklist,
  record,
  set,
  string,
  tuple,
  union,
} from "../src/types/index.ts";

function collectImplementedTypes(): Set<string> {
  const types = new Set<string>();
  const modules = [
    array,
    blob,
    boolean,
    date,
    enumCodec,
    file,
    literal,
    map,
    nullable,
    nullish,
    number,
    object,
    optional,
    picklist,
    record,
    set,
    string,
    tuple,
    union,
  ];
  for (const mod of modules) {
    const tn = (mod as { typeName?: unknown }).typeName;
    if (typeof tn === "string") types.add(tn);
  }
  return types;
}

function collectValibotTypes(): Set<string> {
  const types = new Set<string>();
  const IGNORED = new Set<string>([
    "any",
    "unknown",
    "never",
    "await",
    "readonly",
  ]);

  // 1) Zero-arg builders: call and detect `.type` strings
  for (const [_name, exp] of Object.entries(v)) {
    if (typeof exp === "function" && exp.length === 0) {
      try {
        const maybe = (exp as (...args: unknown[]) => unknown)();
        if (maybe && typeof maybe === "object") {
          const kind = (maybe as { kind?: unknown }).kind;
          const t = (maybe as { type?: unknown }).type;
          if (kind === "schema" && typeof t === "string" && !IGNORED.has(t)) {
            types.add(t);
          }
        }
      } catch (_e) {
        // Ignore functions that require params at runtime or throw
        // We only care about schema builders that succeed with zero args
      }
    }
  }

  // 2) Seed common builders that require arguments
  // These ensure we see argument-requiring schema types.
  const samples = [
    v.array(v.string()),
    v.object({ a: v.string() }),
    v.record(v.string(), v.string()),
    v.union([v.string(), v.number()]),
    v.tuple([v.string(), v.number()]),
    v.set(v.string()),
    v.map(v.string(), v.number()),
    v.literal("x"),
    v.picklist(["a", "b"]),
    // enum in Valibot requires an object map of string -> string
    // deno-lint-ignore no-explicit-any
    (v as any).enum({ A: "A", B: "B" }),
    v.optional(v.string()),
    v.nullable(v.string()),
    v.nullish(v.string()),
  ];

  for (const s of samples) {
    const t = (s as { type?: unknown }).type;
    if (typeof t === "string") types.add(t);
  }

  return types;
}

describe("types/parity", () => {
  it("Valibot base types are supported by codecs", () => {
    const implemented = collectImplementedTypes();
    const valibotTypes = collectValibotTypes();

    // New or unknown Valibot types we don't support yet
    const missing = [...valibotTypes].filter((t) => !implemented.has(t)).sort();

    // Helpful assertion for maintenance: Valibot types must be supported
    expect(missing).toEqual([]);
  });
});
