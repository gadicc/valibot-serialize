import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "enum" as const;

export function matchesValibotType(any: { type?: string } & Record<string, unknown>): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === "picklist" || type === "enum";
}

export function encodeEnum(any: Record<string, unknown>): Extract<SchemaNode, { type: "enum" }>{
  const snap = JSON.parse(JSON.stringify(any)) as { options?: unknown[]; enum?: unknown[] };
  const values = (snap.options ?? snap.enum ?? (any as { options?: unknown[] }).options ?? (any as { enum?: unknown[] }).enum) as unknown[] | undefined;
  if (!Array.isArray(values)) throw new Error("Unsupported enum schema: missing options");
  const out: Array<string | number | boolean | null> = [];
  for (const val of values) {
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean" || val === null) out.push(val as never);
    else throw new Error("Unsupported enum value type");
  }
  return { type: "enum", values: out };
}

export function decodeEnum(node: Extract<SchemaNode, { type: "enum" }>): AnySchema {
  const literals = node.values.map((val) => v.literal(val as never));
  return v.union(literals as never);
}

export function enumToCode(node: Extract<SchemaNode, { type: "enum" }>): string {
  const allStrings = node.values.every((v) => typeof v === "string");
  if (allStrings) return `v.picklist(${JSON.stringify(node.values)})`;
  const lits = node.values.map((v) => `v.literal(${JSON.stringify(v)})`).join(",");
  return `v.union([${lits}])`;
}

export function enumToJsonSchema(node: Extract<SchemaNode, { type: "enum" }>): JsonSchema {
  return { enum: node.values.slice() } as JsonSchema;
}

export function enumFromJsonSchema(schema: Record<string, unknown>): Extract<SchemaNode, { type: "enum" }>{
  return { type: "enum", values: (schema as { enum?: unknown[] }).enum as never };
}

// Named export aliases for consistency with module.d.ts
export const encode: Encoder<"enum"> = encodeEnum as never;
export const decode: Decoder<"enum"> = decodeEnum as never;
export const toCode: ToCode<"enum"> = enumToCode as never;
export const toJsonSchema: ToJsonSchema<"enum"> = enumToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = enumFromJsonSchema as never;
