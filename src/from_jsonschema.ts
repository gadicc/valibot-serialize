import type { SchemaNode, SerializedSchema } from "./types.ts";
import { unescapeRegex } from "./regex_utils.ts";
import { detect } from "./patterns.ts";

type JS = Record<string, unknown>;

export function fromJsonSchema(schema: JS): SerializedSchema {
  return {
    kind: "schema",
    vendor: "valibot",
    version: 1,
    format: 1,
    node: convert(schema),
  };
}

function convert(schema: JS): SchemaNode {
  const type = schema.type as string | undefined;
  if (schema.const !== undefined) {
    return { type: "literal", value: schema.const as never };
  }
  if (Array.isArray(schema.enum)) {
    return {
      type: "enum",
      values: schema.enum as Array<string | number | boolean | null>,
    };
  }

  if (type === "string") {
    const node: Extract<SchemaNode, { type: "string" }> = { type: "string" };
    // Detect string-level anyOf for ip (ipv4|ipv6)
    if (Array.isArray(schema.anyOf)) {
      const ok = (schema.anyOf as JS[]).every((s) =>
        (s as JS).type === "string" && typeof (s as JS).format === "string"
      );
      if (ok) {
        const formats = new Set(
          (schema.anyOf as JS[]).map((s) => (s as JS).format as string),
        );
        if (formats.has("ipv4") && formats.has("ipv6")) node.ip = true;
      }
    }
    if (typeof schema.minLength === "number") {
      node.minLength = schema.minLength as number;
    }
    if (typeof schema.maxLength === "number") {
      node.maxLength = schema.maxLength as number;
    }
    if (typeof schema.pattern === "string") {
      const p = schema.pattern as string;
      node.pattern = p;
      // Heuristics for startsWith / endsWith from our exporter
      const starts = p.match(/^\^([^.*+?^${}()|[\]\\]+)\.\*$/);
      if (starts) node.startsWith = unescapeRegex(starts[1]);
      const ends = p.match(/^\.\*([^.*+?^${}()|[\]\\]+)\$$/);
      if (ends) node.endsWith = unescapeRegex(ends[1]);
      if (
        /^?#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})??$/.test(p) ||
        /^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(p)
      ) node.hexColor = true as never;
      if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)) node.slug = true as never;
      if (/^[0-9]+$/.test(p)) node.digits = true as never;
      if (/^[0-9A-Fa-f]+$/.test(p)) node.hexadecimal = true as never;
      if (/^[A-Za-z0-9+/]{4}.*=*$/.test(p)) node.base64 = true as never;
      if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(p)) node.ulid = true as never;
      if (/^[A-Za-z0-9_-]+$/.test(p)) node.nanoid = true as never;
      if (/^[a-z0-9]{25}$/.test(p)) node.cuid2 = true as never;
      // Centralized pattern checks (kept to ensure consistency if literals change)
      if (detect.hexColor.test(p)) node.hexColor = true as never;
      if (detect.slug.test(p)) node.slug = true as never;
      if (detect.digits.test(p)) node.digits = true as never;
      if (detect.hexadecimal.test(p)) node.hexadecimal = true as never;
      if (detect.base64.test(p)) node.base64 = true as never;
      if (detect.ulid.test(p)) node.ulid = true as never;
      if (detect.nanoid.test(p)) node.nanoid = true as never;
      if (detect.cuid2.test(p)) node.cuid2 = true as never;
    }
    const format = schema.format as string | undefined;
    if (format === "email") node.email = true;
    if (format === "uri") node.url = true;
    if (format === "uuid") node.uuid = true;
    if (format === "ipv4") node.ipv4 = true;
    if (format === "ipv6") node.ipv6 = true;
    if (format === "date-time") return { type: "date" } as SchemaNode;
    return node;
  }

  if (type === "number" || type === "integer") {
    const node: Extract<SchemaNode, { type: "number" }> = { type: "number" };
    if (type === "integer") node.integer = true;
    if (typeof schema.minimum === "number") node.min = schema.minimum as number;
    if (typeof schema.maximum === "number") node.max = schema.maximum as number;
    if (typeof schema.exclusiveMinimum === "number") {
      node.gt = schema.exclusiveMinimum as number;
    }
    if (typeof schema.exclusiveMaximum === "number") {
      node.lt = schema.exclusiveMaximum as number;
    }
    if (typeof schema.multipleOf === "number") {
      node.multipleOf = schema.multipleOf as number;
    }
    return node;
  }

  if (type === "boolean") return { type: "boolean" };

  if (Array.isArray(schema.anyOf)) {
    const items = schema.anyOf as JS[];
    if (
      items.length > 0 &&
      items.every((i) => typeof i === "object" && (i as JS).const !== undefined)
    ) {
      return {
        type: "enum",
        values: items.map((i) =>
          (i as JS).const as string | number | boolean | null
        ),
      };
    }
    return { type: "union", options: items.map(convert) };
  }

  if (type === "array") {
    // tuple style
    if (Array.isArray(schema.prefixItems)) {
      const items = (schema.prefixItems as JS[]).map(convert);
      if (schema.items && typeof schema.items === "object") {
        return { type: "tuple", items, rest: convert(schema.items as JS) };
      }
      return { type: "tuple", items };
    }
    // set approximation when uniqueItems
    if (
      (schema as JS).uniqueItems === true && schema.items &&
      typeof schema.items === "object"
    ) {
      const setNode: Extract<SchemaNode, { type: "set" }> = {
        type: "set",
        value: convert(schema.items as JS),
      };
      if (typeof schema.minItems === "number") {
        setNode.minSize = schema.minItems as number;
      }
      if (typeof schema.maxItems === "number") {
        setNode.maxSize = schema.maxItems as number;
      }
      return setNode;
    }
    const arr: Extract<SchemaNode, { type: "array" }> = {
      type: "array",
      item: convert(((schema.items as JS) ?? {}) as JS),
    };
    if (typeof schema.minItems === "number") {
      arr.minLength = schema.minItems as number;
    }
    if (typeof schema.maxItems === "number") {
      arr.maxLength = schema.maxItems as number;
    }
    return arr;
  }

  if (type === "object") {
    const properties = (schema.properties as Record<string, JS>) ?? {};
    const required = (schema.required as string[]) ?? [];
    const entries: Record<string, SchemaNode> = {};
    for (const key of Object.keys(properties)) {
      const base = convert(properties[key]);
      entries[key] = required.includes(key) ? base : { type: "optional", base };
    }
    const node: Extract<SchemaNode, { type: "object" }> = {
      type: "object",
      entries,
    };
    if (schema.additionalProperties === false) node.policy = "strict";
    else if (typeof schema.additionalProperties === "object") {
      node.rest = convert(schema.additionalProperties as JS);
    }
    if (typeof schema.minProperties === "number") {
      node.minEntries = schema.minProperties as number;
    }
    if (typeof schema.maxProperties === "number") {
      node.maxEntries = schema.maxProperties as number;
    }
    return node;
  }

  // Fallback to unknown string
  return { type: "string" };
}

export type { JS as JsonSchemaInput };
