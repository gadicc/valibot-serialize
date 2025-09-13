import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import { escapeRegex, unescapeRegex } from "../regex_utils.ts";
import { detect, patterns as pat } from "../patterns.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Identifier for this type module
export const typeName = "string" as const;

// Whether a Valibot schema snapshot refers to a string builder
export function matchesValibotType(
  any: { type?: string } & Record<string, unknown>,
): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as {
    type?: string;
  }).type;
  return type === typeName;
}

// Encode: Valibot string schema -> SchemaNode("string")
export const encode: Encoder<"string"> = function encodeString(
  any,
): Extract<SchemaNode, { type: "string" }> {
  const node: Extract<SchemaNode, { type: "string" }> = { type: "string" };
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
            (node as { creditCard?: true }).creditCard = true;
            break;
          case "imei":
            (node as { imei?: true }).imei = true;
            break;
          case "mac":
            (node as { mac?: true }).mac = true;
            break;
          case "mac48":
            (node as { mac48?: true }).mac48 = true;
            break;
          case "mac64":
            (node as { mac64?: true }).mac64 = true;
            break;
          case "base64":
            (node as { base64?: true }).base64 = true;
            break;
          case "ulid":
            (node as { ulid?: true }).ulid = true;
            break;
          case "nanoid":
            (node as { nanoid?: true }).nanoid = true;
            break;
          case "cuid2":
            (node as { cuid2?: true }).cuid2 = true;
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
};

// Decode: SchemaNode("string") -> Valibot schema
export const decode: Decoder<"string"> = function decodeString(
  node,
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
  if ((node as { creditCard?: true }).creditCard) {
    validators.push(v.creditCard());
  }
  if ((node as { imei?: true }).imei) validators.push(v.imei());
  if ((node as { mac?: true }).mac) validators.push(v.mac());
  if ((node as { mac48?: true }).mac48) validators.push(v.mac48());
  if ((node as { mac64?: true }).mac64) validators.push(v.mac64());
  if ((node as { base64?: true }).base64) validators.push(v.base64());
  if (node.minLength !== undefined) {
    validators.push(v.minLength(node.minLength));
  }
  if (node.maxLength !== undefined) {
    validators.push(v.maxLength(node.maxLength));
  }
  if (node.length !== undefined) validators.push(v.length(node.length));
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
  if ((node as { ulid?: true }).ulid) extra.push(v.ulid());
  if ((node as { nanoid?: true }).nanoid) extra.push(v.nanoid());
  if ((node as { cuid2?: true }).cuid2) extra.push(v.cuid2());
  if (extra.length > 0) s = v.pipe(s, ...(extra as never[]));
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
    if (items.length > 0) s = v.pipe(s, ...(items as never[]));
  }
  return s;
};

// Builder code: SchemaNode("string") -> `v.*` expression
export const toCode: ToCode<"string"> = function stringToCode(node): string {
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
  if ((node as { creditCard?: true }).creditCard) {
    validators.push("v.creditCard()");
  }
  if ((node as { imei?: true }).imei) validators.push("v.imei()");
  if ((node as { mac?: true }).mac) validators.push("v.mac()");
  if ((node as { mac48?: true }).mac48) validators.push("v.mac48()");
  if ((node as { mac64?: true }).mac64) validators.push("v.mac64()");
  if ((node as { base64?: true }).base64) validators.push("v.base64()");
  if (node.minLength !== undefined) {
    validators.push(`v.minLength(${node.minLength})`);
  }
  if (node.maxLength !== undefined) {
    validators.push(`v.maxLength(${node.maxLength})`);
  }
  if (node.length !== undefined) validators.push(`v.length(${node.length})`);
  if (node.pattern !== undefined) {
    validators.push(regexLiteral(node.pattern, node.patternFlags));
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
  if ((node as { ulid?: true }).ulid) extras.push("v.ulid()");
  if ((node as { nanoid?: true }).nanoid) extras.push("v.nanoid()");
  if ((node as { cuid2?: true }).cuid2) extras.push("v.cuid2()");

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
};

// JSON Schema: SchemaNode("string") -> JSON Schema fragment
export const toJsonSchema: ToJsonSchema<"string"> = function stringToJsonSchema(
  node,
): JsonSchema {
  const schema: JsonSchema = { type: "string" };
  if (node.minLength !== undefined) schema.minLength = node.minLength;
  if (node.maxLength !== undefined) schema.maxLength = node.maxLength;
  if (node.length !== undefined) {
    schema.minLength = schema.maxLength = node.length;
  }
  const patternsArr: string[] = [];
  if (node.pattern) patternsArr.push(node.pattern);
  if (node.startsWith) patternsArr.push(`^${escapeRegex(node.startsWith)}.*`);
  if (node.endsWith) patternsArr.push(`.*${escapeRegex(node.endsWith)}$`);
  if (node.hexColor) patternsArr.push(pat.hexColor);
  if (node.slug) patternsArr.push(pat.slug);
  if (node.digits) patternsArr.push(pat.digits);
  if (node.hexadecimal) patternsArr.push(pat.hexadecimal);
  if ((node as { creditCard?: true }).creditCard) {
    patternsArr.push("^[0-9]{12,19}$");
  }
  if ((node as { imei?: true }).imei) patternsArr.push("^\\d{15}$");
  if ((node as { mac?: true }).mac) patternsArr.push(pat.mac);
  if ((node as { mac48?: true }).mac48) patternsArr.push(pat.mac48);
  if ((node as { mac64?: true }).mac64) patternsArr.push(pat.mac64);
  if ((node as { base64?: true }).base64) patternsArr.push(pat.base64);
  if ((node as { ulid?: true }).ulid) patternsArr.push(pat.ulid);
  if ((node as { nanoid?: true }).nanoid) patternsArr.push(pat.nanoid);
  if ((node as { cuid2?: true }).cuid2) patternsArr.push(pat.cuid2);
  if (node.isoDate) patternsArr.push(pat.isoDate);
  if (node.isoTime) patternsArr.push(pat.isoTime);
  if (node.isoTimeSecond) patternsArr.push(pat.isoTimeSecond);
  if (node.isoDateTime || node.isoTimestamp) patternsArr.push(pat.isoDateTime);
  if (node.isoWeek) patternsArr.push(pat.isoWeek);
  if ((node as { minWords?: number }).minWords !== undefined) {
    const n = (node as { minWords: number }).minWords;
    patternsArr.push(`^(?:\\S+\\s+){${Math.max(0, n - 1)}}\\S+(?:\\s+\\S+)*$`);
  }
  if ((node as { maxWords?: number }).maxWords !== undefined) {
    const m = (node as { maxWords: number }).maxWords;
    patternsArr.push(`^\\s*(?:\\S+(?:\\s+|$)){0,${m}}$`);
  }
  if (patternsArr.length === 1) {
    (schema as Record<string, unknown>).pattern = patternsArr[0];
  } else if (patternsArr.length > 1) {
    (schema as Record<string, unknown>).allOf = patternsArr.map((p) => ({
      pattern: p,
    }));
  }
  const formats: string[] = [];
  if (node.email) formats.push("email");
  if (node.url) formats.push("uri");
  if (node.uuid) formats.push("uuid");
  if (node.ipv4) formats.push("ipv4");
  if (node.ipv6) formats.push("ipv6");
  if (node.ip && !node.ipv4 && !node.ipv6) {
    (schema as Record<string, unknown>).anyOf = [
      { type: "string", format: "ipv4" },
      { type: "string", format: "ipv6" },
    ];
  }
  if (formats.length === 1) {
    (schema as Record<string, unknown>).format = formats[0];
  } else if (formats.length > 1) {
    (schema as Record<string, unknown>).anyOf = formats.map((f) => ({
      type: "string",
      format: f,
    }));
  }
  return schema;
};

// From JSON Schema: string-like JSON Schema -> SchemaNode("string") or Date fallback
export const fromJsonSchema: FromJsonSchema = function stringFromJsonSchema(
  schema,
):
  | Extract<SchemaNode, { type: "string" }>
  | Extract<SchemaNode, { type: "date" }> {
  const type = schema.type as string | undefined;
  if (type !== "string") return { type: "string" } as const;
  const node: Extract<SchemaNode, { type: "string" }> = { type: "string" };
  if (typeof schema.minLength === "number") {
    node.minLength = schema.minLength as number;
  }
  if (typeof schema.maxLength === "number") {
    node.maxLength = schema.maxLength as number;
  }
  if (typeof schema.pattern === "string") {
    const p = schema.pattern as string;
    node.pattern = p;
    const starts = p.match(/^\^([^.*+?^${}()|[\]\\]+)\.\*$/);
    if (starts) node.startsWith = unescapeRegex(starts[1]);
    const ends = p.match(/^\.\*([^.*+?^${}()|[\]\\]+)\$$/);
    if (ends) node.endsWith = unescapeRegex(ends[1]);
    if (/^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(p)) {
      node.hexColor = true as never;
    }
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)) node.slug = true as never;
    if (/^[0-9]+$/.test(p)) node.digits = true as never;
    if (/^[0-9A-Fa-f]+$/.test(p)) node.hexadecimal = true as never;
    if (/^[A-Za-z0-9+/]{4}.*=*$/.test(p)) {
      (node as { base64?: true }).base64 = true as never;
    }
    if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(p)) {
      (node as { ulid?: true }).ulid = true as never;
    }
    if (/^[A-Za-z0-9_-]+$/.test(p)) {
      (node as { nanoid?: true }).nanoid = true as never;
    }
    if (/^[a-z0-9]{25}$/.test(p)) {
      (node as { cuid2?: true }).cuid2 = true as never;
    }
    if (detect.hexColor.test(p)) node.hexColor = true as never;
    if (detect.slug.test(p)) node.slug = true as never;
    if (detect.digits.test(p)) node.digits = true as never;
    if (detect.hexadecimal.test(p)) node.hexadecimal = true as never;
    if (detect.base64.test(p)) {
      (node as { base64?: true }).base64 = true as never;
    }
    if (detect.ulid.test(p)) (node as { ulid?: true }).ulid = true as never;
    if (detect.nanoid.test(p)) {
      (node as { nanoid?: true }).nanoid = true as never;
    }
    if (detect.cuid2.test(p)) (node as { cuid2?: true }).cuid2 = true as never;
  }
  // format hints
  const format = schema.format as string | undefined;
  if (format === "email") node.email = true;
  if (format === "uri") node.url = true;
  if (format === "uuid") node.uuid = true;
  if (format === "ipv4") node.ipv4 = true;
  if (format === "ipv6") node.ipv6 = true;
  if (format === "date-time") return { type: "date" } as const;
  // anyOf ipv4|ipv6 -> ip
  if (Array.isArray((schema as Record<string, unknown>).anyOf)) {
    const ok = ((schema as Record<string, unknown>).anyOf as Array<
      Record<string, unknown>
    >)
      .every((s) => s.type === "string" && typeof s.format === "string");
    if (ok) {
      const formats = new Set(
        ((schema as Record<string, unknown>).anyOf as Array<
          Record<string, unknown>
        >)
          .map((s) => s.format as string),
      );
      if (formats.has("ipv4") && formats.has("ipv6")) node.ip = true;
    }
  }
  return node;
};

function regexLiteral(pattern: string, flags?: string): string {
  // For code generation we emit `v.regex(...)` call directly
  if (pattern === "") {
    return flags && flags.length > 0
      ? `v.regex(new RegExp(\"\",${JSON.stringify(flags)}))`
      : 'v.regex(new RegExp(""))';
  }
  const esc = pattern.replaceAll("/", "\\/");
  return `v.regex(/${esc}/${flags ?? ""})`;
}

// Helpers to avoid static import cycles
// no dynamic imports here; this module is self-contained

// Named export aliases removed; functions are exported inline
