import type { TypeCodec } from "./types/lib/type_interfaces.ts";
import type { SchemaNode } from "./types.ts";
import type { JsonSchema } from "./converters/to_jsonschema.ts";

declare module "src/types/*" {
  export const typeName: SchemaNode["type"];
  export const matches: (
    schema: import("./types/lib/type_interfaces.ts").AnySchema,
  ) => boolean;
  export const encode: (
    schema: { type?: string; pipe?: unknown[] } & Record<string, unknown>,
    ctx: {
      encodeNode: (
        schema: import("./types/lib/type_interfaces.ts").AnySchema,
      ) => SchemaNode;
    },
  ) => Extract<SchemaNode, { type: SchemaNode["type"] }> | SchemaNode;
  export const decode: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
    ctx: {
      decodeNode: (
        node: SchemaNode,
      ) => import("./types/lib/type_interfaces.ts").AnySchema;
    },
  ) => import("./types/lib/type_interfaces.ts").AnySchema;
  export const toCode: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
    ctx: { nodeToCode: (node: SchemaNode) => string },
  ) => string;
  export const toJsonSchema: (
    node: Extract<SchemaNode, { type: SchemaNode["type"] }>,
    ctx: { convertNode: (node: SchemaNode) => JsonSchema },
  ) => JsonSchema;
  export const fromJsonSchema: (
    schema: Record<string, unknown>,
    ctx: { convert: (js: Record<string, unknown>) => SchemaNode },
  ) => SchemaNode;
  export type ModuleCodec = TypeCodec<SchemaNode["type"]>;
}
