export const FORMAT_VERSION = 1 as const;

export type PrimitiveLiteral = string | number | boolean | null;

// Build SchemaNode from per-type interfaces
import type { StringNode } from "./types/string.ts";
import type { NumberNode } from "./types/number.ts";
import type { BooleanNode } from "./types/boolean.ts";
import type { DateNode } from "./types/date.ts";
import type { FileNode } from "./types/file.ts";
import type { BlobNode } from "./types/blob.ts";
import type { LiteralNode } from "./types/literal.ts";
import type { ArrayNode } from "./types/array.ts";
import type { ObjectNode } from "./types/object.ts";
import type { OptionalNode } from "./types/optional.ts";
import type { NullableNode } from "./types/nullable.ts";
import type { NullishNode } from "./types/nullish.ts";
import type { UnionNode } from "./types/union.ts";
import type { TupleNode } from "./types/tuple.ts";
import type { RecordNode } from "./types/record.ts";
import type { EnumNode } from "./types/enum.ts";
import type { SetNode } from "./types/set.ts";
import type { MapNode } from "./types/map.ts";

export type SchemaNode =
  | StringNode
  | NumberNode
  | BooleanNode
  | DateNode
  | FileNode
  | BlobNode
  | LiteralNode
  | ArrayNode
  | ObjectNode
  | OptionalNode
  | NullableNode
  | NullishNode
  | UnionNode
  | TupleNode
  | RecordNode
  | EnumNode
  | SetNode
  | MapNode;

export interface SerializedSchema {
  kind: "schema";
  vendor: "valibot";
  version: 1;
  format: typeof FORMAT_VERSION;
  node: SchemaNode;
}
