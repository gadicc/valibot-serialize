import type { SchemaNode, SerializedSchema } from "./types.ts";

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
      if (node.length !== undefined) schema.minItems = schema.maxItems = node.length;
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
    case "union":
      return { anyOf: node.options.map(convertNode) };
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
      const schema: JsonSchema = { type: "array", items: convertNode(node.value), uniqueItems: true };
      if (node.minSize !== undefined) schema.minItems = node.minSize;
      if (node.maxSize !== undefined) schema.maxItems = node.maxSize;
      return schema;
    }
    case "map": {
      // Approximate as object with value schema
      const schema: JsonSchema = { type: "object", additionalProperties: convertNode(node.value) };
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
      if (node.mimeTypes && node.mimeTypes.length === 1) (schema as Record<string, unknown>).contentMediaType = node.mimeTypes[0];
      if (node.mimeTypes && node.mimeTypes.length > 1) {
        (schema as Record<string, unknown>).anyOf = node.mimeTypes.map((mt) => ({ type: "string", contentEncoding: "binary", contentMediaType: mt }));
      }
      return schema;
    }
    case "blob": {
      const schema: JsonSchema = { type: "string", contentEncoding: "binary" };
      if (node.mimeTypes && node.mimeTypes.length === 1) (schema as Record<string, unknown>).contentMediaType = node.mimeTypes[0];
      if (node.mimeTypes && node.mimeTypes.length > 1) {
        (schema as Record<string, unknown>).anyOf = node.mimeTypes.map((mt) => ({ type: "string", contentEncoding: "binary", contentMediaType: mt }));
      }
      return schema;
    }
  }
}

function buildStringSchema(node: Extract<SchemaNode, { type: "string" }>): JsonSchema {
  const schema: JsonSchema = { type: "string" };
  if (node.minLength !== undefined) schema.minLength = node.minLength;
  if (node.maxLength !== undefined) schema.maxLength = node.maxLength;
  if (node.length !== undefined) schema.minLength = schema.maxLength = node.length;
  const patterns: string[] = [];
  if (node.pattern) patterns.push(node.pattern);
  if (node.startsWith) patterns.push(`^${escapeRegex(node.startsWith)}.*`);
  if (node.endsWith) patterns.push(`.*${escapeRegex(node.endsWith)}$`);
  if (patterns.length === 1) schema.pattern = patterns[0];
  else if (patterns.length > 1) schema.allOf = patterns.map((p) => ({ pattern: p }));
  const formats: string[] = [];
  if (node.email) formats.push("email");
  if (node.url) formats.push("uri");
  if (node.uuid) formats.push("uuid");
  if (node.ipv4) formats.push("ipv4");
  if (node.ipv6) formats.push("ipv6");
  if (formats.length === 1) schema.format = formats[0];
  else if (formats.length > 1) schema.anyOf = formats.map((f) => ({ type: "string", format: f }));
  return schema;
}

function buildNumberSchema(node: Extract<SchemaNode, { type: "number" }>): JsonSchema {
  const schema: JsonSchema = { type: "number" };
  if (node.integer) schema.type = "integer";
  if (node.min !== undefined) schema.minimum = node.min;
  if (node.max !== undefined) schema.maximum = node.max;
  if (node.gt !== undefined) schema.exclusiveMinimum = node.gt;
  if (node.lt !== undefined) schema.exclusiveMaximum = node.lt;
  if (node.multipleOf !== undefined) schema.multipleOf = node.multipleOf;
  return schema;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type { JsonSchema };

