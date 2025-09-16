import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type { AnySchema, Matches } from "./lib/type_interfaces.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "optional" as const;

// Serialized node shape for "optional"
export interface OptionalNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const isSchemaNode: IsSchemaNode<OptionalNode> = (
  node: unknown,
  ctx,
): node is OptionalNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  return ctx.isSchemaNode((node as { base?: unknown }).base);
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<OptionalNode> = function encodeOptional(
  any,
  ctx,
): OptionalNode {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported optional schema: missing wrapped schema");
  }
  return { type: typeName, base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<OptionalNode> = function decodeOptional(
  node,
  ctx,
) {
  return v.optional(ctx.decodeNode(node.base));
};

export const toCode: ToCode<OptionalNode> = function optionalToCode(node, ctx) {
  return `v.optional(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<OptionalNode> =
  function optionalToJsonSchema(node, ctx): JsonSchema {
    return ctx.convertNode(node.base);
  };

export const fromJsonSchema: FromJsonSchema = function optionalFromJsonSchema(
  schema,
  ctx,
): OptionalNode {
  return { type: typeName, base: ctx.convert(schema) };
};
