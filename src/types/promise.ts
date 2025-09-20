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

export const typeName = "promise" as const;

export const supportedTypes = [typeName];

export interface PromiseNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<PromiseNode> = (
  node,
): node is PromiseNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<PromiseNode> = () => ({ type: typeName });

export const decode: Decoder<PromiseNode> = () => v.promise();

export const toCode: ToCode<PromiseNode> = () => "v.promise()";

export const toJsonSchema: ToJsonSchema<PromiseNode> = () => {
  // JSON Schema has no representation for Promise values; return unconstrained schema.
  return {} as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = () => ({ type: typeName });
