import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "record" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeRecord(any: { key?: unknown; value?: unknown } & Record<string, unknown>, ctx: { encodeNode: (schema: AnySchema) => SchemaNode }): Extract<SchemaNode, { type: "record" }>{
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) throw new Error("Unsupported record schema: missing key/value");
  return { type: "record", key: ctx.encodeNode(key), value: ctx.encodeNode(value) };
}

export function decodeRecord(node: Extract<SchemaNode, { type: "record" }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) {
  return v.record(ctx.decodeNode(node.key) as never, ctx.decodeNode(node.value) as never);
}

export function recordToCode(node: Extract<SchemaNode, { type: "record" }>, ctx: { nodeToCode: (node: SchemaNode) => string }) {
  return `v.record(${ctx.nodeToCode(node.key)},${ctx.nodeToCode(node.value)})`;
}

export function recordToJsonSchema(node: Extract<SchemaNode, { type: "record" }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }): JsonSchema {
  return { type: "object", additionalProperties: ctx.convertNode(node.value) } as JsonSchema;
}

export function recordFromJsonSchema(schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }): Extract<SchemaNode, { type: "record" }>{
  return { type: "record", key: { type: "string" } as never, value: ctx.convert((schema as { additionalProperties?: Record<string, unknown> }).additionalProperties ?? {}) };
}

