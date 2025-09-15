import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import * as codecs from "../types/index.ts";

type JS = Record<string, unknown>;

/**
 * Build a serialized Valibot schema from a JSON Schema (Draft 2020-12).
 *
 * The conversion is best-effort and focuses on commonly-used constraints.
 *
 * @param schema - A JSON Schema-ish input object.
 * @returns A `SerializedSchema` envelope containing the converted AST.
 */
export function fromJsonSchema(schema: JS): SerializedSchema {
  return {
    kind: "schema",
    vendor: "valibot",
    version: 1,
    format: FORMAT_VERSION,
    node: convert(schema),
  };
}

function convert(schema: JS): SchemaNode {
  for (const c of Object.values(codecs)) {
    const match = (c as { matchesJsonSchema?: (s: JS) => boolean })
      .matchesJsonSchema;
    if (typeof match === "function" && match(schema)) {
      return c.fromJsonSchema(schema, { convert }) as SchemaNode;
    }
  }
  // As a final fallback, prefer string codec conversion
  if (codecs.string && typeof codecs.string.fromJsonSchema === "function") {
    return codecs.string.fromJsonSchema(schema, { convert }) as SchemaNode;
  }
  // Ultra fallback: minimal string node
  return { type: "string" };
}

/**
 * Input type accepted by {@link fromJsonSchema}.
 * A loose structural type representing a JSON Schema-like object.
 */
export type { JS as JsonSchemaInput };
