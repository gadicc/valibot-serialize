import type { SchemaNode, SerializedSchema } from "./types.ts";
import { escapeRegex } from "./regex_utils.ts";
import { patterns as pat } from "./patterns.ts";

type JsonSchema = Record<string, unknown>;

export function toJsonSchema(serialized: SerializedSchema): JsonSchema {
  return convertNode(serialized.node);
}

function convertNode(node: SchemaNode): JsonSchema {
  switch (node.type) {
    case "string":
      return buildStringSchema(node);
    case "number":
      return buildNumberSchema(node);
    case "boolean":
      return { type: "boolean" };
    case "literal":
      return { const: node.value };
    case "array": {
      const schema: JsonSchema = {
        type: "array",
        items: convertNode(node.item),
      };
      if (node.minLength !== undefined) schema.minItems = node.minLength;
      if (node.maxLength !== undefined) schema.maxItems = node.maxLength;
      if (node.length !== undefined) {
        schema.minItems = schema.maxItems = node.length;
      }
      return schema;
    }
    case "object": {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const key of Object.keys(node.entries)) {
        const child = node.entries[key];
        if (child.type === "optional") {
          properties[key] = convertNode(child.base);
        } else {
          properties[key] = convertNode(child);
          required.push(key);
        }
      }
      const schema: JsonSchema = {
        type: "object",
        properties,
      };
      if (required.length > 0) schema.required = required;
      if (node.rest) schema.additionalProperties = convertNode(node.rest);
      else if (node.policy === "strict") schema.additionalProperties = false;
      else schema.additionalProperties = true;
      if (node.minEntries !== undefined) schema.minProperties = node.minEntries;
      if (node.maxEntries !== undefined) schema.maxProperties = node.maxEntries;
      return schema;
    }
    case "optional":
      return convertNode(node.base);
    case "nullable":
      return { anyOf: [convertNode(node.base), { type: "null" }] };
    case "nullish":
      return { anyOf: [convertNode(node.base), { type: "null" }] };
    case "union": {
      const literals = node.options.every((o) => o.type === "literal");
      if (literals) {
        return {
          enum: (node.options as Extract<SchemaNode, { type: "literal" }>[])
            .map((o) => o.value),
        } as JsonSchema;
      }
      return { anyOf: node.options.map(convertNode) };
    }
    case "tuple": {
      const schema: JsonSchema = {
        type: "array",
        prefixItems: node.items.map(convertNode),
      };
      if (node.rest) {
        schema.items = convertNode(node.rest);
        schema.minItems = node.items.length;
      } else {
        schema.items = false;
        schema.minItems = schema.maxItems = node.items.length;
      }
      return schema;
    }
    case "record": {
      // JSON Schema does not encode key schema precisely; approximate with additionalProperties
      return { type: "object", additionalProperties: convertNode(node.value) };
    }
    case "enum":
      return { enum: node.values.slice() } as JsonSchema;
    case "set": {
      const schema: JsonSchema = {
        type: "array",
        items: convertNode(node.value),
        uniqueItems: true,
      };
      if (node.minSize !== undefined) schema.minItems = node.minSize;
      if (node.maxSize !== undefined) schema.maxItems = node.maxSize;
      return schema;
    }
    case "map": {
      // Approximate as object with value schema
      const schema: JsonSchema = {
        type: "object",
        additionalProperties: convertNode(node.value),
      };
      if (node.minSize !== undefined) schema.minProperties = node.minSize;
      if (node.maxSize !== undefined) schema.maxProperties = node.maxSize;
      return schema;
    }
    case "date":
      // Approximation: Date objects as RFC3339 strings
      return { type: "string", format: "date-time" };
    case "file": {
      // Approximate as binary string; contentMediaType cannot express multiple easily
      const schema: JsonSchema = { type: "string", contentEncoding: "binary" };
      if (node.mimeTypes && node.mimeTypes.length === 1) {
        (schema as Record<string, unknown>).contentMediaType =
          node.mimeTypes[0];
      }
      if (node.mimeTypes && node.mimeTypes.length > 1) {
        (schema as Record<string, unknown>).anyOf = node.mimeTypes.map((
          mt,
        ) => ({
          type: "string",
          contentEncoding: "binary",
          contentMediaType: mt,
        }));
      }
      return schema;
    }
    case "blob": {
      const schema: JsonSchema = { type: "string", contentEncoding: "binary" };
      if (node.mimeTypes && node.mimeTypes.length === 1) {
        (schema as Record<string, unknown>).contentMediaType =
          node.mimeTypes[0];
      }
      if (node.mimeTypes && node.mimeTypes.length > 1) {
        (schema as Record<string, unknown>).anyOf = node.mimeTypes.map((
          mt,
        ) => ({
          type: "string",
          contentEncoding: "binary",
          contentMediaType: mt,
        }));
      }
      return schema;
    }
  }
}

function buildStringSchema(
  node: Extract<SchemaNode, { type: "string" }>,
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
  // IDs
  if ((node as { ulid?: true }).ulid) patternsArr.push(pat.ulid);
  if ((node as { nanoid?: true }).nanoid) patternsArr.push(pat.nanoid);
  if ((node as { cuid2?: true }).cuid2) patternsArr.push(pat.cuid2);
  // ISO date/time patterns (approximate)
  if (node.isoDate) patternsArr.push(pat.isoDate);
  if (node.isoTime) patternsArr.push(pat.isoTime);
  if (node.isoTimeSecond) patternsArr.push(pat.isoTimeSecond);
  if (node.isoDateTime || node.isoTimestamp) patternsArr.push(pat.isoDateTime);
  if (node.isoWeek) patternsArr.push(pat.isoWeek);
  // Word count approximations
  if ((node as { minWords?: number }).minWords !== undefined) {
    const n = (node as { minWords: number }).minWords;
    // At least n words: require at least n-1 spaces and final word
    patternsArr.push(`^(?:\\S+\\s+){${Math.max(0, n - 1)}}\\S+(?:\\s+\\S+)*$`);
  }
  if ((node as { maxWords?: number }).maxWords !== undefined) {
    const m = (node as { maxWords: number }).maxWords;
    // At most m words: up to m occurrences of word blocks separated by whitespace
    patternsArr.push(`^\\s*(?:\\S+(?:\\s+|$)){0,${m}}$`);
  }
  if (patternsArr.length === 1) schema.pattern = patternsArr[0];
  else if (patternsArr.length > 1) {
    schema.allOf = patternsArr.map((p) => ({ pattern: p }));
  }
  const formats: string[] = [];
  if (node.email) formats.push("email");
  if (node.url) formats.push("uri");
  if (node.uuid) formats.push("uuid");
  if (node.ipv4) formats.push("ipv4");
  if (node.ipv6) formats.push("ipv6");
  if (node.ip && !node.ipv4 && !node.ipv6) {
    // generic IP: accept both
    (schema.anyOf ??= []) as unknown as Array<unknown>;
    (schema.anyOf as Array<unknown>).push({ type: "string", format: "ipv4" }, {
      type: "string",
      format: "ipv6",
    });
  }
  if (formats.length === 1) schema.format = formats[0];
  else if (formats.length > 1) {
    schema.anyOf = formats.map((f) => ({ type: "string", format: f }));
  }
  return schema;
}

function buildNumberSchema(
  node: Extract<SchemaNode, { type: "number" }>,
): JsonSchema {
  const schema: JsonSchema = { type: "number" };
  if (node.integer) schema.type = "integer";
  if (node.min !== undefined) schema.minimum = node.min;
  if (node.max !== undefined) schema.maximum = node.max;
  if (node.gt !== undefined) schema.exclusiveMinimum = node.gt;
  if (node.lt !== undefined) schema.exclusiveMaximum = node.lt;
  if (node.multipleOf !== undefined) schema.multipleOf = node.multipleOf;
  return schema;
}

export type { JsonSchema };
