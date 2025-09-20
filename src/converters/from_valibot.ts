import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import * as codecs from "../types/index.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Cache schema encodings to support recursive builders like v.lazy.
const encodeCache = new WeakMap<AnySchema, SchemaNode>();

/**
 * Convert a Valibot schema into a portable JSON-friendly representation.
 *
 * The returned value contains a stable envelope plus an AST `node` that
 * captures the schema structure and constraints without functions.
 *
 * @typeParam T - Any Valibot `BaseSchema`.
 * @param schema - The Valibot schema to convert.
 * @returns A `SerializedSchema` envelope with the encoded AST.
 */
export function fromValibot<T extends AnySchema>(schema: T): SerializedSchema {
  const node = encodeNode(schema);
  return {
    kind: "schema",
    vendor: "valibot",
    version: 1,
    format: FORMAT_VERSION,
    node,
  };
}

function encodeNode(schema: AnySchema): SchemaNode {
  const cached = encodeCache.get(schema);
  if (cached) return cached;

  const placeholder = {} as SchemaNode;
  encodeCache.set(schema, placeholder);

  // Read type directly to avoid JSON.stringify BigInt errors
  const any = schema as unknown as { type?: string } & Record<string, unknown>;
  const type = any.type;
  // Dispatch to codecs that can detect from Valibot schema
  try {
    for (const c of Object.values(codecs)) {
      if (c.matches(schema as never)) {
        const node = c.encode(any as never, { encodeNode });
        return Object.assign(placeholder, node);
      }
    }
  } catch (error) {
    encodeCache.delete(schema);
    throw error;
  }
  encodeCache.delete(schema);
  throw new Error(
    `Unsupported schema type for serialization: ${String(type)}`,
  );
}
