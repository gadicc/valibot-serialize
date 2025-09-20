import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "non_nullable" as const;

export const supportedTypes = [typeName];

export interface NonNullableNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const isSchemaNode: IsSchemaNode<NonNullableNode> = (
  node,
  ctx,
): node is NonNullableNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  return ctx.isSchemaNode((node as { base?: unknown }).base);
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<NonNullableNode> = (schema, ctx) => {
  const wrapped = (schema as { wrapped?: AnySchema }).wrapped;
  if (!wrapped) {
    throw new Error("Unsupported nonNullable schema: missing wrapped schema");
  }
  return { type: typeName, base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<NonNullableNode> = (node, ctx) => {
  return v.nonNullable(ctx.decodeNode(node.base));
};

export const toCode: ToCode<NonNullableNode> = (node, ctx) => {
  return `v.nonNullable(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<NonNullableNode> = (node, ctx) => {
  return ctx.convertNode(node.base);
};

export const fromJsonSchema: FromJsonSchema = (schema, ctx) => {
  return { type: typeName, base: ctx.convert(schema) };
};
