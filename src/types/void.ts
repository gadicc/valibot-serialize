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

export const typeName = "void" as const;

// Serialized node shape for "void"
export interface VoidNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<VoidNode> = (
  node: unknown,
  _ctx,
): node is VoidNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<VoidNode> = function encodeVoid(
  _any,
): VoidNode {
  return { type: typeName };
};

export const decode: Decoder<VoidNode> = function decodeVoid(
  _node,
): AnySchema {
  return v.void();
};

export const toCode: ToCode<VoidNode> = function voidToCode(
  _node,
): string {
  return "v.void()";
};

export const toJsonSchema: ToJsonSchema<VoidNode> = function voidToJsonSchema(
  _node,
): JsonSchema {
  // JSON has no void/undefined; represent as a schema that matches nothing.
  return { not: {} };
};

export const fromJsonSchema: FromJsonSchema = function voidFromJsonSchema(
  _schema,
): VoidNode {
  return { type: typeName };
};
