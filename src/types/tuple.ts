import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  MatchesJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "tuple" as const;

// Serialized node shape for "tuple"
export interface TupleNode extends BaseNode<typeof typeName> {
  items: AnyNode[];
  rest?: AnyNode;
}

export const isSchemaNode: IsSchemaNode<TupleNode> = (
  node: unknown,
  ctx,
): node is TupleNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const items = (node as { items?: unknown }).items as unknown;
  if (!Array.isArray(items)) return false;
  if (!items.every((i) => ctx.isSchemaNode(i))) return false;
  if ((node as { rest?: unknown }).rest !== undefined) {
    if (!ctx.isSchemaNode((node as { rest?: unknown }).rest)) return false;
  }
  return true;
};

export const matches: Matches = (any: AnySchema): boolean => {
  const type = any?.type as string | undefined;
  return type === typeName || type === "tuple_with_rest";
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return Array.isArray((schema as { prefixItems?: unknown[] }).prefixItems);
};

export const encode: Encoder<TupleNode> = function encodeTuple(
  any,
  ctx,
): TupleNode {
  const items = (any as { items?: unknown[] }).items as AnySchema[] | undefined;
  if (!Array.isArray(items)) {
    throw new Error("Unsupported tuple schema: missing items");
  }
  const node: TupleNode = {
    type: typeName,
    items: items.map((i) => ctx.encodeNode(i)),
  };
  const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
  const t = any?.type as string | undefined;
  if (rest) (node as { rest?: AnyNode }).rest = ctx.encodeNode(rest);
  else if (t === "tuple_with_rest") {
    throw new Error("Unsupported tuple_with_rest schema: missing rest");
  }
  return node;
};

export const decode: Decoder<TupleNode> = function decodeTuple(node, ctx) {
  if (node.rest) {
    return v.tupleWithRest(
      node.items.map((i) => ctx.decodeNode(i)) as never,
      ctx.decodeNode(node.rest) as never,
    );
  }
  return v.tuple(node.items.map((i) => ctx.decodeNode(i)) as never);
};

export const toCode: ToCode<TupleNode> = function tupleToCode(node, ctx) {
  const items = `[${node.items.map((i) => ctx.nodeToCode(i)).join(",")}]`;
  if (node.rest) {
    return `v.tupleWithRest(${items},${ctx.nodeToCode(node.rest)})`;
  }
  return `v.tuple(${items})`;
};

export const toJsonSchema: ToJsonSchema<TupleNode> = function tupleToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const schema: JsonSchema = {
    type: "array",
    prefixItems: node.items.map(ctx.convertNode),
  } as JsonSchema;
  if (node.rest) {
    (schema as Record<string, unknown>).items = ctx.convertNode(node.rest);
    (schema as Record<string, unknown>).minItems = node.items.length;
  } else {
    (schema as Record<string, unknown>).items = false as unknown as JsonSchema;
    (schema as Record<string, unknown>).minItems = node.items.length;
    (schema as Record<string, unknown>).maxItems = node.items.length;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function tupleFromJsonSchema(
  schema,
  ctx,
): TupleNode {
  const items =
    ((schema as { prefixItems?: Record<string, unknown>[] }).prefixItems ?? [])
      .map(ctx.convert);
  const node: TupleNode = { type: typeName, items };
  if (typeof (schema as { items?: unknown }).items === "object") {
    (node as { rest?: AnyNode }).rest = ctx.convert(
      (schema as { items: Record<string, unknown> }).items,
    );
  }
  return node;
};
