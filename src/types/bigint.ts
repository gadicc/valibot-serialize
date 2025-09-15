import * as v from "@valibot/valibot";
import type { BaseNode } from "./lib/type_interfaces.ts";
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

export const typeName = "bigint" as const;

// Serialized node shape for "bigint"
export interface BigIntNode extends BaseNode<typeof typeName> {}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<BigIntNode> = function encodeBigInt(
  _any,
): BigIntNode {
  return { type: typeName };
};

export const decode: Decoder<BigIntNode> = function decodeBigInt(
  _node,
): AnySchema {
  return v.bigint();
};

export const toCode: ToCode<BigIntNode> = function bigintToCode(
  _node,
): string {
  return "v.bigint()";
};

export const toJsonSchema: ToJsonSchema<BigIntNode> =
  function bigintToJsonSchema(_node): JsonSchema {
    // JSON Schema has no BigInt primitive; approximate with integer.
    return { type: "integer" };
  };

export const fromJsonSchema: FromJsonSchema = function bigintFromJsonSchema(
  _schema,
): BigIntNode {
  return { type: typeName };
};
