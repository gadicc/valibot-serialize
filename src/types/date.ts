import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "date" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeDate(_any: Record<string, unknown>): Extract<SchemaNode, { type: "date" }>{
  return { type: "date" };
}

export function decodeDate(_node: Extract<SchemaNode, { type: "date" }>): AnySchema {
  return v.date();
}

export function dateToCode(_node: Extract<SchemaNode, { type: "date" }>): string {
  return "v.date()";
}

export function dateToJsonSchema(_node: Extract<SchemaNode, { type: "date" }>): JsonSchema {
  // Represent as RFC3339 string format
  return { type: "string", format: "date-time" } as JsonSchema;
}

export function dateFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "date" }>{
  return { type: "date" };
}

// Named export aliases for consistency with module.d.ts
export const encode: Encoder<"date"> = encodeDate as never;
export const decode: Decoder<"date"> = decodeDate as never;
export const toCode: ToCode<"date"> = dateToCode as never;
export const toJsonSchema: ToJsonSchema<"date"> = dateToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = dateFromJsonSchema as never;
