import type { TypeCodec } from "./registry.ts";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

declare module "src/types/*" {
  export const typeName: SchemaNode["type"];
  export const matchesValibotType: (
    schema: { type?: string } & Record<string, unknown>,
  ) => boolean;
  export const encode: (
    schema: { type?: string; pipe?: unknown[] } & Record<string, unknown>,
  ) => Extract<SchemaNode, { type: SchemaNode["type"] }>;
  export const decode: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
  ) => unknown;
  export const toCode: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
  ) => string;
  export const toJsonSchema: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
  ) => JsonSchema;
  export const fromJsonSchema: (schema: Record<string, unknown>) => SchemaNode;
  export type ModuleCodec = TypeCodec<SchemaNode["type"]>;
}

