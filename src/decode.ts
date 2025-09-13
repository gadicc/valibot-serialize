import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode, SerializedSchema } from "./types.ts";
import { isSerializedSchema } from "./guard.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

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
    case "date":
      return v.date();
    case "blob":
      return decodeBlob(node);
    case "file":
      return decodeFile(node);
    case "literal":
      return v.literal(node.value as never);
    case "array":
      return decodeArray(node);
    case "object": {
      const shape: Record<string, AnySchema> = {};
      for (const key of Object.keys(node.entries)) {
        shape[key] = decodeNode(node.entries[key]);
      }
      let obj: AnySchema;
      if (node.rest) {
        obj = v.objectWithRest(shape, decodeNode(node.rest) as never);
      } else if (node.policy === "strict") obj = v.strictObject(shape);
      else if (node.policy === "loose") obj = v.looseObject(shape);
      else obj = v.object(shape);
      const actions: unknown[] = [];
      if (node.minEntries !== undefined) {
        actions.push(v.minEntries(node.minEntries));
      }
      if (node.maxEntries !== undefined) {
        actions.push(v.maxEntries(node.maxEntries));
      }
      if (actions.length > 0) obj = v.pipe(obj, ...(actions as never[]));
      return obj;
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
        return v.tupleWithRest(
          node.items.map((i) => decodeNode(i)) as never,
          decodeNode(node.rest) as never,
        );
      }
      return v.tuple(node.items.map((i) => decodeNode(i)) as never);
    case "record":
      return v.record(
        decodeNode(node.key) as never,
        decodeNode(node.value) as never,
      );
    case "enum": {
      const literals = node.values.map((val) => v.literal(val as never));
      return v.union(literals as never);
    }
    case "set":
      return decodeSet(node);
    case "map":
      return decodeMap(node);
    default:
      throw new Error(
        `Unsupported node type: ${(node as { type: string }).type}`,
      );
  }
}

function decodeString(
  node: Extract<SchemaNode, { type: "string" }>,
): AnySchema {
  let s = v.string();
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
  if (node.creditCard) validators.push(v.creditCard());
  if (node.imei) validators.push(v.imei());
  if (node.mac) validators.push(v.mac());
  if (node.mac48) validators.push(v.mac48());
  if (node.mac64) validators.push(v.mac64());
  if (node.base64) validators.push(v.base64());
  // minWords/maxWords are captured in AST and reflected in toJsonSchema via patterns,
  // but are not re-applied here due to Valibot signature typing differences.
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
  if (node.startsWith !== undefined) {
    validators.push(v.startsWith(node.startsWith));
  }
  if (node.endsWith !== undefined) validators.push(v.endsWith(node.endsWith));
  if (validators.length > 0) {
    s = v.pipe(s, ...(validators as never[]));
  }
  // Additional string-only validators that do not take requirements
  const extra: unknown[] = [];
  if (node.isoDate) extra.push(v.isoDate());
  if (node.isoDateTime) extra.push(v.isoDateTime());
  if (node.isoTime) extra.push(v.isoTime());
  if (node.isoTimeSecond) extra.push(v.isoTimeSecond());
  if (node.isoTimestamp) extra.push(v.isoTimestamp());
  if (node.digits) extra.push(v.digits());
  if (node.emoji) extra.push(v.emoji());
  if (node.hexadecimal) extra.push(v.hexadecimal());
  if (node.minGraphemes !== undefined) {
    extra.push(v.minGraphemes(node.minGraphemes));
  }
  if (node.maxGraphemes !== undefined) {
    extra.push(v.maxGraphemes(node.maxGraphemes));
  }
  if (extra.length > 0) {
    s = v.pipe(s, ...(extra as never[]));
  }
  if (node.transforms && node.transforms.length > 0) {
    const items: unknown[] = [];
    for (const t of node.transforms) {
      switch (t) {
        case "trim":
          items.push(v.trim());
          break;
        case "trimStart":
          items.push(v.trimStart());
          break;
        case "trimEnd":
          items.push(v.trimEnd());
          break;
        case "toUpperCase":
          items.push(v.toUpperCase());
          break;
        case "toLowerCase":
          items.push(v.toLowerCase());
          break;
        case "normalize":
          items.push(v.normalize());
          break;
      }
    }
    if (items.length > 0) {
      s = v.pipe(s, ...(items as never[]));
    }
  }
  return s;
}

function decodeNumber(
  node: Extract<SchemaNode, { type: "number" }>,
): AnySchema {
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
  if (node.multipleOf !== undefined) {
    validators.push(v.multipleOf(node.multipleOf));
  }
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
  if (node.minLength !== undefined) {
    validators.push(v.minLength(node.minLength));
  }
  if (node.maxLength !== undefined) {
    validators.push(v.maxLength(node.maxLength));
  }
  if (node.length !== undefined) validators.push(v.length(node.length));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(
        base,
        validators[0] as never,
        validators[1] as never,
        validators[2] as never,
      );
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}

function decodeFile(node: Extract<SchemaNode, { type: "file" }>): AnySchema {
  let f = v.file();
  const actions: unknown[] = [];
  if (node.minSize !== undefined) actions.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) actions.push(v.maxSize(node.maxSize));
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    const mimeType =
      (v as unknown as { mimeType: (req: string[] | string) => unknown })
        .mimeType;
    actions.push(mimeType(node.mimeTypes));
  }
  if (actions.length > 0) f = v.pipe(f, ...(actions as never[]));
  return f;
}

function decodeBlob(node: Extract<SchemaNode, { type: "blob" }>): AnySchema {
  let b = v.blob();
  const items: unknown[] = [];
  if (node.minSize !== undefined) items.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) items.push(v.maxSize(node.maxSize));
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    const mimeType =
      (v as unknown as { mimeType: (req: string[] | string) => unknown })
        .mimeType;
    items.push(mimeType(node.mimeTypes));
  }
  if (items.length > 0) b = v.pipe(b, ...(items as never[]));
  return b;
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
      return v.pipe(
        base,
        validators[0] as never,
        validators[1] as never,
        validators[2] as never,
      );
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}

function decodeMap(node: Extract<SchemaNode, { type: "map" }>): AnySchema {
  const base = v.map(
    decodeNode(node.key) as never,
    decodeNode(node.value) as never,
  );
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
      return v.pipe(
        base,
        validators[0] as never,
        validators[1] as never,
        validators[2] as never,
      );
    default:
      return v.pipe(base, ...(validators as never[]));
  }
}
