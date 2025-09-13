import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "boolean" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeBoolean(_any: Record<string, unknown>): Extract<SchemaNode, { type: "boolean" }>{
  return { type: "boolean" };
}

export function decodeBoolean(_node: Extract<SchemaNode, { type: "boolean" }>): AnySchema {
  return v.boolean();
}

export function booleanToCode(_node: Extract<SchemaNode, { type: "boolean" }>): string {
  return "v.boolean()";
}

export function booleanToJsonSchema(_node: Extract<SchemaNode, { type: "boolean" }>): JsonSchema {
  return { type: "boolean" };
}

export function booleanFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "boolean" }>{
  return { type: "boolean" };
}

