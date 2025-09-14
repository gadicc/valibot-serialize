import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

type JsonSchema = Record<string, unknown>;

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
