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
} from "./lib/type_interfaces.ts";

export const typeName = "record" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<"record"> = function encodeRecord(
  any,
  ctx,
): Extract<SchemaNode, { type: "record" }> {
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) {
    throw new Error("Unsupported record schema: missing key/value");
  }
  return {
    type: "record",
    key: ctx.encodeNode(key),
    value: ctx.encodeNode(value),
  };
};

export const decode: Decoder<"record"> = function decodeRecord(node, ctx) {
  return v.record(
    ctx.decodeNode(node.key) as never,
    ctx.decodeNode(node.value) as never,
  );
};

export const toCode: ToCode<"record"> = function recordToCode(node, ctx) {
  return `v.record(${ctx.nodeToCode(node.key)},${ctx.nodeToCode(node.value)})`;
};

export const toJsonSchema: ToJsonSchema<"record"> = function recordToJsonSchema(
  node,
  ctx,
): JsonSchema {
  return {
    type: "object",
    additionalProperties: ctx.convertNode(node.value),
  } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function recordFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "record" }> {
  return {
    type: "record",
    key: { type: "string" } as never,
    value: ctx.convert(
      (schema as { additionalProperties?: Record<string, unknown> })
        .additionalProperties ?? {},
    ),
  };
};
