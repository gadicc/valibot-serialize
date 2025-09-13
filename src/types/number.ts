import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import type {
  Decoder,
  Encoder,
  FromJsonSchema,
  ToCode,
  ToJsonSchema,
} from "../type_interfaces.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "number" as const;

export function matchesValibotType(
  any: { type?: string } & Record<string, unknown>,
): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as {
    type?: string;
  }).type;
  return type === typeName;
}

export const encode: Encoder<"number"> = function encodeNumber(
  any,
): Extract<SchemaNode, { type: "number" }> {
  const node: Extract<SchemaNode, { type: "number" }> = { type: "number" };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.min = req;
          break;
        }
        case "max_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.max = req;
          break;
        }
        case "gt_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.gt = req;
          break;
        }
        case "lt_value": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.lt = req;
          break;
        }
        case "integer":
          node.integer = true;
          break;
        case "safe_integer":
          node.safeInteger = true;
          break;
        case "multiple_of": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.multipleOf = req;
          break;
        }
        case "finite":
          node.finite = true;
          break;
      }
    }
  }
  return node;
};

export const decode: Decoder<"number"> = function decodeNumber(
  node,
): AnySchema {
  const n = v.number();
  const validators: unknown[] = [];
  if (node.min !== undefined) validators.push(v.minValue(node.min));
  if (node.max !== undefined) validators.push(v.maxValue(node.max));
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
};

export const toCode: ToCode<"number"> = function numberToCode(node): string {
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
};

export const toJsonSchema: ToJsonSchema<"number"> = function numberToJsonSchema(
  node,
): JsonSchema {
  const schema: JsonSchema = { type: node.integer ? "integer" : "number" };
  if (node.min !== undefined) {
    (schema as Record<string, unknown>).minimum = node.min;
  }
  if (node.max !== undefined) {
    (schema as Record<string, unknown>).maximum = node.max;
  }
  if (node.gt !== undefined) {
    (schema as Record<string, unknown>).exclusiveMinimum = node.gt;
  }
  if (node.lt !== undefined) {
    (schema as Record<string, unknown>).exclusiveMaximum = node.lt;
  }
  if (node.multipleOf !== undefined) {
    (schema as Record<string, unknown>).multipleOf = node.multipleOf;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function numberFromJsonSchema(
  schema,
): Extract<SchemaNode, { type: "number" }> {
  const type = schema.type as string | undefined;
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
};
