import { isSerializedSchema } from "../util/guard.ts";
import type { SchemaNode, SerializedSchema } from "../types.ts";
import * as codecs from "../types/index.ts";

// Generate minimal Valibot builder code from a SerializedSchema.
// Returns a compact expression string ending with a semicolon, e.g.:
//   v.object({email:v.string(),password:v.string()});
export function toCode(serialized: SerializedSchema): string {
  if (!isSerializedSchema(serialized)) {
    throw new Error("Invalid serialized schema format");
  }
  return nodeToCode(serialized.node) + ";";
}

function nodeToCode(node: SchemaNode): string {
  for (const c of Object.values(codecs)) {
    if (c.typeName === node.type) {
      return c.toCode(node as never, { nodeToCode });
    }
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
