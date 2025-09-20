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

export const typeName = "nan" as const;

export const supportedTypes = [typeName];

export interface NanNode extends BaseNode<typeof typeName> {}

export const isSchemaNode: IsSchemaNode<NanNode> = (node): node is NanNode => {
  return Boolean(
    node && typeof node === "object" &&
      (node as { type?: unknown }).type === typeName,
  );
};

export const matches: Matches = (schema: AnySchema): boolean => {
  return schema?.type === typeName;
};

export const encode: Encoder<NanNode> = () => ({ type: typeName });

export const decode: Decoder<NanNode> = () => v.nan();

export const toCode: ToCode<NanNode> = () => "v.nan()";

export const toJsonSchema: ToJsonSchema<NanNode> = () => {
  // JSON Schema cannot encode NaN. Expose a loose number schema instead.
  return { type: "number" } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = () => ({ type: typeName });
