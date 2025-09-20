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

export const typeName = "non_optional" as const;

export const supportedTypes = [typeName];

export interface NonOptionalNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const isSchemaNode: IsSchemaNode<NonOptionalNode> = (
  node,
  ctx,
): node is NonOptionalNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  return ctx.isSchemaNode((node as { base?: unknown }).base);
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<NonOptionalNode> = (schema, ctx) => {
  const wrapped = (schema as { wrapped?: AnySchema }).wrapped;
  if (!wrapped) {
    throw new Error("Unsupported nonOptional schema: missing wrapped schema");
  }
  return { type: typeName, base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<NonOptionalNode> = (node, ctx) => {
  return v.nonOptional(ctx.decodeNode(node.base));
};

export const toCode: ToCode<NonOptionalNode> = (node, ctx) => {
  return `v.nonOptional(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<NonOptionalNode> = (node, ctx) => {
  return ctx.convertNode(node.base);
};

export const fromJsonSchema: FromJsonSchema = (schema, ctx) => {
  return { type: typeName, base: ctx.convert(schema) };
};
