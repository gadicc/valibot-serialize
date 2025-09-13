import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "object" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === "object" || type === "loose_object" ||
    type === "strict_object" || type === "object_with_rest";
}

export const encode: Encoder<"object"> = function encodeObject(
  any,
  ctx,
): Extract<SchemaNode, { type: "object" }> {
  const type = (any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type) as
      | string
      | undefined;
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
    const encoded = ctx.encodeNode(sub);
    out[key] = encoded;
    if (encoded.type === "optional") optionalKeys.push(key);
  }
  const node: Extract<SchemaNode, { type: "object" }> = {
    type: "object",
    entries: out,
  };
  if (optionalKeys.length > 0) {
    (node as { optionalKeys?: string[] }).optionalKeys = optionalKeys;
  }
  if (type === "loose_object") {
    (node as { policy?: "loose" | "strict" }).policy = "loose";
  }
  if (type === "strict_object") {
    (node as { policy?: "loose" | "strict" }).policy = "strict";
  }
  if (type === "object_with_rest") {
    const rest = (any as { rest?: unknown }).rest as AnySchema | undefined;
    if (!rest) throw new Error("Unsupported object_with_rest: missing rest");
    (node as { rest?: SchemaNode }).rest = ctx.encodeNode(rest);
  }
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
          if (typeof req === "number") {
            (node as { minEntries?: number }).minEntries = req;
          }
          break;
        }
        case "max_entries": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") {
            (node as { maxEntries?: number }).maxEntries = req;
          }
          break;
        }
      }
    }
  }
  return node;
};

export const decode: Decoder<"object"> = function decodeObject(
  node,
  ctx,
): AnySchema {
  const shape: Record<string, AnySchema> = {};
  for (const key of Object.keys(node.entries)) {
    shape[key] = ctx.decodeNode(node.entries[key]);
  }
  let obj: AnySchema;
  if (node.rest) {
    obj = v.objectWithRest(shape, ctx.decodeNode(node.rest) as never);
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
};

export const toCode: ToCode<"object"> = function objectToCode(
  node,
  ctx,
): string {
  const entries = Object.keys(node.entries).map((k) =>
    `${propKey(k)}:${ctx.nodeToCode(node.entries[k])}`
  ).join(",");
  let base: string;
  if (node.rest) {
    base = `v.objectWithRest({${entries}},${ctx.nodeToCode(node.rest)})`;
  } else if (node.policy === "strict") base = `v.strictObject({${entries}})`;
  else if (node.policy === "loose") base = `v.looseObject({${entries}})`;
  else base = `v.object({${entries}})`;
  const validators: string[] = [];
  if (node.minEntries !== undefined) {
    validators.push(`v.minEntries(${node.minEntries})`);
  }
  if (node.maxEntries !== undefined) {
    validators.push(`v.maxEntries(${node.maxEntries})`);
  }
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
};

export const toJsonSchema: ToJsonSchema<"object"> = function objectToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const key of Object.keys(node.entries)) {
    const child = node.entries[key];
    if (child.type === "optional") {
      properties[key] = ctx.convertNode(child.base);
    } else {
      properties[key] = ctx.convertNode(child);
      required.push(key);
    }
  }
  const schema: JsonSchema = { type: "object", properties };
  if (required.length > 0) {
    (schema as Record<string, unknown>).required = required;
  }
  if (node.rest) {
    (schema as Record<string, unknown>).additionalProperties = ctx.convertNode(
      node.rest,
    );
  } else if (node.policy === "strict") {
    (schema as Record<string, unknown>).additionalProperties = false;
  } else (schema as Record<string, unknown>).additionalProperties = true;
  if (node.minEntries !== undefined) {
    (schema as Record<string, unknown>).minProperties = node.minEntries;
  }
  if (node.maxEntries !== undefined) {
    (schema as Record<string, unknown>).maxProperties = node.maxEntries;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function objectFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "object" }> {
  const properties =
    (schema as { properties?: Record<string, Record<string, unknown>> })
      .properties ?? {};
  const required = (schema as { required?: string[] }).required ?? [];
  const entries: Record<string, SchemaNode> = {};
  for (const key of Object.keys(properties)) {
    const base = ctx.convert(properties[key]);
    entries[key] = required.includes(key) ? base : { type: "optional", base };
  }
  const node: Extract<SchemaNode, { type: "object" }> = {
    type: "object",
    entries,
  };
  if (
    (schema as { additionalProperties?: unknown }).additionalProperties ===
      false
  ) (node as { policy?: "loose" | "strict" }).policy = "strict";
  else if (
    typeof (schema as { additionalProperties?: unknown })
      .additionalProperties === "object"
  ) {
    (node as { rest?: SchemaNode }).rest = ctx.convert(
      (schema as { additionalProperties: Record<string, unknown> })
        .additionalProperties,
    );
  }
  if (
    typeof (schema as { minProperties?: unknown }).minProperties === "number"
  ) {
    (node as { minEntries?: number }).minEntries =
      (schema as { minProperties: number }).minProperties;
  }
  if (
    typeof (schema as { maxProperties?: unknown }).maxProperties === "number"
  ) {
    (node as { maxEntries?: number }).maxEntries =
      (schema as { maxProperties: number }).maxProperties;
  }
  return node;
};

function propKey(k: string): string {
  return /^(?:[$A-Z_a-z][$\w]*)$/.test(k) ? k : JSON.stringify(k);
}

// Named export aliases removed; functions are exported inline
