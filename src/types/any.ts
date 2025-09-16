import * as v from "@valibot/valibot";
import type { BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
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

export const typeName = "any" as const;

// Serialized node shape for "any"
export interface AnyNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<AnyNode> = (
  node: unknown,
  _ctx,
): node is AnyNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  // An empty JSON Schema `{}` matches any value
  return Object.keys(schema).length === 0;
};

export const encode: Encoder<AnyNode> = function encodeAny(): AnyNode {
  return { type: typeName };
};

export const decode: Decoder<AnyNode> = function decodeAny(): AnySchema {
  return v.any();
};

export const toCode: ToCode<AnyNode> = function anyToCode(): string {
  return "v.any()";
};

export const toJsonSchema: ToJsonSchema<AnyNode> =
  function anyToJsonSchema(): JsonSchema {
    // Empty schema matches anything
    return {};
  };

export const fromJsonSchema: FromJsonSchema = function anyFromJsonSchema() {
  return { type: typeName };
};
