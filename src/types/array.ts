import * as v from "@valibot/valibot";
import type { AnyNode, BaseNode, IsSchemaNode } from "./lib/type_interfaces.ts";
import type { JsonSchema } from "../converters/to_jsonschema.ts";
import type {
  AnySchema,
  Decoder,
  Encoder,
  FromJsonSchema,
  Matches,
  MatchesJsonSchema,
  ToCode,
  ToJsonSchema,
} from "./lib/type_interfaces.ts";

export const typeName = "array" as const;

// Serialized node shape for "array"
export interface ArrayNode extends BaseNode<typeof typeName> {
  item: AnyNode;
  minLength?: number;
  maxLength?: number;
  length?: number;
}

export const isSchemaNode: IsSchemaNode<ArrayNode> = (
  node: unknown,
  ctx,
): node is ArrayNode => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: unknown }).type !== typeName) return false;
  const n = node as Record<string, unknown>;
  if (!ctx.isSchemaNode(n.item)) return false;
  if (n.minLength !== undefined && typeof n.minLength !== "number") {
    return false;
  }
  if (n.maxLength !== undefined && typeof n.maxLength !== "number") {
    return false;
  }
  if (n.length !== undefined && typeof n.length !== "number") return false;
  return true;
};

export const matches: Matches = (any: AnySchema): boolean => {
  return any?.type === typeName;
};

export const matchesJsonSchema: MatchesJsonSchema = (schema) => {
  const t = (schema as { type?: unknown }).type;
  if (t !== "array") return false;
  if (Array.isArray((schema as { prefixItems?: unknown[] }).prefixItems)) {
    return false; // handled by tuple
  }
  if ((schema as { uniqueItems?: unknown }).uniqueItems === true) {
    return false; // handled by set
  }
  return true;
};

export const encode: Encoder<ArrayNode> = function encodeArray(
  any,
  ctx,
): ArrayNode {
  const child = (any as { item?: unknown }).item as AnySchema | undefined;
  if (!child) throw new Error("Unsupported array schema: missing item schema");
  const node: ArrayNode = {
    type: typeName,
    item: ctx.encodeNode(child),
  };
  const pipe = (any as { pipe?: unknown[] }).pipe as
    | Array<Record<string, unknown>>
    | undefined;
  if (Array.isArray(pipe)) {
    for (const step of pipe) {
      if (!step || typeof step !== "object") continue;
      if (step.kind !== "validation") continue;
      switch (step.type) {
        case "min_length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.minLength = req;
          break;
        }
        case "max_length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.maxLength = req;
          break;
        }
        case "length": {
          const req = step.requirement as number | undefined;
          if (typeof req === "number") node.length = req;
          break;
        }
        case "non_empty": {
          node.minLength = Math.max(1, node.minLength ?? 0);
          break;
        }
      }
    }
  }
  return node;
};

export const decode: Decoder<ArrayNode> = function decodeArray(
  node,
  ctx,
): AnySchema {
  const base = v.array(ctx.decodeNode(node.item));
  const validators: unknown[] = [];
  if (node.minLength !== undefined) {
    validators.push(v.minLength(node.minLength));
  }
  if (node.maxLength !== undefined) {
    validators.push(v.maxLength(node.maxLength));
  }
  if (node.length !== undefined) validators.push(v.length(node.length));
  switch (validators.length) {
    case 0:
      return base;
    case 1:
      return v.pipe(base, validators[0] as never);
    case 2:
      return v.pipe(base, validators[0] as never, validators[1] as never);
    case 3:
      return v.pipe(
        base,
        validators[0] as never,
        validators[1] as never,
        validators[2] as never,
      );
    default:
      return v.pipe(base, ...(validators as never[]));
  }
};

export const toCode: ToCode<ArrayNode> = function arrayToCode(
  node,
  ctx,
): string {
  const base = `v.array(${ctx.nodeToCode(node.item)})`;
  const validators: string[] = [];
  if (node.minLength !== undefined) {
    validators.push(`v.minLength(${node.minLength})`);
  }
  if (node.maxLength !== undefined) {
    validators.push(`v.maxLength(${node.maxLength})`);
  }
  if (node.length !== undefined) validators.push(`v.length(${node.length})`);
  if (validators.length === 0) return base;
  return `v.pipe(${base},${validators.join(",")})`;
};

export const toJsonSchema: ToJsonSchema<ArrayNode> = function arrayToJsonSchema(
  node,
  ctx,
): JsonSchema {
  const schema: JsonSchema = {
    type: "array",
    items: ctx.convertNode(node.item),
  };
  if (node.minLength !== undefined) {
    (schema as Record<string, unknown>).minItems = node.minLength;
  }
  if (node.maxLength !== undefined) {
    (schema as Record<string, unknown>).maxItems = node.maxLength;
  }
  if (node.length !== undefined) {
    (schema as Record<string, unknown>).minItems = node.length;
    (schema as Record<string, unknown>).maxItems = node.length;
  }
  return schema;
};

export const fromJsonSchema: FromJsonSchema = function arrayFromJsonSchema(
  schema,
  ctx,
): ArrayNode {
  return {
    type: typeName,
    item: ctx.convert(
      ((schema as { items?: unknown }).items ?? {}) as Record<string, unknown>,
    ),
    ...(typeof (schema as { minItems?: unknown }).minItems === "number"
      ? { minLength: (schema as { minItems: number }).minItems }
      : {}),
    ...(typeof (schema as { maxItems?: unknown }).maxItems === "number"
      ? { maxLength: (schema as { maxItems: number }).maxItems }
      : {}),
  };
};
