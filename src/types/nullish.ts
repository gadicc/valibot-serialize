import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type { AnySchema, Matches } from "../type_interfaces.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

export const typeName = "nullish" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<"nullish"> = function encodeNullish(
  any,
  ctx,
): Extract<SchemaNode, { type: "nullish" }> {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported nullish schema: missing wrapped schema");
  }
  return { type: "nullish", base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<"nullish"> = function decodeNullish(node, ctx) {
  return v.nullish(ctx.decodeNode(node.base));
};

export const toCode: ToCode<"nullish"> = function nullishToCode(node, ctx) {
  return `v.nullish(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<"nullish"> =
  function nullishToJsonSchema(node, ctx): JsonSchema {
    return {
      anyOf: [ctx.convertNode(node.base), { type: "null" }],
    } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function nullishFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "nullish" }> {
  return { type: "nullish", base: ctx.convert(schema) };
};
