export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

export type SchemaNode =
  | { type: "string"; minLength?: number; maxLength?: number; pattern?: string; patternFlags?: string }
  | { type: "number"; min?: number; max?: number }
  | { type: "boolean" }
  | { type: "literal"; value: PrimitiveLiteral }
  | { type: "array"; item: SchemaNode }
  | { type: "object"; entries: Record<string, SchemaNode> }
  | { type: "optional"; base: SchemaNode }
  | { type: "nullable"; base: SchemaNode };

export interface SerializedSchema {
  kind: "schema";
  vendor: "valibot";
  version: 1;
  format: typeof FORMAT_VERSION;
  node: SchemaNode;
}
