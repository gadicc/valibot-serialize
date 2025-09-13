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

export const typeName = "boolean" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export const encode: Encoder<"boolean"> = function encodeBoolean(
  _any,
): Extract<SchemaNode, { type: "boolean" }> {
  return { type: "boolean" };
};

export const decode: Decoder<"boolean"> = function decodeBoolean(
  _node,
): AnySchema {
  return v.boolean();
};

export const toCode: ToCode<"boolean"> = function booleanToCode(_node): string {
  return "v.boolean()";
};

export const toJsonSchema: ToJsonSchema<"boolean"> =
  function booleanToJsonSchema(_node): JsonSchema {
    return { type: "boolean" };
  };

export const fromJsonSchema: FromJsonSchema = function booleanFromJsonSchema(
  _schema,
): Extract<SchemaNode, { type: "boolean" }> {
  return { type: "boolean" };
};
