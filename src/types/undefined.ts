import * as v from "@valibot/valibot";
import type { BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
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

export const typeName = "undefined" as const;

// Serialized node shape for "undefined"
export interface UndefinedNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<UndefinedNode> = (
  node: unknown,
  _ctx,
): node is UndefinedNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<UndefinedNode> = function encodeUndefined(
  _any,
): UndefinedNode {
  return { type: typeName };
};

export const decode: Decoder<UndefinedNode> = function decodeUndefined(
  _node,
): AnySchema {
  return v.undefined();
};

export const toCode: ToCode<UndefinedNode> = function undefinedToCode(
  _node,
): string {
  return "v.undefined()";
};

export const toJsonSchema: ToJsonSchema<UndefinedNode> =
  function undefinedToJsonSchema(_node): JsonSchema {
    // JSON has no undefined value; represent as a schema that matches nothing.
    return { not: {} };
  };

export const fromJsonSchema: FromJsonSchema = function undefinedFromJsonSchema(
  _schema,
): UndefinedNode {
  return { type: typeName };
};
