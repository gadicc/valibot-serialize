import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

const jsonCache = new WeakMap<SchemaNode, JsonSchema>();
const visiting = new WeakSet<SchemaNode>();

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
  const cached = jsonCache.get(node);
  if (cached) return cached;
  if (visiting.has(node)) {
    throw new Error("Cyclic schema detected while generating JSON Schema");
  }
  visiting.add(node);
  try {
    for (const c of Object.values(codecs)) {
      if (c.typeName === node.type && c.toJsonSchema) {
        const schema = c.toJsonSchema(node as never, { convertNode });
        jsonCache.set(node, schema);
        return schema;
      }
    }
  } finally {
    visiting.delete(node);
  }

  throw new Error(`Unsupported node type: ${(node as { type: string }).type}`);
}

export type { JsonSchema };
