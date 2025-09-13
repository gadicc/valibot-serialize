import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import { FORMAT_VERSION, type SchemaNode, type SerializedSchema } from "./types.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export function isSerializedSchema(value: unknown): value is SerializedSchema {
  if (!value || typeof value !== "object") return false;
  const vObj = value as Record<string, unknown>;
  if (vObj.kind !== "schema") return false;
  if (vObj.vendor !== "valibot") return false;
  if (vObj.version !== 1) return false;
  if (vObj.format !== FORMAT_VERSION) return false;
  const node = vObj.node as SchemaNode | undefined;
  return isSchemaNode(node);
}

function isSchemaNode(node: unknown): node is SchemaNode {
  if (!node || typeof node !== "object") return false;
  const t = (node as { type?: string }).type;
  switch (t) {
    case "string": {
      const n = node as { minLength?: unknown; maxLength?: unknown; pattern?: unknown; patternFlags?: unknown };
      if (n.minLength !== undefined && typeof n.minLength !== "number") return false;
      if (n.maxLength !== undefined && typeof n.maxLength !== "number") return false;
      if (n.pattern !== undefined && typeof n.pattern !== "string") return false;
      if (n.patternFlags !== undefined && typeof n.patternFlags !== "string") return false;
      return true;
    }
    case "number": {
      const n = node as { min?: unknown; max?: unknown };
      if (n.min !== undefined && typeof n.min !== "number") return false;
      if (n.max !== undefined && typeof n.max !== "number") return false;
      return true;
    }
    case "boolean":
      return true;
    case "literal": {
      const value = (node as { value?: unknown }).value;
      const vt = typeof value;
      return (
        vt === "string" || vt === "number" || vt === "boolean" || value === null
      );
    }
    case "array":
      return isSchemaNode((node as { item?: unknown }).item);
    case "object": {
      const entries = (node as { entries?: unknown }).entries;
      if (!entries || typeof entries !== "object") return false;
      for (const key of Object.keys(entries as Record<string, unknown>)) {
        if (!isSchemaNode((entries as Record<string, unknown>)[key])) return false;
      }
      return true;
    }
    case "optional":
      return isSchemaNode((node as { base?: unknown }).base);
    case "nullable":
      return isSchemaNode((node as { base?: unknown }).base);
    default:
      return false;
  }
}

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
  const snap = JSON.parse(JSON.stringify(schema)) as { type?: string } & Record<string, unknown>;
  const any = schema as unknown as { type?: string } & Record<string, unknown>;
  const type = snap.type ?? any.type;
  switch (type) {
    case "string":
      return encodeString(any);
    case "number":
      return encodeNumber(any);
    case "boolean":
      return { type: "boolean" };
    case "literal": {
      const value = (snap as { value?: unknown }).value ?? (any as { value?: unknown }).value;
      if (value === undefined) throw new Error("Unsupported literal schema without value");
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
        return { type: "literal", value };
      }
      throw new Error("Only JSON-serializable literal values are supported");
    }
    case "array": {
      const child = (any as { item?: unknown }).item as AnySchema | undefined;
      if (!child) throw new Error("Unsupported array schema: missing item schema");
      return { type: "array", item: encodeNode(child) };
    }
    case "object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") {
        throw new Error("Unsupported object schema: missing entries");
      }
      const out: Record<string, SchemaNode> = {};
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) throw new Error(`Unsupported object schema: invalid entry for key '${key}'`);
        out[key] = encodeNode(sub);
      }
      return { type: "object", entries: out };
    }
    case "optional": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
      if (!wrapped) throw new Error("Unsupported optional schema: missing wrapped schema");
      return { type: "optional", base: encodeNode(wrapped) };
    }
    case "nullable": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
      if (!wrapped) throw new Error("Unsupported nullable schema: missing wrapped schema");
      return { type: "nullable", base: encodeNode(wrapped) };
    }
    default:
      throw new Error(`Unsupported schema type for serialization: ${String(type)}`);
  }
}

function encodeString(any: { pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const node: { type: "string"; minLength?: number; maxLength?: number; pattern?: string; patternFlags?: string } = { type: "string" };
  const pipe = (any as { pipe?: unknown[] }).pipe as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.minLength = req;
          break;
        }
        case "max_length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.maxLength = req;
          break;
        }
        case "regex": {
          const req = step.requirement as RegExp | undefined;
          if (req instanceof RegExp) {
            node.pattern = req.source;
            const flags = req.flags || undefined;
            if (flags) node.patternFlags = flags;
          }
          break;
        }
      }
    }
  }
  return node;
}

function encodeNumber(any: { pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const node: { type: "number"; min?: number; max?: number } = { type: "number" };
  const pipe = (any as { pipe?: unknown[] }).pipe as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.min = req;
          break;
        }
        case "max_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.max = req;
          break;
        }
      }
    }
  }
  return node;
}

// Decoder: SerializedSchema -> Valibot schema
export function deserialize(data: SerializedSchema): AnySchema {
  if (!isSerializedSchema(data)) {
    throw new Error("Invalid serialized schema format");
  }
  return decodeNode(data.node);
}

function decodeNode(node: SchemaNode): AnySchema {
  switch (node.type) {
    case "string":
      return decodeString(node);
    case "number":
      return decodeNumber(node);
    case "boolean":
      return v.boolean();
    case "literal":
      return v.literal(node.value as never);
    case "array":
      return v.array(decodeNode(node.item));
    case "object": {
      const shape: Record<string, AnySchema> = {};
      for (const key of Object.keys(node.entries)) {
        shape[key] = decodeNode(node.entries[key]);
      }
      return v.object(shape);
    }
    case "optional":
      return v.optional(decodeNode(node.base));
    case "nullable":
      return v.nullable(decodeNode(node.base));
    default:
      throw new Error(`Unsupported node type: ${(node as { type: string }).type}`);
  }
}

function decodeString(node: Extract<SchemaNode, { type: "string" }>): AnySchema {
  const s = v.string();
  const validators: unknown[] = [];
  if (node.minLength !== undefined) {
    validators.push(v.minLength(node.minLength));
  }
  if (node.maxLength !== undefined) {
    validators.push(v.maxLength(node.maxLength));
  }
  if (node.pattern) {
    const re = new RegExp(node.pattern, node.patternFlags ?? undefined);
    validators.push(v.regex(re));
  }
  switch (validators.length) {
    case 0:
      return s;
    case 1:
      return v.pipe(s, validators[0] as never);
    case 2:
      return v.pipe(s, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(s, validators[0] as never, validators[1] as never, validators[2] as never);
    default:
      // Should not happen given supported constraints
      return v.pipe(s, ...(validators as never[]));
  }
}

function decodeNumber(node: Extract<SchemaNode, { type: "number" }>): AnySchema {
  const n = v.number();
  const validators: unknown[] = [];
  if (node.min !== undefined) {
    validators.push(v.minValue(node.min));
  }
  if (node.max !== undefined) {
    validators.push(v.maxValue(node.max));
  }
  switch (validators.length) {
    case 0:
      return n;
    case 1:
      return v.pipe(n, validators[0] as never);
    case 2:
      return v.pipe(n, validators[0] as never, validators[1] as never);
    default:
      return v.pipe(n, ...(validators as never[]));
  }
}

export { FORMAT_VERSION } from "./types.ts";
export type { SchemaNode, SerializedSchema } from "./types.ts";
