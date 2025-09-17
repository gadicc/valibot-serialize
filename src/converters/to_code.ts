import { isSerializedSchema } from "../util/guard.ts";
import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

/**
 * Generate compact Valibot builder code from a serialized schema.
 *
 * Returns a single expression string, e.g.:
 * `v.object({ email: v.string(), password: v.string() });`
 *
 * @param serialized - A `SerializedSchema` envelope.
 * @returns A code string suitable for embedding or inspection.
 * @throws If the input is not a valid serialized schema.
 */
export function toCode(serialized: SerializedSchema): string {
  if (!isSerializedSchema(serialized)) {
    throw new Error("Invalid serialized schema format");
  }
  return nodeToCode(serialized.node);
}

function nodeToCode(node: SchemaNode): string {
  for (const c of Object.values(codecs)) {
    if (c.typeName === node.type) {
      return c.toCode(node as never, { nodeToCode });
    }
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
