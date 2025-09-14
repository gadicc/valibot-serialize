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

export const typeName = "literal" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<"literal"> = function encodeLiteral(
  any,
): Extract<SchemaNode, { type: "literal" }> {
  const snap = JSON.parse(JSON.stringify(any)) as {
    literal?: unknown;
    value?: unknown;
  };
  const value = snap.literal ?? snap.value ??
    (any as { literal?: unknown; value?: unknown }).literal ??
    (any as { value?: unknown }).value;
  if (value === undefined) {
    throw new Error("Unsupported literal schema without value");
  }
  if (
    typeof value === "string" || typeof value === "number" ||
    typeof value === "boolean" || value === null
  ) {
    return { type: "literal", value };
  }
  throw new Error("Only JSON-serializable literal values are supported");
};

export const decode: Decoder<"literal"> = function decodeLiteral(
  node,
): AnySchema {
  return v.literal(node.value as never);
};

export const toCode: ToCode<"literal"> = function literalToCode(node): string {
  return `v.literal(${lit(node.value)})`;
};

export const toJsonSchema: ToJsonSchema<"literal"> =
  function literalToJsonSchema(node): JsonSchema {
    return { const: node.value } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function literalFromJsonSchema(
  schema,
): Extract<SchemaNode, { type: "literal" }> {
  return {
    type: "literal",
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
