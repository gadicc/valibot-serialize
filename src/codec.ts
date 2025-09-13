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
      const n = node as { minLength?: unknown; maxLength?: unknown; length?: unknown; pattern?: unknown; patternFlags?: unknown; email?: unknown; rfcEmail?: unknown; url?: unknown; uuid?: unknown; ip?: unknown; ipv4?: unknown; ipv6?: unknown; hexColor?: unknown; slug?: unknown; startsWith?: unknown; endsWith?: unknown };
      if (n.minLength !== undefined && typeof n.minLength !== "number") return false;
      if (n.maxLength !== undefined && typeof n.maxLength !== "number") return false;
      if (n.length !== undefined && typeof n.length !== "number") return false;
      if (n.pattern !== undefined && typeof n.pattern !== "string") return false;
      if (n.patternFlags !== undefined && typeof n.patternFlags !== "string") return false;
      if (n.email !== undefined && n.email !== true) return false;
      if (n.rfcEmail !== undefined && n.rfcEmail !== true) return false;
      if (n.url !== undefined && n.url !== true) return false;
      if (n.uuid !== undefined && n.uuid !== true) return false;
      if (n.ip !== undefined && n.ip !== true) return false;
      if (n.ipv4 !== undefined && n.ipv4 !== true) return false;
      if (n.ipv6 !== undefined && n.ipv6 !== true) return false;
      if (n.hexColor !== undefined && n.hexColor !== true) return false;
      if (n.slug !== undefined && n.slug !== true) return false;
      if (n.startsWith !== undefined && typeof n.startsWith !== "string") return false;
      if (n.endsWith !== undefined && typeof n.endsWith !== "string") return false;
      return true;
    }
    case "number": {
      const n = node as { min?: unknown; max?: unknown; gt?: unknown; lt?: unknown; integer?: unknown; safeInteger?: unknown; multipleOf?: unknown; finite?: unknown };
      if (n.min !== undefined && typeof n.min !== "number") return false;
      if (n.max !== undefined && typeof n.max !== "number") return false;
      if (n.gt !== undefined && typeof n.gt !== "number") return false;
      if (n.lt !== undefined && typeof n.lt !== "number") return false;
      if (n.integer !== undefined && n.integer !== true) return false;
      if (n.safeInteger !== undefined && n.safeInteger !== true) return false;
      if (n.multipleOf !== undefined && typeof n.multipleOf !== "number") return false;
      if (n.finite !== undefined && n.finite !== true) return false;
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
    case "array": {
      const n = node as { item?: unknown; minLength?: unknown; maxLength?: unknown; length?: unknown };
      if (!isSchemaNode(n.item)) return false;
      if (n.minLength !== undefined && typeof n.minLength !== "number") return false;
      if (n.maxLength !== undefined && typeof n.maxLength !== "number") return false;
      if (n.length !== undefined && typeof n.length !== "number") return false;
      return true;
    }
    case "object": {
      const entries = (node as { entries?: unknown }).entries;
      if (!entries || typeof entries !== "object") return false;
      for (const key of Object.keys(entries as Record<string, unknown>)) {
        if (!isSchemaNode((entries as Record<string, unknown>)[key])) return false;
      }
      const opt = (node as { optionalKeys?: unknown }).optionalKeys;
      if (opt !== undefined) {
        if (!Array.isArray(opt) || opt.some((k) => typeof k !== "string")) return false;
      }
      const policy = (node as { policy?: unknown }).policy;
      if (policy !== undefined && policy !== "loose" && policy !== "strict") return false;
      const rest = (node as { rest?: unknown }).rest;
      if (rest !== undefined && !isSchemaNode(rest)) return false;
      return true;
    }
    case "optional":
      return isSchemaNode((node as { base?: unknown }).base);
    case "nullable":
      return isSchemaNode((node as { base?: unknown }).base);
    case "nullish":
      return isSchemaNode((node as { base?: unknown }).base);
    case "union": {
      const options = (node as { options?: unknown }).options;
      return Array.isArray(options) && options.every((n) => isSchemaNode(n));
    }
    case "tuple": {
      const items = (node as { items?: unknown }).items;
      return Array.isArray(items) && items.every((n) => isSchemaNode(n));
    }
    case "record":
      return (
        isSchemaNode((node as { key?: unknown }).key) &&
        isSchemaNode((node as { value?: unknown }).value)
      );
    case "enum": {
      const values = (node as { values?: unknown }).values;
      if (!Array.isArray(values)) return false;
      for (const v of values) {
        const t = typeof v;
        if (!(t === "string" || t === "number" || t === "boolean") && v !== null) return false;
      }
      return true;
    }
    case "set": {
      const n = node as { value?: unknown; minSize?: unknown; maxSize?: unknown };
      if (!isSchemaNode(n.value)) return false;
      if (n.minSize !== undefined && typeof n.minSize !== "number") return false;
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") return false;
      return true;
    }
    case "map": {
      const n = node as { key?: unknown; value?: unknown; minSize?: unknown; maxSize?: unknown };
      if (!isSchemaNode(n.key) || !isSchemaNode(n.value)) return false;
      if (n.minSize !== undefined && typeof n.minSize !== "number") return false;
      if (n.maxSize !== undefined && typeof n.maxSize !== "number") return false;
      return true;
    }
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
      const value = (snap as { literal?: unknown; value?: unknown }).literal ?? (snap as { value?: unknown }).value ?? (any as { literal?: unknown; value?: unknown }).literal ?? (any as { value?: unknown }).value;
      if (value === undefined) throw new Error("Unsupported literal schema without value");
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
        return { type: "literal", value };
      }
      throw new Error("Only JSON-serializable literal values are supported");
    }
    case "picklist": {
      const options = (snap as { options?: unknown[] }).options ?? (any as { options?: unknown[] }).options;
      if (!Array.isArray(options)) throw new Error("Unsupported picklist schema: missing options");
      const out: Array<string | number | boolean | null> = [];
      for (const val of options) {
        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean" || val === null) out.push(val as never);
        else throw new Error("Unsupported picklist value type");
      }
      return { type: "enum", values: out };
    }
    case "array": {
      return encodeArray(any);
    }
    case "object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") {
        throw new Error("Unsupported object schema: missing entries");
      }
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) throw new Error(`Unsupported object schema: invalid entry for key '${key}'`);
        const encoded = encodeNode(sub);
        out[key] = encoded;
        if (encoded.type === "optional") optionalKeys.push(key);
      }
      return optionalKeys.length > 0 ? { type: "object", entries: out, optionalKeys } : { type: "object", entries: out };
    }
    case "loose_object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") throw new Error("Unsupported loose_object: missing entries");
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) throw new Error(`Unsupported loose_object: invalid entry for key '${key}'`);
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return { type: "object" as const, entries: out, policy: "loose" as const, optionalKeys };
      }
      return { type: "object" as const, entries: out, policy: "loose" as const };
    }
    case "strict_object": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      if (!entries || typeof entries !== "object") throw new Error("Unsupported strict_object: missing entries");
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) throw new Error(`Unsupported strict_object: invalid entry for key '${key}`);
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return { type: "object" as const, entries: out, policy: "strict" as const, optionalKeys };
      }
      return { type: "object" as const, entries: out, policy: "strict" as const };
    }
    case "object_with_rest": {
      const entries = (any as { entries?: Record<string, unknown> }).entries;
      const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
      if (!entries || typeof entries !== "object") throw new Error("Unsupported object_with_rest: missing entries");
      if (!rest) throw new Error("Unsupported object_with_rest: missing rest");
      const out: Record<string, SchemaNode> = {};
      const optionalKeys: string[] = [];
      for (const key of Object.keys(entries)) {
        const sub = entries[key] as AnySchema | undefined;
        if (!sub) throw new Error(`Unsupported object_with_rest: invalid entry for key '${key}`);
        const enc = encodeNode(sub);
        out[key] = enc;
        if (enc.type === "optional") optionalKeys.push(key);
      }
      if (optionalKeys.length > 0) {
        return { type: "object" as const, entries: out, rest: encodeNode(rest), optionalKeys };
      }
      return { type: "object" as const, entries: out, rest: encodeNode(rest) };
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
    case "nullish": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as AnySchema | undefined;
      if (!wrapped) throw new Error("Unsupported nullish schema: missing wrapped schema");
      return { type: "nullish", base: encodeNode(wrapped) };
    }
    case "union": {
      const options = (any as { options?: unknown[] }).options as AnySchema[] | undefined;
      if (!Array.isArray(options)) throw new Error("Unsupported union schema: missing options");
      const enc = options.map((o) => encodeNode(o));
      const literals = enc.every((n) => n.type === "literal");
      if (literals) {
        return { type: "enum", values: enc.map((n) => (n as { type: "literal"; value: unknown }).value as never) };
      }
      return { type: "union", options: enc };
    }
    case "tuple": {
      const items = (any as { items?: unknown[] }).items as AnySchema[] | undefined;
      if (!Array.isArray(items)) throw new Error("Unsupported tuple schema: missing items");
      return { type: "tuple", items: items.map((i) => encodeNode(i)) };
    }
    case "tuple_with_rest": {
      const items = (any as { items?: unknown[] }).items as AnySchema[] | undefined;
      const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
      if (!Array.isArray(items)) throw new Error("Unsupported tuple_with_rest schema: missing items");
      if (!rest) throw new Error("Unsupported tuple_with_rest schema: missing rest");
      return { type: "tuple", items: items.map((i) => encodeNode(i)), rest: encodeNode(rest) };
    }
    case "record": {
      const key = (any as { key?: unknown }).key as AnySchema | undefined;
      const value = (any as { value?: unknown }).value as AnySchema | undefined;
      if (!key || !value) throw new Error("Unsupported record schema: missing key/value");
      return { type: "record", key: encodeNode(key), value: encodeNode(value) };
    }
    case "enum": {
      const values = ((any as { options?: unknown[] }).options as unknown[]) ?? ((any as { enum?: unknown[] }).enum as unknown[]);
      if (!Array.isArray(values)) throw new Error("Unsupported enum schema: missing options");
      const out: Array<string | number | boolean | null> = [];
      for (const val of values) {
        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean" || val === null) out.push(val as never);
        else throw new Error("Unsupported enum value type");
      }
      return { type: "enum", values: out };
    }
    case "set": {
      return encodeSet(any as never);
    }
    case "map": {
      return encodeMap(any as never);
    }
    default:
      throw new Error(`Unsupported schema type for serialization: ${String(type)}`);
  }
}

function encodeString(any: { pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const node: { type: "string"; minLength?: number; maxLength?: number; length?: number; pattern?: string; patternFlags?: string; email?: true; rfcEmail?: true; url?: true; uuid?: true; ip?: true; ipv4?: true; ipv6?: true; hexColor?: true; slug?: true; startsWith?: string; endsWith?: string } = { type: "string" };
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
        case "length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.length = req;
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
        case "email":
          node.email = true; break;
        case "rfc_email":
          node.rfcEmail = true; break;
        case "url":
          node.url = true; break;
        case "uuid":
          node.uuid = true; break;
        case "ip":
          node.ip = true; break;
        case "ipv4":
          node.ipv4 = true; break;
        case "ipv6":
          node.ipv6 = true; break;
        case "hex_color":
          node.hexColor = true; break;
        case "slug":
          node.slug = true; break;
        case "starts_with": {
          const req = step.requirement as string | undefined;
          if (typeof req === "string") node.startsWith = req;
          break;
        }
        case "ends_with": {
          const req = step.requirement as string | undefined;
          if (typeof req === "string") node.endsWith = req;
          break;
        }
      }
    }
  }
  return node;
}

function encodeNumber(any: { pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const node: { type: "number"; min?: number; max?: number; gt?: number; lt?: number; integer?: true; safeInteger?: true; multipleOf?: number; finite?: true } = { type: "number" };
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
        case "gt_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.gt = req;
          break;
        }
        case "lt_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.lt = req;
          break;
        }
        case "integer":
          node.integer = true; break;
        case "safe_integer":
          node.safeInteger = true; break;
        case "multiple_of": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.multipleOf = req;
          break;
        }
        case "finite":
          node.finite = true; break;
      }
    }
  }
  return node;
}

function encodeArray(any: { item?: unknown; pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const child = (any as { item?: unknown }).item as AnySchema | undefined;
  if (!child) throw new Error("Unsupported array schema: missing item schema");
  const node: { type: "array"; item: SchemaNode; minLength?: number; maxLength?: number; length?: number } = { type: "array", item: encodeNode(child) };
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
        case "length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.length = req;
          break;
        }
      }
    }
  }
  return node;
}

function encodeSet(any: { value?: unknown; pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!value) throw new Error("Unsupported set schema: missing value");
  const node: { type: "set"; value: SchemaNode; minSize?: number; maxSize?: number } = { type: "set", value: encodeNode(value) };
  const pipe = (any as { pipe?: unknown[] }).pipe as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.minSize = req;
          break;
        }
        case "max_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.maxSize = req;
          break;
        }
      }
    }
  }
  return node;
}

function encodeMap(any: { key?: unknown; value?: unknown; pipe?: unknown[] } & Record<string, unknown>): SchemaNode {
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) throw new Error("Unsupported map schema: missing key/value");
  const node: { type: "map"; key: SchemaNode; value: SchemaNode; minSize?: number; maxSize?: number } = { type: "map", key: encodeNode(key), value: encodeNode(value) };
  const pipe = (any as { pipe?: unknown[] }).pipe as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.minSize = req;
          break;
        }
        case "max_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.maxSize = req;
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
      return decodeArray(node);
    case "object": {
      const shape: Record<string, AnySchema> = {};
      for (const key of Object.keys(node.entries)) {
        shape[key] = decodeNode(node.entries[key]);
      }
      if (node.rest) {
        return v.objectWithRest(shape, decodeNode(node.rest) as never);
      }
      if (node.policy === "strict") return v.strictObject(shape);
      if (node.policy === "loose") return v.looseObject(shape);
      return v.object(shape);
    }
    case "optional":
      return v.optional(decodeNode(node.base));
    case "nullable":
      return v.nullable(decodeNode(node.base));
    case "nullish":
      return v.nullish(decodeNode(node.base));
    case "union":
      return v.union(node.options.map((o) => decodeNode(o)) as never);
    case "tuple":
      if (node.rest) {
        return v.tupleWithRest(node.items.map((i) => decodeNode(i)) as never, decodeNode(node.rest) as never);
      }
      return v.tuple(node.items.map((i) => decodeNode(i)) as never);
    case "record":
      return v.record(decodeNode(node.key) as never, decodeNode(node.value) as never);
    case "enum": {
      const literals = node.values.map((val) => v.literal(val as never));
      return v.union(literals as never);
    }
    case "set":
      return decodeSet(node);
    case "map":
      return decodeMap(node);
    default:
      throw new Error(`Unsupported node type: ${(node as { type: string }).type}`);
  }
}

function decodeString(node: Extract<SchemaNode, { type: "string" }>): AnySchema {
  const s = v.string();
  const validators: unknown[] = [];
  if (node.email) validators.push(v.email());
  if (node.rfcEmail) validators.push(v.rfcEmail());
  if (node.url) validators.push(v.url());
  if (node.uuid) validators.push(v.uuid());
  if (node.ip) validators.push(v.ip());
  if (node.ipv4) validators.push(v.ipv4());
  if (node.ipv6) validators.push(v.ipv6());
  if (node.hexColor) validators.push(v.hexColor());
  if (node.slug) validators.push(v.slug());
  if (node.minLength !== undefined) {
    validators.push(v.minLength(node.minLength));
  }
  if (node.maxLength !== undefined) {
    validators.push(v.maxLength(node.maxLength));
  }
  if (node.length !== undefined) {
    validators.push(v.length(node.length));
  }
  if (node.pattern) {
    const re = new RegExp(node.pattern, node.patternFlags ?? undefined);
    validators.push(v.regex(re));
  }
  if (node.startsWith !== undefined) validators.push(v.startsWith(node.startsWith));
  if (node.endsWith !== undefined) validators.push(v.endsWith(node.endsWith));
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
  if (node.gt !== undefined) validators.push(v.gtValue(node.gt));
  if (node.lt !== undefined) validators.push(v.ltValue(node.lt));
  if (node.integer) validators.push(v.integer());
  if (node.safeInteger) validators.push(v.safeInteger());
  if (node.multipleOf !== undefined) validators.push(v.multipleOf(node.multipleOf));
  if (node.finite) validators.push(v.finite());
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

function decodeArray(node: Extract<SchemaNode, { type: "array" }>): AnySchema {
  const base = v.array(decodeNode(node.item));
  const validators: unknown[] = [];
  if (node.minLength !== undefined) validators.push(v.minLength(node.minLength));
  if (node.maxLength !== undefined) validators.push(v.maxLength(node.maxLength));
  if (node.length !== undefined) validators.push(v.length(node.length));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(base, validators[0] as never, validators[1] as never, validators[2] as never);
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}

function decodeSet(node: Extract<SchemaNode, { type: "set" }>): AnySchema {
  const base = v.set(decodeNode(node.value) as never);
  const validators: unknown[] = [];
  if (node.minSize !== undefined) validators.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) validators.push(v.maxSize(node.maxSize));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(base, validators[0] as never, validators[1] as never, validators[2] as never);
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}

function decodeMap(node: Extract<SchemaNode, { type: "map" }>): AnySchema {
  const base = v.map(decodeNode(node.key) as never, decodeNode(node.value) as never);
  const validators: unknown[] = [];
  if (node.minSize !== undefined) validators.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) validators.push(v.maxSize(node.maxSize));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(base, validators[0] as never, validators[1] as never, validators[2] as never);
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}

export { FORMAT_VERSION } from "./types.ts";
export type { SchemaNode, SerializedSchema } from "./types.ts";
