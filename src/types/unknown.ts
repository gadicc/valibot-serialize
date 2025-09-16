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

export const typeName = "unknown" as const;

// Serialized node shape for "unknown"
export interface UnknownNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<UnknownNode> = (
  node: unknown,
  _ctx,
): node is UnknownNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<UnknownNode> =
  function encodeUnknown(): UnknownNode {
    return { type: typeName };
  };

export const decode: Decoder<UnknownNode> =
  function decodeUnknown(): AnySchema {
    return v.unknown();
  };

export const toCode: ToCode<UnknownNode> = function unknownToCode(): string {
  return "v.unknown()";
};

export const toJsonSchema: ToJsonSchema<UnknownNode> =
  function unknownToJsonSchema(): JsonSchema {
    // JSON Schema cannot express TS 'unknown' distinct from 'any'; use empty schema
    return {};
  };

export const fromJsonSchema: FromJsonSchema = function unknownFromJsonSchema() {
  // Do not attempt to auto-detect 'unknown' from JSON Schema to avoid ambiguity with 'any'
  return { type: typeName };
};
