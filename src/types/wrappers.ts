import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Optional
export const optionalTypeName = "optional" as const;
export function matchesOptional(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === optionalTypeName;
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

// Nullable
export const nullableTypeName = "nullable" as const;
export function matchesNullable(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === nullableTypeName;
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

// Nullish
export const nullishTypeName = "nullish" as const;
export function matchesNullish(any: { type?: string }): boolean {
  const t = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === nullishTypeName;
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

