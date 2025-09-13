import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { AnySchema } from "../type_interfaces.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

export const typeName = "nullish" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === typeName;
}

export function encodeNullish(any: { wrapped?: unknown } & Record<string, unknown>, ctx: { encodeNode: (schema: AnySchema) => SchemaNode }): Extract<SchemaNode, { type: "nullish" }>{
  const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
  if (!wrapped) throw new Error("Unsupported nullish schema: missing wrapped schema");
  return { type: "nullish", base: ctx.encodeNode(wrapped) };
}

export function decodeNullish(node: Extract<SchemaNode, { type: "nullish" }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) {
  return v.nullish(ctx.decodeNode(node.base));
}

export function nullishToCode(node: Extract<SchemaNode, { type: "nullish" }>, ctx: { nodeToCode: (node: SchemaNode) => string }) {
  return `v.nullish(${ctx.nodeToCode(node.base)})`;
}

export function nullishToJsonSchema(node: Extract<SchemaNode, { type: "nullish" }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }): JsonSchema {
  return { anyOf: [ctx.convertNode(node.base), { type: "null" }] } as JsonSchema;
}

export function nullishFromJsonSchema(schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }): Extract<SchemaNode, { type: "nullish" }>{
  return { type: "nullish", base: ctx.convert(schema) };
}

export const encode: Encoder<"nullish"> = encodeNullish as never;
export const decode: Decoder<"nullish"> = decodeNullish as never;
export const toCode: ToCode<"nullish"> = nullishToCode as never;
export const toJsonSchema: ToJsonSchema<"nullish"> = nullishToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = nullishFromJsonSchema as never;

