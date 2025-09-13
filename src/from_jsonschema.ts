import type { SchemaNode, SerializedSchema } from "./types.ts";

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
  if (schema.const !== undefined) return { type: "literal", value: schema.const as never };
  if (Array.isArray(schema.enum)) return { type: "enum", values: schema.enum as Array<string | number | boolean | null> };
  if (Array.isArray(schema.anyOf)) return { type: "union", options: (schema.anyOf as JS[]).map(convert) };

  if (type === "string") {
    const node: Extract<SchemaNode, { type: "string" }> = { type: "string" };
    if (typeof schema.minLength === "number") node.minLength = schema.minLength as number;
    if (typeof schema.maxLength === "number") node.maxLength = schema.maxLength as number;
    if (typeof schema.pattern === "string") node.pattern = schema.pattern as string;
    const format = schema.format as string | undefined;
    if (format === "email") node.email = true;
    if (format === "uri") node.url = true;
    if (format === "uuid") node.uuid = true;
    if (format === "ipv4") node.ipv4 = true;
    if (format === "ipv6") node.ipv6 = true;
    return node;
  }

  if (type === "number" || type === "integer") {
    const node: Extract<SchemaNode, { type: "number" }> = { type: "number" };
    if (type === "integer") node.integer = true;
    if (typeof schema.minimum === "number") node.min = schema.minimum as number;
    if (typeof schema.maximum === "number") node.max = schema.maximum as number;
    if (typeof schema.exclusiveMinimum === "number") node.gt = schema.exclusiveMinimum as number;
    if (typeof schema.exclusiveMaximum === "number") node.lt = schema.exclusiveMaximum as number;
    if (typeof schema.multipleOf === "number") node.multipleOf = schema.multipleOf as number;
    return node;
  }

  if (type === "boolean") return { type: "boolean" };

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
    if ((schema as JS).uniqueItems === true && schema.items && typeof schema.items === "object") {
      const setNode: Extract<SchemaNode, { type: "set" }> = { type: "set", value: convert(schema.items as JS) };
      if (typeof schema.minItems === "number") setNode.minSize = schema.minItems as number;
      if (typeof schema.maxItems === "number") setNode.maxSize = schema.maxItems as number;
      return setNode;
    }
    const arr: Extract<SchemaNode, { type: "array" }> = { type: "array", item: convert(((schema.items as JS) ?? {}) as JS) };
    if (typeof schema.minItems === "number") arr.minLength = schema.minItems as number;
    if (typeof schema.maxItems === "number") arr.maxLength = schema.maxItems as number;
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
    const node: Extract<SchemaNode, { type: "object" }> = { type: "object", entries };
    if (schema.additionalProperties === false) node.policy = "strict";
    else if (typeof schema.additionalProperties === "object") node.rest = convert(schema.additionalProperties as JS);
    if (typeof schema.minProperties === "number") node.minEntries = schema.minProperties as number;
    if (typeof schema.maxProperties === "number") node.maxEntries = schema.maxProperties as number;
    return node;
  }

  // Fallback to unknown string
  return { type: "string" };
}

export type { JS as JsonSchemaInput };

