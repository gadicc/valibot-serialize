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
import { cloneSerializable, valueToCode } from "./lib/default_utils.ts";

export const typeName = "exact_optional" as const;

export const supportedTypes = [typeName];

export interface ExactOptionalNode extends BaseNode<typeof typeName> {
  base: AnyNode;
  default?: unknown;
  hasDefault?: boolean;
}

export const isSchemaNode: IsSchemaNode<ExactOptionalNode> = (
  node,
  ctx,
): node is ExactOptionalNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  if (!ctx.isSchemaNode((node as { base?: unknown }).base)) return false;
  return true;
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<ExactOptionalNode> = (schema, ctx) => {
  const wrapped = (schema as { wrapped?: AnySchema }).wrapped;
  if (!wrapped) {
    throw new Error("Unsupported exactOptional schema: missing wrapped schema");
  }
  const node: ExactOptionalNode = {
    type: typeName,
    base: ctx.encodeNode(wrapped),
  };
  if (Object.prototype.hasOwnProperty.call(schema, "default")) {
    const def = (schema as { default?: unknown }).default;
    node.default = cloneSerializable(def);
    node.hasDefault = true;
  }
  return node;
};

export const decode: Decoder<ExactOptionalNode> = (node, ctx) => {
  const base = ctx.decodeNode(node.base);
  if (node.hasDefault) {
    return v.exactOptional(base, cloneSerializable(node.default));
  }
  return v.exactOptional(base, undefined);
};

export const toCode: ToCode<ExactOptionalNode> = (node, ctx) => {
  const baseCode = ctx.nodeToCode(node.base);
  if (node.hasDefault) {
    return `v.exactOptional(${baseCode},${valueToCode(node.default)})`;
  }
  return `v.exactOptional(${baseCode})`;
};

export const toJsonSchema: ToJsonSchema<ExactOptionalNode> = (node, ctx) => {
  const schema = ctx.convertNode(node.base) as JsonSchema;
  if (node.hasDefault) {
    (schema as Record<string, unknown>).default = cloneSerializable(
      node.default,
    );
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = (schema, ctx) => {
  const base = ctx.convert(schema);
  const node: ExactOptionalNode = { type: typeName, base };
  if (Object.prototype.hasOwnProperty.call(schema, "default")) {
    (node as { default?: unknown }).default = cloneSerializable(
      (schema as { default?: unknown }).default,
    );
    node.hasDefault = true;
  }
  return node;
};
