import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
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

export const typeName = "map" as const;

// Serialized node shape for "map"
export interface MapNode extends BaseNode<typeof typeName> {
  key: AnyNode;
  value: AnyNode;
  minSize?: number;
  maxSize?: number;
}

export const isSchemaNode: IsSchemaNode<MapNode> = (
  node: unknown,
  ctx,
): node is MapNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const n = node as Record<string, unknown>;
  if (!ctx.isSchemaNode(n.key) || !ctx.isSchemaNode(n.value)) return false;
  if (n.minSize !== undefined && typeof n.minSize !== "number") return false;
  if (n.maxSize !== undefined && typeof n.maxSize !== "number") return false;
  return true;
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const encode: Encoder<MapNode> = function encodeMap(
  any,
  ctx,
): MapNode {
  const key = (any as { key?: unknown }).key as AnySchema | undefined;
  const value = (any as { value?: unknown }).value as AnySchema | undefined;
  if (!key || !value) {
    throw new Error("Unsupported map schema: missing key/value");
  }
  const node: MapNode = {
    type: typeName,
    key: ctx.encodeNode(key),
    value: ctx.encodeNode(value),
  };
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
          if (typeof req === "number") {
            (node as { minSize?: number }).minSize = req;
          }
          break;
        }
        case "max_size": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") {
            (node as { maxSize?: number }).maxSize = req;
          }
          break;
        }
      }
    }
  }
  return node;
};

export const decode: Decoder<MapNode> = function decodeMap(node, ctx) {
  const base = v.map(
    ctx.decodeNode(node.key) as never,
    ctx.decodeNode(node.value) as never,
  );
  const validators: unknown[] = [];
  if (node.minSize !== undefined) validators.push(v.minSize(node.minSize));
  if (node.maxSize !== undefined) validators.push(v.maxSize(node.maxSize));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    default:
      return v.pipe(base, ...(validators as never[]));
  }
};

export const toCode: ToCode<MapNode> = function mapToCode(node, ctx) {
  const base = `v.map(${ctx.nodeToCode(node.key)},${
    ctx.nodeToCode(node.value)
  })`;
  const validators: string[] = [];
  if (node.minSize !== undefined) validators.push(`v.minSize(${node.minSize})`);
  if (node.maxSize !== undefined) validators.push(`v.maxSize(${node.maxSize})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
};

export const toJsonSchema: ToJsonSchema<MapNode> = function mapToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const schema: JsonSchema = {
    type: "object",
    additionalProperties: ctx.convertNode(node.value),
  } as JsonSchema;
  if (node.minSize !== undefined) {
    (schema as Record<string, unknown>).minProperties = node.minSize;
  }
  if (node.maxSize !== undefined) {
    (schema as Record<string, unknown>).maxProperties = node.maxSize;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function mapFromJsonSchema(
  schema,
  ctx,
): MapNode {
  return {
    type: typeName,
    key: { type: "string" } as never,
    value: ctx.convert(
      ((schema as { additionalProperties?: Record<string, unknown> })
        .additionalProperties ?? {}) as Record<string, unknown>,
    ),
    ...(typeof (schema as { minProperties?: unknown }).minProperties ===
        "number"
      ? { minSize: (schema as { minProperties: number }).minProperties }
      : {}),
    ...(typeof (schema as { maxProperties?: unknown }).maxProperties ===
        "number"
      ? { maxSize: (schema as { maxProperties: number }).maxProperties }
      : {}),
  };
};
