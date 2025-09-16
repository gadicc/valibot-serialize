import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../../types.ts";
import type { JsonSchema } from "../../converters/to_jsonschema.ts";

// Common base for all serialized node shapes
export interface BaseNode<T extends string> {
  type: T;
}

// Unified node type for codec contexts; uses the library's SchemaNode.
export type AnyNode = SchemaNode;

export type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export type Matches = (schema: AnySchema) => boolean;

export type MatchesJsonSchema = (schema: Record<string, unknown>) => boolean;

// Runtime type guard for a specific serialized node shape.
// The `ctx.isSchemaNode` callback allows recursive validation of child nodes
// without creating static import cycles.
export type IsSchemaNode<N extends AnyNode> = (
  node: unknown,
  ctx: { isSchemaNode: (node: unknown) => boolean },
) => node is N;

export type Encoder<N extends AnyNode> = (
  schema: { type?: string; pipe?: unknown[] } & Record<string, unknown>,
  ctx: { encodeNode: (schema: AnySchema) => AnyNode },
) => N | AnyNode;

export type Decoder<N extends AnyNode> = (
  node: N,
  ctx: { decodeNode: (node: AnyNode) => AnySchema },
) => AnySchema;

export type ToCode<N extends AnyNode> = (
  node: N,
  ctx: { nodeToCode: (node: AnyNode) => string },
) => string;

export type ToJsonSchema<N extends AnyNode> = (
  node: N,
  ctx: { convertNode: (node: AnyNode) => JsonSchema },
) => JsonSchema;

export type FromJsonSchema = (
  schema: Record<string, unknown>,
  ctx: { convert: (js: Record<string, unknown>) => AnyNode },
) => AnyNode;

export interface TypeCodec<N extends AnyNode> {
  typeName: N["type"];
  matches: Matches;
  // Optional detection for JSON Schema inputs
  matchesJsonSchema?: MatchesJsonSchema;
  // Optional runtime guard for serialized node validation
  isSchemaNode?: IsSchemaNode<N>;
  encode: Encoder<N>;
  decode: Decoder<N>;
  toCode: ToCode<N>;
  toJsonSchema: ToJsonSchema<N>;
  fromJsonSchema: FromJsonSchema;
}
