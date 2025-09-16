import {
  FORMAT_VERSION,
  type SchemaNode,
  type SerializedSchema,
} from "../types.ts";
import * as codecs from "../types/index.ts";
import type { AnyNode, IsSchemaNode } from "../types/lib/type_interfaces.ts";

/**
 * Type guard for validating `SerializedSchema` envelopes.
 *
 * Ensures the outer envelope fields and inner AST node are structurally valid.
 *
 * @param value - Unknown input to check.
 * @returns `true` if `value` is a valid `SerializedSchema` (narrows type).
 */
export function isSerializedSchema(value: unknown): value is SerializedSchema {
  if (!value || typeof value !== "object") return false;
  const vObj = value as Record<string, unknown>;
  if (vObj.kind !== "schema") return false;
  if (vObj.vendor !== "valibot") return false;
  if (vObj.version !== 1) return false;
  if (vObj.format !== FORMAT_VERSION) return false;
  const node = vObj.node as SchemaNode | undefined;
  return withCtxIsSchemaNode(node);
}

// Umbrella guard delegates to type-specific guards
const isSchemaNode: IsSchemaNode<AnyNode> = (
  node: unknown,
  _ctx,
): node is SchemaNode => {
  if (!node || typeof node !== "object") return false;
  // Delegate to the first codec whose guard approves this node.
  for (const c of Object.values(codecs)) {
    if (
      typeof c.isSchemaNode === "function" &&
      c.isSchemaNode(node, {
        isSchemaNode: (n) =>
          isSchemaNode(n, {
            isSchemaNode: (x) =>
              isSchemaNode(x, {
                isSchemaNode: (y) =>
                  isSchemaNode(y, { isSchemaNode: (_z) => false }),
              }),
          }),
      })
    ) {
      return true;
    }
  }
  return false;
};

function withCtxIsSchemaNode(n: unknown): boolean {
  // Create a fixed-point context function to allow recursive validation.
  const ctx = { isSchemaNode: (_: unknown) => false as boolean } as {
    isSchemaNode: (node: unknown) => boolean;
  };
  ctx.isSchemaNode = (x: unknown) => isSchemaNode(x, ctx);
  return isSchemaNode(n, ctx);
}
