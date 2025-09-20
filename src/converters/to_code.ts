import { isSerializedSchema } from "../util/guard.ts";
import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

const codeCache = new WeakMap<SchemaNode, string>();
const building = new WeakSet<SchemaNode>();

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
  const cached = codeCache.get(node);
  if (cached) return cached;
  if (building.has(node)) {
    // TODO: Emit reusable bindings so cyclic lazy schemas can round-trip.
    throw new Error("Cyclic schema detected while generating code");
  }
  building.add(node);
  try {
    for (const c of Object.values(codecs)) {
      if (c.typeName === node.type) {
        const code = c.toCode(node as never, { nodeToCode });
        codeCache.set(node, code);
        return code;
      }
    }
  } finally {
    building.delete(node);
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
