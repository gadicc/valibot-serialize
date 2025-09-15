import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import * as codecs from "../types/index.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

/**
 * Serialize a Valibot schema into a portable JSON-friendly representation.
 *
 * The returned value contains a stable envelope plus an AST `node` that
 * captures the schema structure and constraints without functions.
 *
 * @typeParam T - Any Valibot `BaseSchema`.
 * @param schema - The Valibot schema to serialize.
 * @returns A `SerializedSchema` envelope with the encoded AST.
 */
export function serialize<T extends AnySchema>(schema: T): SerializedSchema {
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
  // Snapshot strips functions, keeping stable metadata for detection
  const snap = JSON.parse(JSON.stringify(schema)) as
    & { type?: string }
    & Record<string, unknown>;
  const any = schema as unknown as { type?: string } & Record<string, unknown>;
  const type = snap.type ?? any.type;
  // Dispatch to codecs that can detect from Valibot schema
  for (const c of Object.values(codecs)) {
    if (c.matches(schema as never)) {
      return c.encode(any as never, { encodeNode });
    }
  }
  throw new Error(
    `Unsupported schema type for serialization: ${String(type)}`,
  );
}
