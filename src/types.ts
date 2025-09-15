/**
 * Internal serialization format version for this library.
 *
 * Increment when the AST structure changes in a non-backward-compatible way.
 */
export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

// Build SchemaNode from per-type interfaces
import type { StringNode } from "./types/string.ts";
import type { NumberNode } from "./types/number.ts";
import type { BooleanNode } from "./types/boolean.ts";
import type { BigIntNode } from "./types/bigint.ts";
import type { DateNode } from "./types/date.ts";
import type { FileNode } from "./types/file.ts";
import type { BlobNode } from "./types/blob.ts";
import type { SymbolNode } from "./types/symbol.ts";
import type { LiteralNode } from "./types/literal.ts";
import type { ArrayNode } from "./types/array.ts";
import type { ObjectNode } from "./types/object.ts";
import type { OptionalNode } from "./types/optional.ts";
import type { NullableNode } from "./types/nullable.ts";
import type { NullishNode } from "./types/nullish.ts";
import type { NullNode } from "./types/null.ts";
import type { UnionNode } from "./types/union.ts";
import type { TupleNode } from "./types/tuple.ts";
import type { RecordNode } from "./types/record.ts";
import type { EnumNode } from "./types/enum.ts";
import type { PicklistNode } from "./types/picklist.ts";
import type { SetNode } from "./types/set.ts";
import type { MapNode } from "./types/map.ts";
import type { UndefinedNode } from "./types/undefined.ts";
import type { VoidNode } from "./types/void.ts";
import type { AnyNode } from "./types/any.ts";

/**
 * Union of all AST node variants used by serialized Valibot schemas.
 */
export type SchemaNode =
  | AnyNode
  | StringNode
  | NumberNode
  | BooleanNode
  | BigIntNode
  | DateNode
  | FileNode
  | BlobNode
  | SymbolNode
  | LiteralNode
  | ArrayNode
  | ObjectNode
  | OptionalNode
  | NullableNode
  | NullishNode
  | NullNode
  | UnionNode
  | TupleNode
  | RecordNode
  | EnumNode
  | PicklistNode
  | SetNode
  | MapNode
  | UndefinedNode
  | VoidNode;

/**
 * Stable envelope that wraps a serialized Valibot schema AST.
 */
export interface SerializedSchema {
  kind: "schema";
  vendor: "valibot";
  version: 1;
  format: typeof FORMAT_VERSION;
  node: SchemaNode;
}
