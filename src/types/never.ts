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

export const typeName = "never" as const;

// Serialized node shape for "never"
export interface NeverNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<NeverNode> = (
  node: unknown,
  _ctx,
): node is NeverNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<NeverNode> = function encodeNever(): NeverNode {
  return { type: typeName };
};

export const decode: Decoder<NeverNode> = function decodeNever(): AnySchema {
  return v.never();
};

export const toCode: ToCode<NeverNode> = function neverToCode(): string {
  return "v.never()";
};

export const toJsonSchema: ToJsonSchema<NeverNode> =
  function neverToJsonSchema(): JsonSchema {
    // Represent a non-matching schema (logical false)
    return { not: {} };
  };

export const fromJsonSchema: FromJsonSchema = function neverFromJsonSchema() {
  return { type: typeName };
};
