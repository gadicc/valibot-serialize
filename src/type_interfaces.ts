import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "./types.ts";
import type { JsonSchema } from "./converters/to_jsonschema.ts";

export type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export type Encoder<K extends SchemaNode["type"]> = (
  schema: { type?: string; pipe?: unknown[] } & Record<string, unknown>,
  ctx: { encodeNode: (schema: AnySchema) => SchemaNode },
) => Extract<SchemaNode, { type: K }> | SchemaNode;

export type Decoder<K extends SchemaNode["type"]> = (
  node: Extract<SchemaNode, { type: K }>,
  ctx: { decodeNode: (node: SchemaNode) => AnySchema },
) => AnySchema;

export type ToCode<K extends SchemaNode["type"]> = (
  node: Extract<SchemaNode, { type: K }>,
  ctx: { nodeToCode: (node: SchemaNode) => string },
) => string;

export type ToJsonSchema<K extends SchemaNode["type"]> = (
  node: Extract<SchemaNode, { type: K }>,
  ctx: { convertNode: (node: SchemaNode) => JsonSchema },
) => JsonSchema;

export type FromJsonSchema = (
  schema: Record<string, unknown>,
  ctx: { convert: (js: Record<string, unknown>) => SchemaNode },
) => SchemaNode;

export interface TypeCodec<K extends SchemaNode["type"]> {
  typeName: K;
  matches: (schema: { type?: string } & Record<string, unknown>) => boolean;
  encode: Encoder<K>;
  decode: Decoder<K>;
  toCode: ToCode<K>;
  toJsonSchema: ToJsonSchema<K>;
  fromJsonSchema: FromJsonSchema;
}
