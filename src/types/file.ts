import * as v from "@valibot/valibot";
import type { BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "file" as const;

// Serialized node shape for "file"
export interface FileNode extends BaseNode<typeof typeName> {
  minSize?: number;
  maxSize?: number;
  mimeTypes?: string[];
}

export const isSchemaNode: IsSchemaNode<FileNode> = (
  node: unknown,
  _ctx,
): node is FileNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const n = node as Record<string, unknown>;
  if (n.minSize !== undefined && typeof n.minSize !== "number") return false;
  if (n.maxSize !== undefined && typeof n.maxSize !== "number") return false;
  if (n.mimeTypes !== undefined) {
    if (
      !Array.isArray(n.mimeTypes) ||
      (n.mimeTypes as unknown[]).some((x) => typeof x !== "string")
    ) return false;
  }
  return true;
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<FileNode> = function encodeFile(
  any,
): FileNode {
  const node: FileNode = { type: typeName };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.minSize = req;
          break;
        }
        case "max_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.maxSize = req;
          break;
        }
        case "mime_type": {
          const req = step.requirement as string[] | undefined;
          if (Array.isArray(req)) node.mimeTypes = req;
          break;
        }
      }
    }
  }
  return node;
};

export const decode: Decoder<FileNode> = function decodeFile(node): AnySchema {
  let f = v.file();
  const actions: unknown[] = [];
  if (node.minSize !== undefined) actions.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) actions.push(v.maxSize(node.maxSize));
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    const mimeType =
      (v as unknown as { mimeType: (req: string[] | string) => unknown })
        .mimeType;
    actions.push(mimeType(node.mimeTypes));
  }
  if (actions.length > 0) f = v.pipe(f, ...(actions as never[]));
  return f;
};

export const toCode: ToCode<FileNode> = function fileToCode(node): string {
  const base = "v.file()";
  const items: string[] = [];
  if (node.minSize !== undefined) items.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) items.push(`v.maxSize(${node.maxSize})`);
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    items.push(`v.mimeType(${JSON.stringify(node.mimeTypes)})`);
  }
  if (items.length === 0) return base;
  return `v.pipe(${base},${items.join(",")})`;
};

export const toJsonSchema: ToJsonSchema<FileNode> = function fileToJsonSchema(
  node,
): JsonSchema {
  const schema: JsonSchema = { type: "string", contentEncoding: "binary" };
  if (node.mimeTypes && node.mimeTypes.length === 1) {
    (schema as Record<string, unknown>).contentMediaType = node.mimeTypes[0];
  }
  if (node.mimeTypes && node.mimeTypes.length > 1) {
    (schema as Record<string, unknown>).anyOf = node.mimeTypes.map((mt) => ({
      type: "string",
      contentEncoding: "binary",
      contentMediaType: mt,
    }));
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function fileFromJsonSchema(
  _schema,
): FileNode {
  return { type: typeName };
};
