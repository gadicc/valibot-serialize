import * as v from "@valibot/valibot";
import type {
  AnyNode,
  AnySchema,
  BaseNode,
  Decoder,
  Encoder,
  FromJsonSchema,
  IsSchemaNode,
  Matches,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";

export const typeName = "lazy" as const;

export interface LazyNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const isSchemaNode: IsSchemaNode<LazyNode> = (
  node,
  ctx,
): node is LazyNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  return ctx.isSchemaNode((node as { base?: unknown }).base);
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<LazyNode> = function encodeLazy(schema, ctx) {
  if ((schema as { async?: boolean }).async) {
    throw new Error("Unsupported lazy schema: async lazy not supported");
  }
  const getter = (schema as { getter?: unknown }).getter;
  if (typeof getter !== "function") {
    throw new Error("Unsupported lazy schema: missing getter");
  }
  const target = getter(undefined) as unknown;
  if (!target || typeof target !== "object") {
    throw new Error("Unsupported lazy schema: getter must return a schema");
  }
  if (typeof (target as { then?: unknown }).then === "function") {
    throw new Error("Unsupported lazy schema: async getter not supported");
  }
  return { type: typeName, base: ctx.encodeNode(target as AnySchema) };
};

export const decode: Decoder<LazyNode> = function decodeLazy(node, ctx) {
  return v.lazy(() => ctx.decodeNode(node.base));
};

export const toCode: ToCode<LazyNode> = function lazyToCode(node, ctx) {
  return `v.lazy(() => ${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<LazyNode> = function lazyToJsonSchema(
  node,
  ctx,
): JsonSchema {
  return ctx.convertNode(node.base);
};

export const fromJsonSchema: FromJsonSchema = function lazyFromJsonSchema(
  schema,
  ctx,
): LazyNode {
  return { type: typeName, base: ctx.convert(schema) } as LazyNode;
};
