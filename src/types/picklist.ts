import * as v from "@valibot/valibot";
import type { BaseNode } from "./lib/type_interfaces.ts";
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

export const typeName = "picklist" as const;

export interface PicklistNode extends BaseNode<typeof typeName> {
  values: string[];
}

export const matches: Matches = (any: AnySchema): boolean => {
  return (any as { type?: string }).type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema): boolean => {
  // Picklist only for string enums/anyOf-consts of strings
  const en = (schema as { enum?: unknown[] }).enum;
  if (Array.isArray(en)) return en.every((x) => typeof x === "string");
  const anyOf = (schema as { anyOf?: Array<Record<string, unknown>> }).anyOf;
  if (!Array.isArray(anyOf)) return false;
  return (
    anyOf.length > 0 &&
    anyOf.every((i) => typeof i.const === "string")
  );
};

export const encode: Encoder<PicklistNode> = function encodePicklist(any) {
  const values = ((any as { options?: unknown[] }).options) as
    | unknown[]
    | undefined;
  if (!Array.isArray(values)) {
    throw new Error("Unsupported picklist: missing options");
  }
  const out: string[] = [];
  for (const v0 of values) {
    if (typeof v0 !== "string") {
      throw new Error("Picklist values must be strings");
    }
    out.push(v0);
  }
  return { type: typeName, values: out };
};

export const decode: Decoder<PicklistNode> = function decodePicklist(node) {
  return v.picklist(node.values);
};

export const toCode: ToCode<PicklistNode> = function picklistToCode(node) {
  return `v.picklist(${JSON.stringify(node.values)})`;
};

export const toJsonSchema: ToJsonSchema<PicklistNode> =
  function picklistToJsonSchema(
    node,
  ): JsonSchema {
    return { enum: node.values.slice() } as JsonSchema;
  };

export const fromJsonSchema: FromJsonSchema = function picklistFromJsonSchema(
  schema,
) {
  const en = (schema as { enum?: unknown[] }).enum;
  if (Array.isArray(en) && en.every((x) => typeof x === "string")) {
    return { type: typeName, values: en as string[] } as never;
  }
  const anyOf = (schema as { anyOf?: Array<Record<string, unknown>> }).anyOf;
  if (
    Array.isArray(anyOf) && anyOf.length > 0 &&
    anyOf.every((i) => typeof i.const === "string")
  ) {
    return {
      type: typeName,
      values: anyOf.map((i) => i.const as string),
    } as never;
  }
  return { type: typeName, values: [] } as never;
};
