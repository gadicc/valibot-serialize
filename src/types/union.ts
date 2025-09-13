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

export const typeName = "union" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export const encode: Encoder<"union"> = function encodeUnion(
  any,
  ctx,
): Extract<SchemaNode, { type: "union" } | { type: "enum" }> {
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
  return { type: "union", options: enc };
};

export const decode: Decoder<"union"> = function decodeUnion(node, ctx) {
  return v.union(node.options.map((o) => ctx.decodeNode(o)) as never);
};

export const toCode: ToCode<"union"> = function unionToCode(node, ctx) {
  return `v.union([${node.options.map((o) => ctx.nodeToCode(o)).join(",")}])`;
};

export const toJsonSchema: ToJsonSchema<"union"> = function unionToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const literals = node.options.every((o) => o.type === "literal");
  if (literals) {
    return {
      enum: (node.options as Extract<SchemaNode, { type: "literal" }>[]).map((
        o,
      ) => o.value),
    } as JsonSchema;
  }
  return { anyOf: node.options.map(ctx.convertNode) } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function unionFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "union" }> {
  return {
    type: "union",
    options: ((schema as { anyOf?: Record<string, unknown>[] }).anyOf ?? [])
      .map(ctx.convert),
  };
};
