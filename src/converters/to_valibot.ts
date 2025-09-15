// import removed; decoders are delegated to codecs now
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode, SerializedSchema } from "../types.ts";
import { isSerializedSchema } from "../util/guard.ts";
import * as codecs from "../types/index.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

/**
 * Convert a serialized schema back to a Valibot schema.
 *
 * Validates the envelope shape and converts the contained AST into
 * Valibot builder objects.
 *
 * @param data - A `SerializedSchema` envelope produced by {@link fromValibot}.
 * @returns A Valibot schema equivalent to the original.
 * @throws If the input is not a valid serialized schema.
 */
export function toValibot(data: SerializedSchema): AnySchema {
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

