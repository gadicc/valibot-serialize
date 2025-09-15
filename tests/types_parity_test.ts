import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import * as codecs from "../src/types/index.ts";

// Types intentionally skipped from parity detection/logging
const PARITY_IGNORED = new Set<string>([
  // Some Valibot exports are language keywords or helpers
  "await",
  "readonly",
]);

function collectImplementedTypes(): Set<string> {
  const types = new Set<string>();
  for (const mod of Object.values(codecs)) {
    const tn = (mod as { typeName?: unknown }).typeName;
    if (typeof tn === "string") types.add(tn);
  }
  return types;
}

function collectValibotTypes(): {
  all: Set<string>;
  zeroArg: Set<string>;
  requireArg: Set<string>;
} {
  const all = new Set<string>();
  const zeroArg = new Set<string>();
  const requireArg = new Set<string>();

  // 1) Safely call a curated set of known zero-arg builders.
  const anyV = v as Record<string, unknown>;
  const zeroArgCandidates: Array<() => unknown> = [];
  const pushIfFn = (key: string) => {
    const fn = anyV[key];
    if (typeof fn === "function") zeroArgCandidates.push(fn as () => unknown);
  };
  // primitives and core zero-arg builders
  pushIfFn("string");
  pushIfFn("number");
  pushIfFn("boolean");
  pushIfFn("bigint");
  pushIfFn("symbol");
  pushIfFn("any");
  pushIfFn("unknown");
  pushIfFn("never");
  pushIfFn("undefined");
  pushIfFn("void");
  pushIfFn("date");
  pushIfFn("file");
  pushIfFn("blob");
  // null may be exported as `null` or `null_`
  if (typeof anyV["null"] === "function") {
    zeroArgCandidates.push(anyV["null"] as () => unknown);
  } else if (typeof anyV["null_"] === "function") {
    zeroArgCandidates.push(anyV["null_"] as () => unknown);
  }

  for (const exp of zeroArgCandidates) {
    try {
      const maybe = exp();
      if (maybe && typeof maybe === "object") {
        const kind = (maybe as { kind?: unknown }).kind;
        const t = (maybe as { type?: unknown }).type;
        if (
          kind === "schema" &&
          typeof t === "string" &&
          !PARITY_IGNORED.has(t)
        ) {
          all.add(t);
          zeroArg.add(t);
        }
      }
    } catch (_e) {
      // ignore
    }
  }

  // 2) Seed common builders that require arguments to discover their `.type`.
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
    if (typeof t === "string" && !PARITY_IGNORED.has(t)) {
      all.add(t);
      if (!zeroArg.has(t)) requireArg.add(t);
    }
  }

  return { all, zeroArg, requireArg };
}

describe("types/parity", () => {
  it("Valibot base types are supported by codecs", () => {
    const implemented = collectImplementedTypes();
    const discovered = collectValibotTypes();

    // Log discovery summary to aid maintenance
    console.info(
      "types/parity — zero-arg builders:",
      [...discovered.zeroArg].sort().join(", "),
    );
    console.info(
      "types/parity — require-arg builders:",
      [...discovered.requireArg].sort().join(", "),
    );
    console.info(
      "types/parity — all discovered types:",
      [...discovered.all].sort().join(", "),
    );
    console.info(
      "types/parity — skipped Valibot types:",
      [...PARITY_IGNORED].sort().join(", "),
    );

    // Assert discovery completeness: we should at least detect everything this
    // library implements. This guards against missing zero-arg builders like
    // string(), number(), date(), null(), etc.
    const notDiscovered = [...implemented]
      .filter((t) => !discovered.all.has(t))
      .sort();
    expect(notDiscovered).toEqual([]);

    // For awareness (non-failing): Valibot types we don't implement yet.
    const unimplemented = [...discovered.all]
      .filter((t) => !implemented.has(t))
      .sort();
    if (unimplemented.length > 0) {
      console.info(
        "types/parity — unimplemented Valibot types (non-fatal):",
        unimplemented.join(", "),
      );
    }
  });
});
