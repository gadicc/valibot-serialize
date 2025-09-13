import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "literal" as const;

export function matchesValibotType(any: { type?: string } & Record<string, unknown>): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeLiteral(any: Record<string, unknown>): Extract<SchemaNode, { type: "literal" }>{
  const snap = JSON.parse(JSON.stringify(any)) as { literal?: unknown; value?: unknown };
  const value = snap.literal ?? snap.value ?? (any as { literal?: unknown; value?: unknown }).literal ?? (any as { value?: unknown }).value;
  if (value === undefined) throw new Error("Unsupported literal schema without value");
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return { type: "literal", value };
  }
  throw new Error("Only JSON-serializable literal values are supported");
}

export function decodeLiteral(node: Extract<SchemaNode, { type: "literal" }>): AnySchema {
  return v.literal(node.value as never);
}

export function literalToCode(node: Extract<SchemaNode, { type: "literal" }>): string {
  return `v.literal(${lit(node.value)})`;
}

export function literalToJsonSchema(node: Extract<SchemaNode, { type: "literal" }>): JsonSchema {
  return { const: node.value } as JsonSchema;
}

export function literalFromJsonSchema(schema: Record<string, unknown>): Extract<SchemaNode, { type: "literal" }>{
  return { type: "literal", value: (schema as { const?: unknown }).const as never };
}

// Named export aliases for consistency with module.d.ts
export const encode: Encoder<"literal"> = encodeLiteral as never;
export const decode: Decoder<"literal"> = decodeLiteral as never;
export const toCode: ToCode<"literal"> = literalToCode as never;
export const toJsonSchema: ToJsonSchema<"literal"> = literalToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = literalFromJsonSchema as never;

function lit(vl: unknown): string {
  switch (typeof vl) {
    case "string":
      return JSON.stringify(vl);
    case "number":
      return Number.isFinite(vl as number) ? String(vl) : "null";
    case "boolean":
      return (vl as boolean) ? "true" : "false";
    case "object":
      return vl === null ? "null" : JSON.stringify(vl);
    default:
      return JSON.stringify(vl);
  }
}
