import * as v from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

export const typeName = "array" as const;

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<"array"> = function encodeArray(
  any,
  ctx,
): Extract<SchemaNode, { type: "array" }> {
  const child = (any as { item?: unknown }).item as AnySchema | undefined;
  if (!child) throw new Error("Unsupported array schema: missing item schema");
  const node: Extract<SchemaNode, { type: "array" }> = {
    type: "array",
    item: ctx.encodeNode(child),
  };
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
};

export const decode: Decoder<"array"> = function decodeArray(
  node,
  ctx,
): AnySchema {
  const base = v.array(ctx.decodeNode(node.item));
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
};

export const toCode: ToCode<"array"> = function arrayToCode(node, ctx): string {
  const base = `v.array(${ctx.nodeToCode(node.item)})`;
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
};

export const toJsonSchema: ToJsonSchema<"array"> = function arrayToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const schema: JsonSchema = {
    type: "array",
    items: ctx.convertNode(node.item),
  };
  if (node.minLength !== undefined) {
    (schema as Record<string, unknown>).minItems = node.minLength;
  }
  if (node.maxLength !== undefined) {
    (schema as Record<string, unknown>).maxItems = node.maxLength;
  }
  if (node.length !== undefined) {
    (schema as Record<string, unknown>).minItems = node.length;
    (schema as Record<string, unknown>).maxItems = node.length;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function arrayFromJsonSchema(
  schema,
  ctx,
): Extract<SchemaNode, { type: "array" }> {
  return {
    type: "array",
    item: ctx.convert(
      ((schema as { items?: unknown }).items ?? {}) as Record<string, unknown>,
    ),
    ...(typeof (schema as { minItems?: unknown }).minItems === "number"
      ? { minLength: (schema as { minItems: number }).minItems }
      : {}),
    ...(typeof (schema as { maxItems?: unknown }).maxItems === "number"
      ? { maxLength: (schema as { maxItems: number }).maxItems }
      : {}),
  };
};
