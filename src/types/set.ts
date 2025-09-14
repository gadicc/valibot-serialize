import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  MatchesJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "set" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  return (schema as { type?: unknown }).type === "array" &&
    (schema as { uniqueItems?: unknown }).uniqueItems === true;
};

export const encode: Encoder<"set"> = function encodeSet(
  any,
  ctx,
): Extract<SchemaNode, { type: "set" }> {
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!value) throw new Error("Unsupported set schema: missing value");
  const node: Extract<SchemaNode, { type: "set" }> = {
    type: "set",
    value: ctx.encodeNode(value),
  };
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
          if (typeof req === "number") {
            (node as { minSize?: number }).minSize = req;
          }
          break;
        }
        case "max_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") {
            (node as { maxSize?: number }).maxSize = req;
          }
          break;
        }
      }
    }
  }
  return node;
};

export const decode: Decoder<"set"> = function decodeSet(node, ctx) {
  const base = v.set(ctx.decodeNode(node.value) as never);
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
    default:
      return v.pipe(base, ...(validators as never[]));
  }
};

export const toCode: ToCode<"set"> = function setToCode(node, ctx) {
  const base = `v.set(${ctx.nodeToCode(node.value)})`;
  const validators: string[] = [];
  if (node.minSize !== undefined) validators.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) validators.push(`v.maxSize(${node.maxSize})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
};

export const toJsonSchema: ToJsonSchema<"set"> = function setToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const schema: JsonSchema = {
    type: "array",
    items: ctx.convertNode(node.value),
    uniqueItems: true,
  } as JsonSchema;
  if (node.minSize !== undefined) {
    (schema as Record<string, unknown>).minItems = node.minSize;
  }
  if (node.maxSize !== undefined) {
    (schema as Record<string, unknown>).maxItems = node.maxSize;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function setFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "set" }> {
  return {
    type: "set",
    value: ctx.convert(
      ((schema as { items?: Record<string, unknown> }).items ?? {}) as Record<
        string,
        unknown
      >,
    ),
    ...(typeof (schema as { minItems?: unknown }).minItems === "number"
      ? { minSize: (schema as { minItems: number }).minItems }
      : {}),
    ...(typeof (schema as { maxItems?: unknown }).maxItems === "number"
      ? { maxSize: (schema as { maxItems: number }).maxItems }
      : {}),
  };
};
