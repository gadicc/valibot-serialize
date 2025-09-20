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

export const typeName = "function" as const;

export const supportedTypes = [typeName];

export interface FunctionNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<FunctionNode> = (
  node,
): node is FunctionNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<FunctionNode> = () => ({ type: typeName });

export const decode: Decoder<FunctionNode> = () => v.function();

export const toCode: ToCode<FunctionNode> = () => "v.function()";

export const toJsonSchema: ToJsonSchema<FunctionNode> = () => {
  // JSON Schema cannot express function values. Return unconstrained schema.
  return {} as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = () => ({ type: typeName });
