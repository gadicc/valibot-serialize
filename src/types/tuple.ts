import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "tuple" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName || type === "tuple_with_rest";
}

export function encodeTuple(any: { items?: unknown[]; rest?: unknown } & Record<string, unknown>, ctx: { encodeNode: (schema: AnySchema) => SchemaNode }): Extract<SchemaNode, { type: "tuple" }>{
  const items = (any as { items?: unknown[] }).items as AnySchema[] | undefined;
  if (!Array.isArray(items)) throw new Error("Unsupported tuple schema: missing items");
  const node: Extract<SchemaNode, { type: "tuple" }> = { type: "tuple", items: items.map((i) => ctx.encodeNode(i)) };
  const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
  const t = (any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type) as string | undefined;
  if (rest) (node as { rest?: SchemaNode }).rest = ctx.encodeNode(rest);
  else if (t === "tuple_with_rest") throw new Error("Unsupported tuple_with_rest schema: missing rest");
  return node;
}

export function decodeTuple(node: Extract<SchemaNode, { type: "tuple" }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) {
  if (node.rest) return v.tupleWithRest(node.items.map((i) => ctx.decodeNode(i)) as never, ctx.decodeNode(node.rest) as never);
  return v.tuple(node.items.map((i) => ctx.decodeNode(i)) as never);
}

export function tupleToCode(node: Extract<SchemaNode, { type: "tuple" }>, ctx: { nodeToCode: (node: SchemaNode) => string }) {
  const items = `[${node.items.map((i) => ctx.nodeToCode(i)).join(",")}]`;
  if (node.rest) return `v.tupleWithRest(${items},${ctx.nodeToCode(node.rest)})`;
  return `v.tuple(${items})`;
}

export function tupleToJsonSchema(node: Extract<SchemaNode, { type: "tuple" }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }): JsonSchema {
  const schema: JsonSchema = { type: "array", prefixItems: node.items.map(ctx.convertNode) } as JsonSchema;
  if (node.rest) {
    (schema as Record<string, unknown>).items = ctx.convertNode(node.rest);
    (schema as Record<string, unknown>).minItems = node.items.length;
  } else {
    (schema as Record<string, unknown>).items = false as unknown as JsonSchema;
    (schema as Record<string, unknown>).minItems = node.items.length;
    (schema as Record<string, unknown>).maxItems = node.items.length;
  }
  return schema;
}

export function tupleFromJsonSchema(schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }): Extract<SchemaNode, { type: "tuple" }>{
  const items = ((schema as { prefixItems?: Record<string, unknown>[] }).prefixItems ?? []).map(ctx.convert);
  const node: Extract<SchemaNode, { type: "tuple" }> = { type: "tuple", items };
  if (typeof (schema as { items?: unknown }).items === "object") (node as { rest?: SchemaNode }).rest = ctx.convert((schema as { items: Record<string, unknown> }).items);
  return node;
}
