export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

export type SchemaNode =
  | { type: "string"; minLength?: number; maxLength?: number; length?: number; pattern?: string; patternFlags?: string; email?: true; url?: true; uuid?: true; startsWith?: string; endsWith?: string }
  | { type: "number"; min?: number; max?: number; integer?: true; safeInteger?: true; multipleOf?: number }
  | { type: "boolean" }
  | { type: "literal"; value: PrimitiveLiteral }
  | { type: "array"; item: SchemaNode; minLength?: number; maxLength?: number; length?: number }
  | { type: "object"; entries: Record<string, SchemaNode> }
  | { type: "optional"; base: SchemaNode }
  | { type: "nullable"; base: SchemaNode }
  | { type: "nullish"; base: SchemaNode }
  | { type: "union"; options: SchemaNode[] }
  | { type: "tuple"; items: SchemaNode[] }
  | { type: "record"; key: SchemaNode; value: SchemaNode };

export interface SerializedSchema {
  kind: "schema";
  vendor: "valibot";
  version: 1;
  format: typeof FORMAT_VERSION;
  node: SchemaNode;
}
