import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

export const typeName = "tuple" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  const type = any?.type as string | undefined;
  return type === typeName || type === "tuple_with_rest";
};

export const encode: Encoder<"tuple"> = function encodeTuple(
  any,
  ctx,
): Extract<SchemaNode, { type: "tuple" }> {
  const items = (any as { items?: unknown[] }).items as AnySchema[] | undefined;
  if (!Array.isArray(items)) {
    throw new Error("Unsupported tuple schema: missing items");
  }
  const node: Extract<SchemaNode, { type: "tuple" }> = {
    type: "tuple",
    items: items.map((i) => ctx.encodeNode(i)),
  };
  const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
  const t = any?.type as string | undefined;
  if (rest) (node as { rest?: SchemaNode }).rest = ctx.encodeNode(rest);
  else if (t === "tuple_with_rest") {
    throw new Error("Unsupported tuple_with_rest schema: missing rest");
  }
  return node;
};

export const decode: Decoder<"tuple"> = function decodeTuple(node, ctx) {
  if (node.rest) {
    return v.tupleWithRest(
      node.items.map((i) => ctx.decodeNode(i)) as never,
      ctx.decodeNode(node.rest) as never,
    );
  }
  return v.tuple(node.items.map((i) => ctx.decodeNode(i)) as never);
};

export const toCode: ToCode<"tuple"> = function tupleToCode(node, ctx) {
  const items = `[${node.items.map((i) => ctx.nodeToCode(i)).join(",")}]`;
  if (node.rest) {
    return `v.tupleWithRest(${items},${ctx.nodeToCode(node.rest)})`;
  }
  return `v.tuple(${items})`;
};

export const toJsonSchema: ToJsonSchema<"tuple"> = function tupleToJsonSchema(
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
): Extract<SchemaNode, { type: "tuple" }> {
  const items =
    ((schema as { prefixItems?: Record<string, unknown>[] }).prefixItems ?? [])
      .map(ctx.convert);
  const node: Extract<SchemaNode, { type: "tuple" }> = { type: "tuple", items };
  if (typeof (schema as { items?: unknown }).items === "object") {
    (node as { rest?: SchemaNode }).rest = ctx.convert(
      (schema as { items: Record<string, unknown> }).items,
    );
  }
  return node;
};
