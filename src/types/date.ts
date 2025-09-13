import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "date" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

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
