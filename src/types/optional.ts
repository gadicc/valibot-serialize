import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { AnySchema } from "../type_interfaces.ts";
import type { Encoder, Decoder, ToCode, ToJsonSchema, FromJsonSchema } from "../type_interfaces.ts";

export const typeName = "optional" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === typeName;
}

export function encodeOptional(any: { wrapped?: unknown } & Record<string, unknown>, ctx: { encodeNode: (schema: AnySchema) => SchemaNode }): Extract<SchemaNode, { type: "optional" }>{
  const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
  if (!wrapped) throw new Error("Unsupported optional schema: missing wrapped schema");
  return { type: "optional", base: ctx.encodeNode(wrapped) };
}

export function decodeOptional(node: Extract<SchemaNode, { type: "optional" }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) {
  return v.optional(ctx.decodeNode(node.base));
}

export function optionalToCode(node: Extract<SchemaNode, { type: "optional" }>, ctx: { nodeToCode: (node: SchemaNode) => string }) {
  return `v.optional(${ctx.nodeToCode(node.base)})`;
}

export function optionalToJsonSchema(node: Extract<SchemaNode, { type: "optional" }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }): JsonSchema {
  return ctx.convertNode(node.base);
}

export function optionalFromJsonSchema(schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }): Extract<SchemaNode, { type: "optional" }>{
  return { type: "optional", base: ctx.convert(schema) };
}

export const encode: Encoder<"optional"> = encodeOptional as never;
export const decode: Decoder<"optional"> = decodeOptional as never;
export const toCode: ToCode<"optional"> = optionalToCode as never;
export const toJsonSchema: ToJsonSchema<"optional"> = optionalToJsonSchema as never;
export const fromJsonSchema: FromJsonSchema = optionalFromJsonSchema as never;

