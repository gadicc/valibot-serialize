import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

/**
 * JSON Schema (Draft 2020-12) object produced from a serialized schema.
 *
 * This is a loose structural type representing a standard JSON Schema
 * document fragment.
 */
type JsonSchema = Record<string, unknown>;

/**
 * Convert a serialized Valibot schema to a JSON Schema (Draft 2020-12).
 *
 * @param serialized - A `SerializedSchema` envelope.
 * @returns A JSON Schema object that approximates the same constraints.
 */
export function toJsonSchema(serialized: SerializedSchema): JsonSchema {
  return convertNode(serialized.node);
}

function convertNode(node: SchemaNode): JsonSchema {
  for (const c of Object.values(codecs)) {
    if (c.typeName === node.type && c.toJsonSchema) {
      return c.toJsonSchema(node as never, { convertNode });
    }
  }

  throw new Error(`Unsupported node type: ${(node as { type: string }).type}`);
}

export type { JsonSchema };
