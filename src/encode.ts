import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "./types.ts";

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
  switch (type) {
    case "string":
      return encodeString(any);
    case "number":
      return encodeNumber(any);
    case "boolean":
      return { type: "boolean" };
    case "date":
      return { type: "date" };
    case "file":
      return encodeFile(any as never);
    case "blob":
      return encodeBlob(any as never);
    case "literal": {
      const value = (snap as { literal?: unknown; value?: unknown }).literal ??
        (snap as { value?: unknown }).value ??
        (any as { literal?: unknown; value?: unknown }).literal ??
        (any as { value?: unknown }).value;
      if (value === undefined) {
        throw new Error("Unsupported literal schema without value");
      }
      if (
        typeof value === "string" || typeof value === "number" ||
        typeof value === "boolean" || value === null
      ) {
        return { type: "literal", value };
      }
      throw new Error("Only JSON-serializable literal values are supported");
    }
    case "picklist": {
      const options = (snap as { options?: unknown[] }).options ??
        (any as { options?: unknown[] }).options;
      if (!Array.isArray(options)) {
        throw new Error("Unsupported picklist schema: missing options");
      }
      const out: Array<string | number | boolean | null> = [];
      for (const val of options) {
        const t = typeof val;
        if (
          t === "string" || t === "number" || t === "boolean" || val === null
        ) out.push(val as never);
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
        if (!sub) {
          throw new Error(
            `Unsupported object schema: invalid entry for key '${key}'`,
          );
        }
        const encoded = encodeNode(sub);
        out[key] = encoded;
        if (encoded.type === "optional") optionalKeys.push(key);
      }
      const nodeObj: {
        type: "object";
        entries: Record<string, SchemaNode>;
        optionalKeys?: string[];
        minEntries?: number;
        maxEntries?: number;
      } = { type: "object", entries: out };
      if (optionalKeys.length > 0) nodeObj.optionalKeys = optionalKeys;
      const pipe = (any as { pipe?: unknown[] }).pipe as
        | Array<Record<string, unknown>>
        | undefined;
      if (Array.isArray(pipe)) {
        for (const step of pipe) {
          if (!step || typeof step !== "object") continue;
          if (step.kind !== "validation") continue;
          switch (step.type) {
            case "min_entries": {
              const req = step.requirement as number | undefined;
              if (typeof req === "number") nodeObj.minEntries = req;
              break;
            }
            case "max_entries": {
              const req = step.requirement as number | undefined;
              if (typeof req === "number") nodeObj.maxEntries = req;
              break;
            }
          }
        }
      }
      return nodeObj;
    }
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
    case "optional": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as
        | AnySchema
        | undefined;
      if (!wrapped) {
        throw new Error("Unsupported optional schema: missing wrapped schema");
      }
      return { type: "optional", base: encodeNode(wrapped) };
    }
    case "nullable": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as
        | AnySchema
        | undefined;
      if (!wrapped) {
        throw new Error("Unsupported nullable schema: missing wrapped schema");
      }
      return { type: "nullable", base: encodeNode(wrapped) };
    }
    case "nullish": {
      const wrapped = (any as { wrapped?: unknown }).wrapped as
        | AnySchema
        | undefined;
      if (!wrapped) {
        throw new Error("Unsupported nullish schema: missing wrapped schema");
      }
      return { type: "nullish", base: encodeNode(wrapped) };
    }
    case "union": {
      const options = (any as { options?: unknown[] }).options as
        | AnySchema[]
        | undefined;
      if (!Array.isArray(options)) {
        throw new Error("Unsupported union schema: missing options");
      }
      const enc = options.map((o) => encodeNode(o));
      const literals = enc.every((n) => n.type === "literal");
      if (literals) {
        return {
          type: "enum",
          values: enc.map((n) =>
            (n as { type: "literal"; value: unknown }).value as never
          ),
        };
      }
      return { type: "union", options: enc };
    }
    case "tuple": {
      const items = (any as { items?: unknown[] }).items as
        | AnySchema[]
        | undefined;
      if (!Array.isArray(items)) {
        throw new Error("Unsupported tuple schema: missing items");
      }
      return { type: "tuple", items: items.map((i) => encodeNode(i)) };
    }
    case "tuple_with_rest": {
      const items = (any as { items?: unknown[] }).items as
        | AnySchema[]
        | undefined;
      const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
      if (!Array.isArray(items)) {
        throw new Error("Unsupported tuple_with_rest schema: missing items");
      }
      if (!rest) {
        throw new Error("Unsupported tuple_with_rest schema: missing rest");
      }
      return {
        type: "tuple",
        items: items.map((i) => encodeNode(i)),
        rest: encodeNode(rest),
      };
    }
    case "record": {
      const key = (any as { key?: unknown }).key as AnySchema | undefined;
      const value = (any as { value?: unknown }).value as AnySchema | undefined;
      if (!key || !value) {
        throw new Error("Unsupported record schema: missing key/value");
      }
      return { type: "record", key: encodeNode(key), value: encodeNode(value) };
    }
    case "enum": {
      const values = ((any as { options?: unknown[] }).options as unknown[]) ??
        ((any as { enum?: unknown[] }).enum as unknown[]);
      if (!Array.isArray(values)) {
        throw new Error("Unsupported enum schema: missing options");
      }
      const out: Array<string | number | boolean | null> = [];
      for (const val of values) {
        const t = typeof val;
        if (
          t === "string" || t === "number" || t === "boolean" || val === null
        ) out.push(val as never);
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
      throw new Error(
        `Unsupported schema type for serialization: ${String(type)}`,
      );
  }
}

function encodeString(
  any: { pipe?: unknown[] } & Record<string, unknown>,
): SchemaNode {
  const node: {
    type: "string";
    minLength?: number;
    maxLength?: number;
    length?: number;
    pattern?: string;
    patternFlags?: string;
    email?: true;
    rfcEmail?: true;
    url?: true;
    uuid?: true;
    ip?: true;
    ipv4?: true;
    ipv6?: true;
    hexColor?: true;
    slug?: true;
    creditCard?: true;
    imei?: true;
    mac?: true;
    mac48?: true;
    mac64?: true;
    base64?: true;
    ulid?: true;
    nanoid?: true;
    cuid2?: true;
    isoDate?: true;
    isoDateTime?: true;
    isoTime?: true;
    isoTimeSecond?: true;
    isoTimestamp?: true;
    isoWeek?: true;
    digits?: true;
    emoji?: true;
    hexadecimal?: true;
    minGraphemes?: number;
    maxGraphemes?: number;
    startsWith?: string;
    endsWith?: string;
    transforms?: Array<
      | "trim"
      | "trimStart"
      | "trimEnd"
      | "toUpperCase"
      | "toLowerCase"
      | "normalize"
    >;
  } = { type: "string" };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind === "validation") {
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
            node.email = true;
            break;
          case "rfc_email":
            node.rfcEmail = true;
            break;
          case "url":
            node.url = true;
            break;
          case "uuid":
            node.uuid = true;
            break;
          case "ip":
            node.ip = true;
            break;
          case "ipv4":
            node.ipv4 = true;
            break;
          case "ipv6":
            node.ipv6 = true;
            break;
          case "hex_color":
            node.hexColor = true;
            break;
          case "slug":
            node.slug = true;
            break;
          case "credit_card":
            node.creditCard = true;
            break;
          case "imei":
            node.imei = true;
            break;
          case "mac":
            node.mac = true;
            break;
          case "mac48":
            node.mac48 = true;
            break;
          case "mac64":
            node.mac64 = true;
            break;
          case "base64":
            node.base64 = true;
            break;
          case "ulid":
            node.ulid = true;
            break;
          case "nanoid":
            node.nanoid = true;
            break;
          case "cuid2":
            node.cuid2 = true;
            break;
          case "iso_date":
            node.isoDate = true;
            break;
          case "iso_date_time":
            node.isoDateTime = true;
            break;
          case "iso_time":
            node.isoTime = true;
            break;
          case "iso_time_second":
            node.isoTimeSecond = true;
            break;
          case "iso_timestamp":
            node.isoTimestamp = true;
            break;
          case "iso_week":
            node.isoWeek = true;
            break;
          case "digits":
            node.digits = true;
            break;
          case "emoji":
            node.emoji = true;
            break;
          case "hexadecimal":
            node.hexadecimal = true;
            break;
          case "min_graphemes": {
            const req = step.requirement as number | undefined;
            if (typeof req === "number") node.minGraphemes = req;
            break;
          }
          case "max_graphemes": {
            const req = step.requirement as number | undefined;
            if (typeof req === "number") node.maxGraphemes = req;
            break;
          }
          case "min_words": {
            const req = (step as { locales?: unknown }).locales as
              | number
              | undefined;
            if (typeof req === "number") {
              (node as { minWords?: number }).minWords = req;
            }
            break;
          }
          case "max_words": {
            const req = (step as { locales?: unknown }).locales as
              | number
              | undefined;
            if (typeof req === "number") {
              (node as { maxWords?: number }).maxWords = req;
            }
            break;
          }
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
      } else if (step.kind === "transformation") {
        switch (step.type) {
          case "trim":
            (node.transforms ??= []).push("trim");
            break;
          case "trim_start":
            (node.transforms ??= []).push("trimStart");
            break;
          case "trim_end":
            (node.transforms ??= []).push("trimEnd");
            break;
          case "to_upper_case":
            (node.transforms ??= []).push("toUpperCase");
            break;
          case "to_lower_case":
            (node.transforms ??= []).push("toLowerCase");
            break;
          case "normalize":
            (node.transforms ??= []).push("normalize");
            break;
        }
      }
    }
  }
  return node;
}

function encodeFile(any: Record<string, unknown>): SchemaNode {
  const node: {
    type: "file";
    minSize?: number;
    maxSize?: number;
    mimeTypes?: string[];
  } = { type: "file" };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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
        case "mime_type": {
          const req = step.requirement as string[] | undefined;
          if (Array.isArray(req)) node.mimeTypes = req;
          break;
        }
      }
    }
  }
  return node;
}

function encodeBlob(any: Record<string, unknown>): SchemaNode {
  const node: {
    type: "blob";
    minSize?: number;
    maxSize?: number;
    mimeTypes?: string[];
  } = { type: "blob" };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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
        case "mime_type": {
          const req = step.requirement as string[] | undefined;
          if (Array.isArray(req)) node.mimeTypes = req;
          break;
        }
      }
    }
  }
  return node;
}

function encodeNumber(
  any: { pipe?: unknown[] } & Record<string, unknown>,
): SchemaNode {
  const node: {
    type: "number";
    min?: number;
    max?: number;
    gt?: number;
    lt?: number;
    integer?: true;
    safeInteger?: true;
    multipleOf?: number;
    finite?: true;
  } = { type: "number" };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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
          node.integer = true;
          break;
        case "safe_integer":
          node.safeInteger = true;
          break;
        case "multiple_of": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.multipleOf = req;
          break;
        }
        case "finite":
          node.finite = true;
          break;
      }
    }
  }
  return node;
}

function encodeArray(
  any: { item?: unknown; pipe?: unknown[] } & Record<string, unknown>,
): SchemaNode {
  const child = (any as { item?: unknown }).item as AnySchema | undefined;
  if (!child) throw new Error("Unsupported array schema: missing item schema");
  const node: {
    type: "array";
    item: SchemaNode;
    minLength?: number;
    maxLength?: number;
    length?: number;
  } = { type: "array", item: encodeNode(child) };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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
        case "non_empty": {
          node.minLength = Math.max(1, node.minLength ?? 0);
          break;
        }
      }
    }
  }
  return node;
}

function encodeSet(
  any: { value?: unknown; pipe?: unknown[] } & Record<string, unknown>,
): SchemaNode {
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!value) throw new Error("Unsupported set schema: missing value");
  const node: {
    type: "set";
    value: SchemaNode;
    minSize?: number;
    maxSize?: number;
  } = { type: "set", value: encodeNode(value) };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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

function encodeMap(
  any:
    & { key?: unknown; value?: unknown; pipe?: unknown[] }
    & Record<string, unknown>,
): SchemaNode {
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) {
    throw new Error("Unsupported map schema: missing key/value");
  }
  const node: {
    type: "map";
    key: SchemaNode;
    value: SchemaNode;
    minSize?: number;
    maxSize?: number;
  } = { type: "map", key: encodeNode(key), value: encodeNode(value) };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
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
