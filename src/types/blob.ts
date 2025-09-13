import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "blob" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeBlob(any: Record<string, unknown>): Extract<SchemaNode, { type: "blob" }>{
  const node: Extract<SchemaNode, { type: "blob" }> = { type: "blob" };
  const pipe = (any as { pipe?: unknown[] }).pipe as Array<Record<string, unknown>> | undefined;
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
}

export function decodeBlob(node: Extract<SchemaNode, { type: "blob" }>): AnySchema {
  let b = v.blob();
  const items: unknown[] = [];
  if (node.minSize !== undefined) items.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) items.push(v.maxSize(node.maxSize));
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    const mimeType = (v as unknown as { mimeType: (req: string[] | string) => unknown }).mimeType;
    items.push(mimeType(node.mimeTypes));
  }
  if (items.length > 0) b = v.pipe(b, ...(items as never[]));
  return b;
}

export function blobToCode(node: Extract<SchemaNode, { type: "blob" }>): string {
  const base = "v.blob()";
  const items: string[] = [];
  if (node.minSize !== undefined) items.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) items.push(`v.maxSize(${node.maxSize})`);
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    items.push(`v.mimeType(${JSON.stringify(node.mimeTypes)})`);
  }
  if (items.length === 0) return base;
  return `v.pipe(${base},${items.join(",")})`;
}

export function blobToJsonSchema(node: Extract<SchemaNode, { type: "blob" }>): JsonSchema {
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
}

export function blobFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "blob" }>{
  return { type: "blob" };
}

