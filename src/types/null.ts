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

export const typeName = "null" as const;

// Serialized node shape for "null"
export interface NullNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<NullNode> = (
  node: unknown,
  _ctx,
): node is NullNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return (schema as { type?: unknown }).type === "null";
};

export const encode: Encoder<NullNode> = function encodeNull(): NullNode {
  return { type: typeName };
};

export const decode: Decoder<NullNode> = function decodeNull(): AnySchema {
  const anyV = v as unknown as Record<string, unknown>;
  const fn = (anyV["null"] ?? anyV["null_"]) as unknown;
  if (typeof fn === "function") {
    return (fn as () => unknown)() as never;
  }
  return v.literal(null as never) as never;
};

export const toCode: ToCode<NullNode> = function nullToCode(): string {
  return `(v.null ?? v.null_)()`;
};

export const toJsonSchema: ToJsonSchema<NullNode> =
  function nullToJsonSchema(): JsonSchema {
    return { type: "null" } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function nullFromJsonSchema() {
  return { type: typeName };
};
