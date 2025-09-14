import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode } from "./lib/type_interfaces.ts";
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

// Serialized node shape for "record"
export interface RecordNode extends BaseNode<typeof typeName> {
  key: AnyNode;
  value: AnyNode;
}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<RecordNode> = function encodeRecord(
  any,
  ctx,
): RecordNode {
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) {
    throw new Error("Unsupported record schema: missing key/value");
  }
  return {
    type: typeName,
    key: ctx.encodeNode(key),
    value: ctx.encodeNode(value),
  };
};

export const decode: Decoder<RecordNode> = function decodeRecord(node, ctx) {
  return v.record(
    ctx.decodeNode(node.key) as never,
    ctx.decodeNode(node.value) as never,
  );
};

export const toCode: ToCode<RecordNode> = function recordToCode(node, ctx) {
  return `v.record(${ctx.nodeToCode(node.key)},${ctx.nodeToCode(node.value)})`;
};

export const toJsonSchema: ToJsonSchema<RecordNode> =
  function recordToJsonSchema(
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
): RecordNode {
  return {
    type: typeName,
    key: { type: "string" } as never,
    value: ctx.convert(
      (schema as { additionalProperties?: Record<string, unknown> })
        .additionalProperties ?? {},
    ),
  };
};
