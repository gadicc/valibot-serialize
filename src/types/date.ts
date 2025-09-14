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

export const typeName = "date" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<"date"> = function encodeDate(
  _any,
): Extract<SchemaNode, { type: "date" }> {
  return { type: "date" };
};

export const decode: Decoder<"date"> = function decodeDate(_node): AnySchema {
  return v.date();
};

export const toCode: ToCode<"date"> = function dateToCode(_node): string {
  return "v.date()";
};

export const toJsonSchema: ToJsonSchema<"date"> = function dateToJsonSchema(
  _node,
): JsonSchema {
  // Represent as RFC3339 string format
  return { type: "string", format: "date-time" } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function dateFromJsonSchema(
  _schema,
): Extract<SchemaNode, { type: "date" }> {
  return { type: "date" };
};

// Named export aliases removed; functions are exported inline
