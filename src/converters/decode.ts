// import removed; decoders are delegated to codecs now
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode, SerializedSchema } from "../types.ts";
import { isSerializedSchema } from "../util/guard.ts";
import * as codecs from "../types/index.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Decoder: SerializedSchema -> Valibot schema
export function deserialize(data: SerializedSchema): AnySchema {
  if (!isSerializedSchema(data)) {
    throw new Error("Invalid serialized schema format");
  }
  return decodeNode(data.node);
}

function decodeNode(node: SchemaNode): AnySchema {
  for (const c of Object.values(codecs)) {
    if (c.typeName === node.type) {
      return c.decode(node as never, { decodeNode });
    }
  }

  throw new Error(
    `Unsupported node type: ${(node as { type: string }).type}`,
  );
}
