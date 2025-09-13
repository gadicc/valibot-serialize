import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import {
  arrayCodec,
  blobCodec,
  booleanCodec,
  codecs,
  dateCodec,
  enumCodec,
  fileCodec,
  literalCodec,
  mapCodec,
  nullableCodec,
  nullishCodec,
  numberCodec,
  objectCodec,
  optionalCodec,
  recordCodec,
  setCodec,
  stringCodec,
  tupleCodec,
  unionCodec,
} from "../registry.ts";

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
  for (const c of codecs) {
    try {
      if (c.matches(any)) return c.encode(any as never, { encodeNode });
    } catch (_) {
      // ignore and continue
    }
  }
  switch (type) {
    case "string":
      return stringCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "number":
      return numberCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "boolean":
      return booleanCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "date":
      return dateCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "file":
      return fileCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "blob":
      return blobCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "literal":
      return literalCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "picklist":
    case "enum":
      return enumCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "array":
      return arrayCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "object":
      return objectCodec.encode(any as never, { encodeNode }) as SchemaNode;
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
    case "optional":
      return optionalCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "nullable":
      return nullableCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "nullish":
      return nullishCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "union":
      return unionCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "tuple":
    case "tuple_with_rest":
      return tupleCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "record":
      return recordCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "set":
      return setCodec.encode(any as never, { encodeNode }) as SchemaNode;
    case "map":
      return mapCodec.encode(any as never, { encodeNode }) as SchemaNode;
    default:
      throw new Error(
        `Unsupported schema type for serialization: ${String(type)}`,
      );
  }
}

// string encoder now lives in src/types/string.ts (see stringCodec)

// file/blob encoders moved to src/types (see registry)

// composite encoders now handled via codecs
