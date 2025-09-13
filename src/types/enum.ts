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

export const typeName = "enum" as const;

export function matchesValibotType(
  any: { type?: string } & Record<string, unknown>,
): boolean {
  const type = any?.type ??
    (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === "picklist" || type === "enum";
}

export const encode: Encoder<"enum"> = function encodeEnum(
  any,
): Extract<SchemaNode, { type: "enum" }> {
  const snap = JSON.parse(JSON.stringify(any)) as {
    options?: unknown[];
    enum?: unknown[];
  };
  const values =
    (snap.options ?? snap.enum ?? (any as { options?: unknown[] }).options ??
      (any as { enum?: unknown[] }).enum) as unknown[] | undefined;
  if (!Array.isArray(values)) {
    throw new Error("Unsupported enum schema: missing options");
  }
  const out: Array<string | number | boolean | null> = [];
  for (const val of values) {
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean" || val === null) {
      out.push(val as never);
    } else throw new Error("Unsupported enum value type");
  }
  return { type: "enum", values: out };
};

export const decode: Decoder<"enum"> = function decodeEnum(node): AnySchema {
  const literals = node.values.map((val) => v.literal(val as never));
  return v.union(literals as never);
};

export const toCode: ToCode<"enum"> = function enumToCode(node): string {
  const allStrings = node.values.every((v) => typeof v === "string");
  if (allStrings) return `v.picklist(${JSON.stringify(node.values)})`;
  const lits = node.values.map((v) => `v.literal(${JSON.stringify(v)})`).join(
    ",",
  );
  return `v.union([${lits}])`;
};

export const toJsonSchema: ToJsonSchema<"enum"> = function enumToJsonSchema(
  node,
): JsonSchema {
  return { enum: node.values.slice() } as JsonSchema;
};

export const fromJsonSchema: FromJsonSchema = function enumFromJsonSchema(
  schema,
): Extract<SchemaNode, { type: "enum" }> {
  return {
    type: "enum",
    values: (schema as { enum?: unknown[] }).enum as never,
  };
};
