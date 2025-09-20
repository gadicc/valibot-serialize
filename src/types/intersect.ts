import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
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

export const typeName = "intersect" as const;

export const supportedTypes = [typeName];

export interface IntersectNode extends BaseNode<typeof typeName> {
  options: AnyNode[];
}

export const isSchemaNode: IsSchemaNode<IntersectNode> = (
  node,
  ctx,
): node is IntersectNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const opts = (node as { options?: unknown }).options;
  return Array.isArray(opts) && opts.every((o) => ctx.isSchemaNode(o));
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return Array.isArray((schema as { allOf?: unknown[] }).allOf);
};

export const encode: Encoder<IntersectNode> = (schema, ctx) => {
  const options = (schema as { options?: AnySchema[] }).options;
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("Unsupported intersect schema: missing options");
  }
  return {
    type: typeName,
    options: options.map((o) => ctx.encodeNode(o)),
  };
};

export const decode: Decoder<IntersectNode> = (node, ctx) => {
  return v.intersect(node.options.map((o) => ctx.decodeNode(o)) as never);
};

export const toCode: ToCode<IntersectNode> = (node, ctx) => {
  return `v.intersect([${
    node.options.map((o) => ctx.nodeToCode(o)).join(",")
  }])`;
};

export const toJsonSchema: ToJsonSchema<IntersectNode> = (node, ctx) => {
  return { allOf: node.options.map(ctx.convertNode) } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = (schema, ctx) => {
  const options = (schema as { allOf?: Record<string, unknown>[] }).allOf ?? [];
  return { type: typeName, options: options.map(ctx.convert) };
};
