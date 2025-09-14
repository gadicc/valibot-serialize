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

export const typeName = "date" as const;

// Serialized node shape for "date"
export interface DateNode extends BaseNode<typeof typeName> {}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<DateNode> = function encodeDate(
  _any,
): DateNode {
  return { type: typeName };
};

export const decode: Decoder<DateNode> = function decodeDate(_node): AnySchema {
  return v.date();
};

export const toCode: ToCode<DateNode> = function dateToCode(_node): string {
  return "v.date()";
};

export const toJsonSchema: ToJsonSchema<DateNode> = function dateToJsonSchema(
  _node,
): JsonSchema {
  // Represent as RFC3339 string format
  return { type: "string", format: "date-time" } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function dateFromJsonSchema(
  _schema,
): DateNode {
  return { type: typeName };
};

// Named export aliases removed; functions are exported inline
