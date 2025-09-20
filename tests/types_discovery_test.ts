import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { e2eCheck } from "./e2e/_common.ts";
import * as codecs from "../src/types/index.ts";

interface SchemaDiscovery {
  builders: string[];
  type: string;
  isAsync: boolean;
  reference?: string;
}

type GenericFunction = (...args: unknown[]) => unknown;

type AnySchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

const ANY_VALIBOT = v as Record<string, unknown>;

function callSchema(name: string, ...args: unknown[]): AnySchema {
  const fn = ANY_VALIBOT[name];
  if (typeof fn !== "function") {
    throw new Error(`Valibot builder "${name}" not found`);
  }
  return (fn as (...innerArgs: unknown[]) => AnySchema)(...args);
}

const TYPE_SAMPLE_FACTORIES = new Map<string, () => AnySchema>([
  ["any", () => v.any()],
  ["array", () => v.array(v.string())],
  ["bigint", () => v.bigint()],
  ["blob", () => v.blob()],
  ["boolean", () => v.boolean()],
  ["date", () => v.date()],
  ["exact_optional", () => v.exactOptional(v.string(), "default")],
  [
    "enum",
    () => {
      if (typeof ANY_VALIBOT["enum"] === "function") {
        return callSchema("enum", { A: "A", B: "B" });
      }
      return callSchema("enum_", { A: "A", B: "B" });
    },
  ],
  ["function", () => v.function()],
  ["file", () => v.file()],
  ["intersect", () =>
    v.intersect([
      v.object({ a: v.string() }),
      v.object({ b: v.number() }),
    ])],
  ["literal", () => v.literal("x")],
  ["loose_object", () => v.looseObject({ a: v.string() })],
  ["loose_tuple", () => v.looseTuple([v.string()])],
  ["map", () => v.map(v.string(), v.number())],
  ["nan", () => v.nan()],
  ["never", () => v.never()],
  [
    "null",
    () => {
      if (typeof ANY_VALIBOT["null"] === "function") {
        return callSchema("null");
      }
      return callSchema("null_");
    },
  ],
  ["nullable", () => v.nullable(v.string())],
  ["nullish", () => v.nullish(v.string())],
  ["non_nullable", () => v.nonNullable(v.string())],
  ["non_nullish", () => v.nonNullish(v.string())],
  ["non_optional", () => v.nonOptional(v.string())],
  ["number", () => v.number()],
  ["object", () => v.object({ a: v.string() })],
  ["object_with_rest", () => v.objectWithRest({ a: v.string() }, v.number())],
  ["optional", () => v.optional(v.string())],
  ["picklist", () => v.picklist(["a", "b"])],
  ["promise", () => v.promise()],
  ["record", () => v.record(v.string(), v.number())],
  ["set", () => v.set(v.string())],
  ["strict_object", () => v.strictObject({ a: v.string() })],
  ["strict_tuple", () => v.strictTuple([v.string()])],
  ["string", () => v.string()],
  ["symbol", () => v.symbol()],
  ["tuple", () => v.tuple([v.string(), v.number()])],
  ["tuple_with_rest", () => v.tupleWithRest([v.string()], v.number())],
  ["union", () => v.union([v.string(), v.number()])],
  ["unknown", () => v.unknown()],
  ["void", () => v.void()],
  [
    "undefined",
    () => {
      if (typeof ANY_VALIBOT["undefined"] === "function") {
        return callSchema("undefined");
      }
      return callSchema("undefined_");
    },
  ],
  ["undefinedable", () => v.undefinedable(v.number(), 123)],
  ["variant", () =>
    v.variant("kind", [
      v.object({ kind: v.literal("A"), value: v.string() }),
      v.object({ kind: v.literal("B"), value: v.number() }),
    ])],
]);

const SCHEMA_PATTERN = /kind:\s*["'`]schema["'`]/;
const TYPE_PATTERN = /type:\s*["'`]([^"'`]+)/;
const ASYNC_PATTERN = /async:\s*(true|false)/;
const REFERENCE_PATTERN = /reference:\s*([A-Za-z0-9_]+)/;

function collectImplementedTypes(): Set<string> {
  const types = new Set<string>();
  for (const mod of Object.values(codecs)) {
    const tn = (mod as { typeName?: unknown }).typeName;
    if (typeof tn === "string") types.add(tn);
    const extras = (mod as { supportedTypes?: unknown }).supportedTypes;
    if (Array.isArray(extras)) {
      for (const extra of extras) {
        if (typeof extra === "string") types.add(extra);
      }
    }
  }
  return types;
}

function discoverValibotSchemas(
  mod: Record<string, unknown>,
): SchemaDiscovery[] {
  const functionEntries = new Map<GenericFunction, string[]>();

  for (const [name, value] of Object.entries(mod)) {
    if (typeof value !== "function") continue;
    const fn = value as GenericFunction;
    const existing = functionEntries.get(fn);
    if (existing) {
      existing.push(name);
    } else {
      functionEntries.set(fn, [name]);
    }
  }

  const discoveries: SchemaDiscovery[] = [];

  for (const [fn, names] of functionEntries.entries()) {
    let source: string;
    try {
      source = Function.prototype.toString.call(fn);
    } catch (_error) {
      continue; // skip functions that cannot be stringified (should be rare)
    }

    const schemaIndex = source.search(SCHEMA_PATTERN);
    if (schemaIndex === -1) continue;

    const slice = source.slice(schemaIndex);
    const typeMatch = TYPE_PATTERN.exec(slice);
    if (!typeMatch) continue;

    const asyncMatch = ASYNC_PATTERN.exec(slice);
    const referenceMatch = REFERENCE_PATTERN.exec(slice);

    const isAsync = (asyncMatch?.[1] ?? "false") === "true";

    discoveries.push({
      builders: [...names].sort(),
      type: typeMatch[1],
      isAsync,
      reference: referenceMatch?.[1],
    });
  }

  discoveries.sort((left, right) => left.type.localeCompare(right.type));
  return discoveries;
}

async function fetchSchemaDocs(url: string): Promise<Set<string> | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `types/discovery — skipped docs check: HTTP ${response.status}`,
      );
      return null;
    }
    const html = await response.text();
    const start = html.indexOf('<h2 id="schemas"');
    if (start === -1) {
      console.warn("types/discovery — skipped docs check: no schemas heading");
      return null;
    }
    const end = html.indexOf('<h2 id="methods"', start + 1);
    const section = end === -1 ? html.slice(start) : html.slice(start, end);
    const matches = section.matchAll(/href="\/api\/([^/]+)\//g);
    const schemas = new Set<string>();
    for (const match of matches) {
      schemas.add(match[1]);
    }
    if (schemas.size === 0) {
      console.warn("types/discovery — skipped docs check: no schema links");
      return null;
    }
    return schemas;
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    console.warn(
      `types/discovery — skipped docs check: ${message}`,
    );
    return null;
  }
}

describe("types/discovery", () => {
  it("discovers Valibot schema builders via source inspection", () => {
    const discoveries = discoverValibotSchemas(v);

    expect(discoveries.length).toBeGreaterThan(0);

    const typeToBuilders = new Map<string, Map<string, boolean>>();
    const referenceMismatches: Array<
      { type: string; builders: string[]; reference?: string }
    > = [];

    for (const discovery of discoveries) {
      const builderMap = typeToBuilders.get(discovery.type) ??
        new Map<string, boolean>();
      for (const name of discovery.builders) {
        builderMap.set(name, discovery.isAsync);
      }
      typeToBuilders.set(discovery.type, builderMap);

      if (
        discovery.reference &&
        !discovery.builders.includes(discovery.reference)
      ) {
        referenceMismatches.push({
          type: discovery.type,
          builders: discovery.builders,
          reference: discovery.reference,
        });
      }
    }

    const sortedTypes = [...typeToBuilders.keys()].sort();
    const summary = sortedTypes.map((type) => {
      const builders = [...(typeToBuilders.get(type)?.entries() ?? [])]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, isAsync]) => (isAsync ? `${name} (async)` : name));
      return { type, builders };
    });

    console.info(
      "types/discovery — discovered schema types:",
      summary.map((entry) => `${entry.type} [${entry.builders.join(", ")}]`)
        .join("; "),
    );
    console.info("types/discovery — total schema types:", summary.length);
    console.info(
      "types/discovery — total builder functions:",
      discoveries.length,
    );

    expect(referenceMismatches).toEqual([]);
  });

  const docsCheckEnabled = (() => {
    try {
      return Deno.env.get("VALIBOT_DOCS_CHECK") === "1";
    } catch (_error) {
      return false;
    }
  })();

  if (docsCheckEnabled) {
    it("matches schemas listed in the Valibot docs (best effort)", async () => {
      const discoveries = discoverValibotSchemas(v);
      const builderNames = new Set<string>();
      for (const discovery of discoveries) {
        for (const name of discovery.builders) builderNames.add(name);
      }

      const docsSchemas = await fetchSchemaDocs("https://valibot.dev/api/");
      if (!docsSchemas) {
        return;
      }

      const missing = [...docsSchemas]
        .filter((name) => !builderNames.has(name))
        .sort();

      console.info(
        "types/discovery — docs schemas discovered:",
        [...docsSchemas].sort().join(", "),
      );
      console.info(
        "types/discovery — docs schema count:",
        docsSchemas.size,
      );

      console.info(
        "types/discovery — docs schemas missing builders:",
        missing.join(", ") || "none",
      );

      expect(missing).toEqual([]);
    });
  } else {
    it.ignore(
      "matches schemas listed in the Valibot docs (best effort)",
      () => {},
    );
  }
});

describe("types/discovery e2e", () => {
  const discoveries = discoverValibotSchemas(v);
  const implemented = collectImplementedTypes();
  const uniqueTypes = [...new Set(discoveries.map((d) => d.type))].sort();

  const missingFactories: string[] = [];
  const notImplemented: string[] = [];

  for (const type of uniqueTypes) {
    const factory = TYPE_SAMPLE_FACTORIES.get(type);
    const testName = `schema type: ${type}`;

    if (!factory) {
      missingFactories.push(type);
      it.ignore(`${testName} (no sample factory)`, () => {});
      continue;
    }

    if (!implemented.has(type)) {
      notImplemented.push(type);
      it.ignore(`${testName} (not implemented)`, () => {});
      continue;
    }

    it(testName, async () => {
      await e2eCheck(factory(), { checkJsonSchema: false });
    });
  }

  if (missingFactories.length > 0) {
    console.info(
      "types/discovery — sample factories missing:",
      missingFactories.join(", "),
    );
  }

  if (notImplemented.length > 0) {
    console.info(
      "types/discovery — e2e skipped (not implemented):",
      notImplemented.join(", "),
    );
  }
});
