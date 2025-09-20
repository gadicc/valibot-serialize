import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
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

export const typeName = "variant" as const;

export const supportedTypes = [typeName];

export interface VariantNode extends BaseNode<typeof typeName> {
  key: string;
  options: AnyNode[];
}

export const isSchemaNode: IsSchemaNode<VariantNode> = (
  node,
  ctx,
): node is VariantNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const k = (node as { key?: unknown }).key;
  if (typeof k !== "string" || k.length === 0) return false;
  const opts = (node as { options?: unknown }).options;
  return Array.isArray(opts) && opts.every((o) => ctx.isSchemaNode(o));
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<VariantNode> = (schema, ctx) => {
  const key = (schema as { key?: unknown }).key;
  const options = (schema as { options?: AnySchema[] }).options;
  if (typeof key !== "string" || !key) {
    throw new Error("Unsupported variant schema: missing key");
  }
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("Unsupported variant schema: missing options");
  }
  return {
    type: typeName,
    key,
    options: options.map((o) => ctx.encodeNode(o)),
  };
};

export const decode: Decoder<VariantNode> = (node, ctx) => {
  return v.variant(
    node.key,
    node.options.map((o) => ctx.decodeNode(o)) as never,
  );
};

export const toCode: ToCode<VariantNode> = (node, ctx) => {
  return `v.variant(${JSON.stringify(node.key)},[${
    node.options.map((o) => ctx.nodeToCode(o)).join(",")
  }])`;
};

export const toJsonSchema: ToJsonSchema<VariantNode> = (node, ctx) => {
  return { anyOf: node.options.map(ctx.convertNode) } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = () => {
  throw new Error("Cannot derive variant schema from JSON Schema");
};
