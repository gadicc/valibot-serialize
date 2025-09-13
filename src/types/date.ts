import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "date" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeDate(_any: Record<string, unknown>): Extract<SchemaNode, { type: "date" }>{
  return { type: "date" };
}

export function decodeDate(_node: Extract<SchemaNode, { type: "date" }>): AnySchema {
  return v.date();
}

export function dateToCode(_node: Extract<SchemaNode, { type: "date" }>): string {
  return "v.date()";
}

export function dateToJsonSchema(_node: Extract<SchemaNode, { type: "date" }>): JsonSchema {
  // Represent as RFC3339 string format
  return { type: "string", format: "date-time" } as JsonSchema;
}

export function dateFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "date" }>{
  return { type: "date" };
}

