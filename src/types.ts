export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

export type SchemaNode =
  | { type: "string"; minLength?: number; maxLength?: number; length?: number; pattern?: string; patternFlags?: string; email?: true; rfcEmail?: true; url?: true; uuid?: true; ip?: true; ipv4?: true; ipv6?: true; hexColor?: true; slug?: true; creditCard?: true; imei?: true; mac?: true; mac48?: true; mac64?: true; base64?: true; ulid?: true; nanoid?: true; cuid2?: true; isoDate?: true; isoDateTime?: true; isoTime?: true; isoTimeSecond?: true; isoTimestamp?: true; isoWeek?: true; digits?: true; emoji?: true; hexadecimal?: true; minGraphemes?: number; maxGraphemes?: number; startsWith?: string; endsWith?: string; transforms?: Array<"trim" | "trimStart" | "trimEnd" | "toUpperCase" | "toLowerCase" | "normalize"> }
  | { type: "number"; min?: number; max?: number; gt?: number; lt?: number; integer?: true; safeInteger?: true; multipleOf?: number; finite?: true }
  | { type: "boolean" }
  | { type: "date" }
  | { type: "file"; minSize?: number; maxSize?: number; mimeTypes?: string[] }
  | { type: "blob"; minSize?: number; maxSize?: number; mimeTypes?: string[] }
  | { type: "literal"; value: PrimitiveLiteral }
  | { type: "array"; item: SchemaNode; minLength?: number; maxLength?: number; length?: number }
  | { type: "object"; entries: Record<string, SchemaNode>; optionalKeys?: string[]; policy?: "loose" | "strict"; rest?: SchemaNode; minEntries?: number; maxEntries?: number }
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
