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

export const typeName = "nullable" as const;

// Serialized node shape for "nullable"
export interface NullableNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const isSchemaNode: IsSchemaNode<NullableNode> = (
  node: unknown,
  ctx,
): node is NullableNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  return ctx.isSchemaNode((node as { base?: unknown }).base);
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<NullableNode> = function encodeNullable(
  any,
  ctx,
): NullableNode {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported nullable schema: missing wrapped schema");
  }
  return { type: typeName, base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<NullableNode> = function decodeNullable(
  node,
  ctx,
) {
  return v.nullable(ctx.decodeNode(node.base));
};

export const toCode: ToCode<NullableNode> = function nullableToCode(node, ctx) {
  return `v.nullable(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<NullableNode> =
  function nullableToJsonSchema(node, ctx): JsonSchema {
    return {
      anyOf: [ctx.convertNode(node.base), { type: "null" }],
    } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function nullableFromJsonSchema(
  schema,
  ctx,
): NullableNode {
  return { type: typeName, base: ctx.convert(schema) };
};
