import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { AnySchema } from "../type_interfaces.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

export const typeName = "nullable" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === typeName;
}

export function encodeNullable(any: { wrapped?: unknown } & Record<string, unknown>, ctx: { encodeNode: (schema: AnySchema) => SchemaNode }): Extract<SchemaNode, { type: "nullable" }>{
  const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
  if (!wrapped) throw new Error("Unsupported nullable schema: missing wrapped schema");
  return { type: "nullable", base: ctx.encodeNode(wrapped) };
}

export function decodeNullable(node: Extract<SchemaNode, { type: "nullable" }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) {
  return v.nullable(ctx.decodeNode(node.base));
}

export function nullableToCode(node: Extract<SchemaNode, { type: "nullable" }>, ctx: { nodeToCode: (node: SchemaNode) => string }) {
  return `v.nullable(${ctx.nodeToCode(node.base)})`;
}

export function nullableToJsonSchema(node: Extract<SchemaNode, { type: "nullable" }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }): JsonSchema {
  return { anyOf: [ctx.convertNode(node.base), { type: "null" }] } as JsonSchema;
}

export function nullableFromJsonSchema(schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }): Extract<SchemaNode, { type: "nullable" }>{
  return { type: "nullable", base: ctx.convert(schema) };
}

export const encode: Encoder<"nullable"> = encodeNullable as never;
export const decode: Decoder<"nullable"> = decodeNullable as never;
export const toCode: ToCode<"nullable"> = nullableToCode as never;
export const toJsonSchema: ToJsonSchema<"nullable"> = nullableToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = nullableFromJsonSchema as never;

