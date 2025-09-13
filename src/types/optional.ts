import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type { AnySchema } from "../type_interfaces.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

export const typeName = "optional" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const t = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === typeName;
}

export const encode: Encoder<"optional"> = function encodeOptional(
  any,
  ctx,
): Extract<SchemaNode, { type: "optional" }> {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported optional schema: missing wrapped schema");
  }
  return { type: "optional", base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<"optional"> = function decodeOptional(node, ctx) {
  return v.optional(ctx.decodeNode(node.base));
};

export const toCode: ToCode<"optional"> = function optionalToCode(node, ctx) {
  return `v.optional(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<"optional"> =
  function optionalToJsonSchema(node, ctx): JsonSchema {
    return ctx.convertNode(node.base);
  };

export const fromJsonSchema: FromJsonSchema = function optionalFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "optional" }> {
  return { type: "optional", base: ctx.convert(schema) };
};
