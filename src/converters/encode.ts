import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import * as codecs from "../types/index.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Encoder: Valibot schema -> SerializedSchema
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
