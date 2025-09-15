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

export const typeName = "symbol" as const;

// Serialized node shape for "symbol"
export interface SymbolNode extends BaseNode<typeof typeName> {}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<SymbolNode> = function encodeSymbol(
  _any,
): SymbolNode {
  return { type: typeName };
};

export const decode: Decoder<SymbolNode> = function decodeSymbol(
  _node,
): AnySchema {
  return v.symbol();
};

export const toCode: ToCode<SymbolNode> = function symbolToCode(
  _node,
): string {
  return "v.symbol()";
};

export const toJsonSchema: ToJsonSchema<SymbolNode> =
  function symbolToJsonSchema(_node): JsonSchema {
    // No standard JSON Schema for Symbol; approximate with string.
    return { type: "string" };
  };

export const fromJsonSchema: FromJsonSchema = function symbolFromJsonSchema(
  _schema,
): SymbolNode {
  return { type: typeName };
};
