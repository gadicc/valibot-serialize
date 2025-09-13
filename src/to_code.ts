import { isSerializedSchema } from "./guard.ts";
import type { SchemaNode, SerializedSchema } from "./types.ts";

// Generate minimal Valibot builder code from a SerializedSchema.
// Returns a compact expression string ending with a semicolon, e.g.:
//   v.object({email:v.string(),password:v.string()});
export function toCode(serialized: SerializedSchema): string {
  if (!isSerializedSchema(serialized)) {
    throw new Error("Invalid serialized schema format");
  }
  return nodeToCode(serialized.node) + ";";
}

function nodeToCode(node: SchemaNode): string {
  switch (node.type) {
    case "string":
      return stringToCode(node);
    case "number":
      return numberToCode(node);
    case "boolean":
      return "v.boolean()";
    case "date":
      return "v.date()";
    case "blob":
      return blobToCode(node);
    case "file":
      return fileToCode(node);
    case "literal":
      return `v.literal(${literal(node.value)})`;
    case "array":
      return arrayToCode(node);
    case "object":
      return objectToCode(node);
    case "optional":
      return `v.optional(${nodeToCode(node.base)})`;
    case "nullable":
      return `v.nullable(${nodeToCode(node.base)})`;
    case "nullish":
      return `v.nullish(${nodeToCode(node.base)})`;
    case "union":
      return `v.union([${node.options.map((o) => nodeToCode(o)).join(",")}])`;
    case "tuple": {
      const items = `[${node.items.map((i) => nodeToCode(i)).join(",")}]`;
      if (node.rest) {
        return `v.tupleWithRest(${items},${nodeToCode(node.rest)})`;
      }
      return `v.tuple(${items})`;
    }
    case "record":
      return `v.record(${nodeToCode(node.key)},${nodeToCode(node.value)})`;
    case "enum": {
      const allStrings = node.values.every((v) => typeof v === "string");
      if (allStrings) return `v.picklist(${JSON.stringify(node.values)})`;
      const lits = node.values.map((v) => `v.literal(${literal(v)})`).join(",");
      return `v.union([${lits}])`;
    }
    case "set":
      return setToCode(node);
    case "map":
      return mapToCode(node);
    default:
      return neverType(node as { type: string });
  }
}

function stringToCode(node: Extract<SchemaNode, { type: "string" }>): string {
  const base = "v.string()";
  const validators: string[] = [];
  if (node.email) validators.push("v.email()");
  if (node.rfcEmail) validators.push("v.rfcEmail()");
  if (node.url) validators.push("v.url()");
  if (node.uuid) validators.push("v.uuid()");
  if (node.ip) validators.push("v.ip()");
  if (node.ipv4) validators.push("v.ipv4()");
  if (node.ipv6) validators.push("v.ipv6()");
  if (node.hexColor) validators.push("v.hexColor()");
  if (node.slug) validators.push("v.slug()");
  if (node.creditCard) validators.push("v.creditCard()");
  if (node.imei) validators.push("v.imei()");
  if (node.mac) validators.push("v.mac()");
  if (node.mac48) validators.push("v.mac48()");
  if (node.mac64) validators.push("v.mac64()");
  if (node.base64) validators.push("v.base64()");
  if (node.minLength !== undefined) {
    validators.push(`v.minLength(${node.minLength})`);
  }
  if (node.maxLength !== undefined) {
    validators.push(`v.maxLength(${node.maxLength})`);
  }
  if (node.length !== undefined) validators.push(`v.length(${node.length})`);
  if (node.pattern !== undefined) {
    validators.push(
      `v.regex(${regexLiteral(node.pattern, node.patternFlags)})`,
    );
  }
  if (node.startsWith !== undefined) {
    validators.push(`v.startsWith(${JSON.stringify(node.startsWith)})`);
  }
  if (node.endsWith !== undefined) {
    validators.push(`v.endsWith(${JSON.stringify(node.endsWith)})`);
  }

  const extras: string[] = [];
  if (node.isoDate) extras.push("v.isoDate()");
  if (node.isoDateTime) extras.push("v.isoDateTime()");
  if (node.isoTime) extras.push("v.isoTime()");
  if (node.isoTimeSecond) extras.push("v.isoTimeSecond()");
  if (node.isoTimestamp) extras.push("v.isoTimestamp()");
  if (node.isoWeek) extras.push("v.isoWeek()");
  if (node.digits) extras.push("v.digits()");
  if (node.emoji) extras.push("v.emoji()");
  if (node.hexadecimal) extras.push("v.hexadecimal()");
  if (node.minGraphemes !== undefined) {
    extras.push(`v.minGraphemes(${node.minGraphemes})`);
  }
  if (node.maxGraphemes !== undefined) {
    extras.push(`v.maxGraphemes(${node.maxGraphemes})`);
  }
  if (node.ulid) extras.push("v.ulid()");
  if (node.nanoid) extras.push("v.nanoid()");
  if (node.cuid2) extras.push("v.cuid2()");

  const transforms: string[] = [];
  if (node.transforms && node.transforms.length > 0) {
    for (const t of node.transforms) {
      switch (t) {
        case "trim":
          transforms.push("v.trim()");
          break;
        case "trimStart":
          transforms.push("v.trimStart()");
          break;
        case "trimEnd":
          transforms.push("v.trimEnd()");
          break;
        case "toUpperCase":
          transforms.push("v.toUpperCase()");
          break;
        case "toLowerCase":
          transforms.push("v.toLowerCase()");
          break;
        case "normalize":
          transforms.push("v.normalize()");
          break;
      }
    }
  }

  const pipes = [...validators, ...extras, ...transforms];
  if (pipes.length === 0) return base;
  return `v.pipe(${base},${pipes.join(",")})`;
}

function numberToCode(node: Extract<SchemaNode, { type: "number" }>): string {
  const base = "v.number()";
  const validators: string[] = [];
  if (node.min !== undefined) validators.push(`v.minValue(${node.min})`);
  if (node.max !== undefined) validators.push(`v.maxValue(${node.max})`);
  if (node.gt !== undefined) validators.push(`v.gtValue(${node.gt})`);
  if (node.lt !== undefined) validators.push(`v.ltValue(${node.lt})`);
  if (node.integer) validators.push("v.integer()");
  if (node.safeInteger) validators.push("v.safeInteger()");
  if (node.multipleOf !== undefined) {
    validators.push(`v.multipleOf(${node.multipleOf})`);
  }
  if (node.finite) validators.push("v.finite()");
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
}

function fileToCode(node: Extract<SchemaNode, { type: "file" }>): string {
  const base = "v.file()";
  const items: string[] = [];
  if (node.minSize !== undefined) items.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) items.push(`v.maxSize(${node.maxSize})`);
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    items.push(`v.mimeType(${JSON.stringify(node.mimeTypes)})`);
  }
  if (items.length === 0) return base;
  return `v.pipe(${base},${items.join(",")})`;
}

function blobToCode(node: Extract<SchemaNode, { type: "blob" }>): string {
  const base = "v.blob()";
  const items: string[] = [];
  if (node.minSize !== undefined) items.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) items.push(`v.maxSize(${node.maxSize})`);
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    items.push(`v.mimeType(${JSON.stringify(node.mimeTypes)})`);
  }
  if (items.length === 0) return base;
  return `v.pipe(${base},${items.join(",")})`;
}

function arrayToCode(node: Extract<SchemaNode, { type: "array" }>): string {
  const base = `v.array(${nodeToCode(node.item)})`;
  const validators: string[] = [];
  if (node.minLength !== undefined) {
    validators.push(`v.minLength(${node.minLength})`);
  }
  if (node.maxLength !== undefined) {
    validators.push(`v.maxLength(${node.maxLength})`);
  }
  if (node.length !== undefined) validators.push(`v.length(${node.length})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
}

function objectToCode(node: Extract<SchemaNode, { type: "object" }>): string {
  const entries = Object.keys(node.entries)
    .map((k) => `${propKey(k)}:${nodeToCode(node.entries[k])}`)
    .join(",");
  let base: string;
  if (node.rest) {
    base = `v.objectWithRest({${entries}},${nodeToCode(node.rest)})`;
  } else if (node.policy === "strict") {
    base = `v.strictObject({${entries}})`;
  } else if (node.policy === "loose") {
    base = `v.looseObject({${entries}})`;
  } else base = `v.object({${entries}})`;
  const validators: string[] = [];
  if (node.minEntries !== undefined) {
    validators.push(`v.minEntries(${node.minEntries})`);
  }
  if (node.maxEntries !== undefined) {
    validators.push(`v.maxEntries(${node.maxEntries})`);
  }
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
}

function setToCode(node: Extract<SchemaNode, { type: "set" }>): string {
  const base = `v.set(${nodeToCode(node.value)})`;
  const validators: string[] = [];
  if (node.minSize !== undefined) validators.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) validators.push(`v.maxSize(${node.maxSize})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
}

function mapToCode(node: Extract<SchemaNode, { type: "map" }>): string {
  const base = `v.map(${nodeToCode(node.key)},${nodeToCode(node.value)})`;
  const validators: string[] = [];
  if (node.minSize !== undefined) validators.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) validators.push(`v.maxSize(${node.maxSize})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
}

function literal(vl: unknown): string {
  switch (typeof vl) {
    case "string":
      return JSON.stringify(vl);
    case "number":
      return Number.isFinite(vl as number) ? String(vl) : "null";
    case "boolean":
      return (vl as boolean) ? "true" : "false";
    case "object":
      return vl === null ? "null" : JSON.stringify(vl);
    default:
      return JSON.stringify(vl);
  }
}

function regexLiteral(pattern: string, flags?: string): string {
  if (pattern === "") {
    return flags && flags.length > 0
      ? `new RegExp(\"\",${JSON.stringify(flags)})`
      : 'new RegExp("")';
  }
  const esc = pattern.replaceAll("/", "\\/");
  return `/${esc}/${flags ?? ""}`;
}

function propKey(k: string): string {
  return /^(?:[$A-Z_a-z][$\w]*)$/.test(k) ? k : JSON.stringify(k);
}

function neverType(n: { type: string }): never {
  throw new Error(`Unsupported node type: ${n.type}`);
}
