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

export const typeName = "nullable" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const t = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return t === typeName;
}

export const encode: Encoder<"nullable"> = function encodeNullable(
  any,
  ctx,
): Extract<SchemaNode, { type: "nullable" }> {
  const wrapped = (any as { wrapped?: unknown }).wrapped as
    | AnySchema
    | undefined;
  if (!wrapped) {
    throw new Error("Unsupported nullable schema: missing wrapped schema");
  }
  return { type: "nullable", base: ctx.encodeNode(wrapped) };
};

export const decode: Decoder<"nullable"> = function decodeNullable(node, ctx) {
  return v.nullable(ctx.decodeNode(node.base));
};

export const toCode: ToCode<"nullable"> = function nullableToCode(node, ctx) {
  return `v.nullable(${ctx.nodeToCode(node.base)})`;
};

export const toJsonSchema: ToJsonSchema<"nullable"> =
  function nullableToJsonSchema(node, ctx): JsonSchema {
    return {
      anyOf: [ctx.convertNode(node.base), { type: "null" }],
    } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function nullableFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "nullable" }> {
  return { type: "nullable", base: ctx.convert(schema) };
};
