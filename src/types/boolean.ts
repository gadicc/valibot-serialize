import * as v from "@valibot/valibot";
import type { BaseNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  MatchesJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "boolean" as const;

// Serialized node shape for "boolean"
export interface BooleanNode extends BaseNode<typeof typeName> {}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return (schema as { type?: unknown }).type === "boolean";
};

export const encode: Encoder<BooleanNode> = function encodeBoolean(
  _any,
): BooleanNode {
  return { type: typeName };
};

export const decode: Decoder<BooleanNode> = function decodeBoolean(
  _node,
): AnySchema {
  return v.boolean();
};

export const toCode: ToCode<BooleanNode> = function booleanToCode(
  _node,
): string {
  return "v.boolean()";
};

export const toJsonSchema: ToJsonSchema<BooleanNode> =
  function booleanToJsonSchema(_node): JsonSchema {
    return { type: "boolean" };
  };

export const fromJsonSchema: FromJsonSchema = function booleanFromJsonSchema(
  _schema,
): BooleanNode {
  return { type: typeName };
};
