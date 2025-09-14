import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode } from "./lib/type_interfaces.ts";
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

export const typeName = "union" as const;

// Serialized node shape for "union"
export interface UnionNode extends BaseNode<typeof typeName> {
  options: AnyNode[];
}

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  if (!Array.isArray((schema as { anyOf?: unknown[] }).anyOf)) return false;
  const items = (schema as { anyOf: Array<Record<string, unknown>> }).anyOf;
  // Not all consts (those belong to enum)
  return items.some((i) => i.const === undefined);
};

export const encode: Encoder<UnionNode> = function encodeUnion(
  any,
  ctx,
): UnionNode | AnyNode {
  const options = (any as { options?: unknown[] }).options as
    | AnySchema[]
    | undefined;
  if (!Array.isArray(options)) {
    throw new Error("Unsupported union schema: missing options");
  }
  const enc = options.map((o) => ctx.encodeNode(o));
  const literals = enc.every((n) => n.type === "literal");
  if (literals) {
    return {
      type: "enum",
      values: enc.map((n) =>
        (n as { type: "literal"; value: unknown }).value as never
      ),
    } as never;
  }
  return { type: typeName, options: enc };
};

export const decode: Decoder<UnionNode> = function decodeUnion(node, ctx) {
  return v.union(node.options.map((o) => ctx.decodeNode(o)) as never);
};

export const toCode: ToCode<UnionNode> = function unionToCode(node, ctx) {
  return `v.union([${node.options.map((o) => ctx.nodeToCode(o)).join(",")}])`;
};

export const toJsonSchema: ToJsonSchema<UnionNode> = function unionToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const literals = node.options.every((o) => o.type === "literal");
  if (literals) {
    return {
      enum: (node.options as Array<{ type: "literal"; value: unknown }>).map(
        (o) => o.value,
      ),
    } as JsonSchema;
  }
  return { anyOf: node.options.map(ctx.convertNode) } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function unionFromJsonSchema(
  schema,
  ctx,
): UnionNode {
  return {
    type: typeName,
    options: ((schema as { anyOf?: Record<string, unknown>[] }).anyOf ?? [])
      .map(ctx.convert),
  };
};
