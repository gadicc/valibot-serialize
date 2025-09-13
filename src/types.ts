export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

export type SchemaNode =
  | { type: "string"; minLength?: number; maxLength?: number; length?: number; pattern?: string; patternFlags?: string; email?: true; rfcEmail?: true; url?: true; uuid?: true; ip?: true; ipv4?: true; ipv6?: true; hexColor?: true; slug?: true; startsWith?: string; endsWith?: string }
  | { type: "number"; min?: number; max?: number; gt?: number; lt?: number; integer?: true; safeInteger?: true; multipleOf?: number; finite?: true }
  | { type: "boolean" }
  | { type: "literal"; value: PrimitiveLiteral }
  | { type: "array"; item: SchemaNode; minLength?: number; maxLength?: number; length?: number }
  | { type: "object"; entries: Record<string, SchemaNode>; optionalKeys?: string[]; policy?: "loose" | "strict"; rest?: SchemaNode }
  | { type: "optional"; base: SchemaNode }
  | { type: "nullable"; base: SchemaNode }
  | { type: "nullish"; base: SchemaNode }
  | { type: "union"; options: SchemaNode[] }
  | { type: "tuple"; items: SchemaNode[]; rest?: SchemaNode }
  | { type: "record"; key: SchemaNode; value: SchemaNode }
  | { type: "enum"; values: PrimitiveLiteral[] }
  | { type: "set"; value: SchemaNode; minSize?: number; maxSize?: number }
  | { type: "map"; key: SchemaNode; value: SchemaNode; minSize?: number; maxSize?: number };

export interface SerializedSchema {
  kind: "schema";
  vendor: "valibot";
  version: 1;
  format: typeof FORMAT_VERSION;
  node: SchemaNode;
}
