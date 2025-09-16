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

export const typeName = "literal" as const;

// Serialized node shape for "literal"
export interface LiteralNode extends BaseNode<typeof typeName> {
  value: string | number | boolean | null;
}

export const isSchemaNode: IsSchemaNode<LiteralNode> = (
  node: unknown,
  _ctx,
): node is LiteralNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const v = (node as { value?: unknown }).value;
  const t = typeof v;
  return t === "string" || t === "number" || t === "boolean" || v === null;
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return (schema as { const?: unknown }).const !== undefined;
};

export const encode: Encoder<LiteralNode> = function encodeLiteral(
  any,
): LiteralNode {
  const value = (any as { literal?: unknown; value?: unknown }).literal ??
    (any as { value?: unknown }).value;
  if (value === undefined) {
    throw new Error("Unsupported literal schema without value");
  }
  if (
    typeof value === "string" || typeof value === "number" ||
    typeof value === "boolean" || value === null
  ) {
    return { type: typeName, value };
  }
  throw new Error("Only JSON-serializable literal values are supported");
};

export const decode: Decoder<LiteralNode> = function decodeLiteral(
  node,
): AnySchema {
  return v.literal(node.value as never);
};

export const toCode: ToCode<LiteralNode> = function literalToCode(
  node,
): string {
  return `v.literal(${lit(node.value)})`;
};

export const toJsonSchema: ToJsonSchema<LiteralNode> =
  function literalToJsonSchema(node): JsonSchema {
    return { const: node.value } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function literalFromJsonSchema(
  schema,
): LiteralNode {
  return {
    type: typeName,
    value: (schema as { const?: unknown }).const as never,
  };
};

function lit(vl: unknown): string {
  switch (typeof vl) {
    case "string":
      return JSON.stringify(vl);
    case "number":
      return Number.isFinite(vl as number) ? String(vl) : "null";
    case "boolean":
      return (vl as boolean) ? "true" : "false";
    case "object":
      return vl === null ? "null" : JSON.stringify(vl);
    default:
      return JSON.stringify(vl);
  }
}
