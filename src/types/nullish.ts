import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type { AnySchema, Matches } from "./lib/type_interfaces.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "nullish" as const;

// Serialized node shape for "nullish"
export interface NullishNode extends BaseNode<typeof typeName> {
  base: AnyNode;
}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<NullishNode> = function encodeNullish(
  any,
  ctx,
): NullishNode {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported nullish schema: missing wrapped schema");
  }
  return { type: typeName, base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<NullishNode> = function decodeNullish(node, ctx) {
  return v.nullish(ctx.decodeNode(node.base));
};

export const toCode: ToCode<NullishNode> = function nullishToCode(node, ctx) {
  return `v.nullish(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<NullishNode> =
  function nullishToJsonSchema(node, ctx): JsonSchema {
    return {
      anyOf: [ctx.convertNode(node.base), { type: "null" }],
    } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function nullishFromJsonSchema(
  schema,
  ctx,
): NullishNode {
  return { type: typeName, base: ctx.convert(schema) };
};
