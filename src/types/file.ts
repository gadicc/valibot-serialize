import * as v from "@valibot/valibot";
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export const typeName = "file" as const;

export function matchesValibotType(any: { type?: string }): boolean {
  const type = any?.type ?? (JSON.parse(JSON.stringify(any)) as { type?: string }).type;
  return type === typeName;
}

export function encodeFile(any: Record<string, unknown>): Extract<SchemaNode, { type: "file" }>{
  const node: Extract<SchemaNode, { type: "file" }> = { type: "file" };
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

export function decodeFile(node: Extract<SchemaNode, { type: "file" }>): AnySchema {
  let f = v.file();
  const actions: unknown[] = [];
  if (node.minSize !== undefined) actions.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) actions.push(v.maxSize(node.maxSize));
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    const mimeType = (v as unknown as { mimeType: (req: string[] | string) => unknown }).mimeType;
    actions.push(mimeType(node.mimeTypes));
  }
  if (actions.length > 0) f = v.pipe(f, ...(actions as never[]));
  return f;
}

export function fileToCode(node: Extract<SchemaNode, { type: "file" }>): string {
  const base = "v.file()";
  const items: string[] = [];
  if (node.minSize !== undefined) items.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) items.push(`v.maxSize(${node.maxSize})`);
  if (node.mimeTypes && node.mimeTypes.length > 0) {
    items.push(`v.mimeType(${JSON.stringify(node.mimeTypes)})`);
  }
  if (items.length === 0) return base;
  return `v.pipe(${base},${items.join(",")})`;
}

export function fileToJsonSchema(node: Extract<SchemaNode, { type: "file" }>): JsonSchema {
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

export function fileFromJsonSchema(_schema: Record<string, unknown>): Extract<SchemaNode, { type: "file" }>{
  return { type: "file" };
}

