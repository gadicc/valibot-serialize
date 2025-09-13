import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "boolean" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeBoolean(_any: Record<string, unknown>): Extract<SchemaNode, { type: "boolean" }>{
  return { type: "boolean" };
}

export function decodeBoolean(_node: Extract<SchemaNode, { type: "boolean" }>): AnySchema {
  return v.boolean();
}

export function booleanToCode(_node: Extract<SchemaNode, { type: "boolean" }>): string {
  return "v.boolean()";
}

export function booleanToJsonSchema(_node: Extract<SchemaNode, { type: "boolean" }>): JsonSchema {
  return { type: "boolean" };
}

export function booleanFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "boolean" }>{
  return { type: "boolean" };
}

// Named export aliases for consistency with module.d.ts
export const encode: Encoder<"boolean"> = encodeBoolean as never;
export const decode: Decoder<"boolean"> = decodeBoolean as never;
export const toCode: ToCode<"boolean"> = booleanToCode as never;
export const toJsonSchema: ToJsonSchema<"boolean"> = booleanToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = booleanFromJsonSchema as never;
