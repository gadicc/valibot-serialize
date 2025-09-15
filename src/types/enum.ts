import * as v from "@valibot/valibot";
import type { BaseNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  MatchesJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "enum" as const;

// Serialized node shape for "enum"
export interface EnumNode extends BaseNode<typeof typeName> {
  values: Array<string | number | boolean | null>;
}

export const matches: Matches = (any: AnySchema): boolean => {
  const type = (any as { type?: string }).type;
  return type === "enum";
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  const en = (schema as { enum?: unknown[] }).enum;
  if (Array.isArray(en)) return en.some((x) => typeof x !== "string");
  const anyOf = (schema as { anyOf?: Array<Record<string, unknown>> }).anyOf;
  if (!Array.isArray(anyOf)) return false;
  return (
    anyOf.length > 0 &&
    anyOf.every((i) => i.const !== undefined) &&
    anyOf.some((i) => typeof i.const !== "string")
  );
};

export const encode: Encoder<EnumNode> = function encodeEnum(
  any,
): EnumNode {
  const snap = JSON.parse(JSON.stringify(any)) as {
    options?: unknown[];
    enum?: unknown[];
    type?: string;
  };
  const values =
    (snap.options ?? snap.enum ?? (any as { options?: unknown[] }).options ??
      (any as { enum?: unknown[] }).enum) as unknown[] | undefined;
  if (!Array.isArray(values)) {
    throw new Error("Unsupported enum schema: missing options");
  }
  const out: Array<string | number | boolean | null> = [];
  for (const val of values) {
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean" || val === null) {
      out.push(val as never);
    } else throw new Error("Unsupported enum value type");
  }
  return { type: typeName, values: out };
};

export const decode: Decoder<EnumNode> = function decodeEnum(node): AnySchema {
  const allStrings = node.values.every((val) => typeof val === "string");
  if (allStrings) {
    const mapping = Object.fromEntries(
      (node.values as string[]).map((s) => [s, s] as const),
    );
    // deno-lint-ignore no-explicit-any
    return (v as any).enum(mapping);
  }
  // Fallback: union of literals
  const literals = node.values.map((val) => v.literal(val as never));
  return v.union(literals as never);
};

export const toCode: ToCode<EnumNode> = function enumToCode(node): string {
  const allStrings = node.values.every((v) => typeof v === "string");
  if (allStrings) {
    const mapping = Object.fromEntries(
      (node.values as string[]).map((s) => [s, s] as const),
    );
    return `v.enum(${JSON.stringify(mapping)})`;
  }
  const lits = node.values.map((v) => `v.literal(${JSON.stringify(v)})`).join(
    ",",
  );
  return `v.union([${lits}])`;
};

export const toJsonSchema: ToJsonSchema<EnumNode> = function enumToJsonSchema(
  node,
): JsonSchema {
  return { enum: node.values.slice() } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function enumFromJsonSchema(
  schema,
): EnumNode {
  if (Array.isArray((schema as { enum?: unknown[] }).enum)) {
    return {
      type: typeName,
      values: (schema as { enum: unknown[] }).enum as never,
    };
  }
  const anyOf = (schema as { anyOf?: Array<Record<string, unknown>> }).anyOf;
  if (Array.isArray(anyOf) && anyOf.length > 0) {
    const vals = anyOf.map((i) => (i.const as unknown)) as Array<
      string | number | boolean | null
    >;
    return { type: typeName, values: vals } as never;
  }
  return { type: typeName, values: [] } as never;
};
