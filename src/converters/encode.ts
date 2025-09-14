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
    try {
      if (c.matches(schema as never)) {
        return c.encode(any as never, { encodeNode });
      }
    } catch (error) {
      throw error;
    }
  }
  switch (type) {
    case "loose_object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") {
        throw new Error("Unsupported loose_object: missing entries");
      }
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) {
          throw new Error(
            `Unsupported loose_object: invalid entry for key '${key}'`,
          );
        }
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return {
          type: "object" as const,
          entries: out,
          policy: "loose" as const,
          optionalKeys,
        };
      }
      return {
        type: "object" as const,
        entries: out,
        policy: "loose" as const,
      };
    }
    case "strict_object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") {
        throw new Error("Unsupported strict_object: missing entries");
      }
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) {
          throw new Error(
            `Unsupported strict_object: invalid entry for key '${key}`,
          );
        }
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return {
          type: "object" as const,
          entries: out,
          policy: "strict" as const,
          optionalKeys,
        };
      }
      return {
        type: "object" as const,
        entries: out,
        policy: "strict" as const,
      };
    }
    case "object_with_rest": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
      if (!entries || typeof entries !== "object") {
        throw new Error("Unsupported object_with_rest: missing entries");
      }
      if (!rest) throw new Error("Unsupported object_with_rest: missing rest");
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) {
          throw new Error(
            `Unsupported object_with_rest: invalid entry for key '${key}`,
          );
        }
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return {
          type: "object" as const,
          entries: out,
          rest: encodeNode(rest),
          optionalKeys,
        };
      }
      return { type: "object" as const, entries: out, rest: encodeNode(rest) };
    }
    default:
      throw new Error(
        `Unsupported schema type for serialization: ${String(type)}`,
      );
  }
}
