import type { SchemaNode, SerializedSchema } from "../types.ts";
import {
  arrayCodec,
  blobCodec,
  booleanCodec,
  dateCodec,
  enumCodec,
  fileCodec,
  literalCodec,
  mapCodec,
  nullableCodec,
  nullishCodec,
  numberCodec,
  objectCodec,
  optionalCodec,
  recordCodec,
  setCodec,
  stringCodec,
  tupleCodec,
  unionCodec,
} from "../registry.ts";

type JsonSchema = Record<string, unknown>;

export function toJsonSchema(serialized: SerializedSchema): JsonSchema {
  return convertNode(serialized.node);
}

function convertNode(node: SchemaNode): JsonSchema {
  switch (node.type) {
    case "string":
      return stringCodec.toJsonSchema(node as never, { convertNode });
    case "number":
      return numberCodec.toJsonSchema(node as never, { convertNode });
    case "boolean":
      return booleanCodec.toJsonSchema(node as never, { convertNode });
    case "literal":
      return literalCodec.toJsonSchema(node as never, { convertNode });
    case "array":
      return arrayCodec.toJsonSchema(node as never, { convertNode });
    case "object":
      return objectCodec.toJsonSchema(node as never, { convertNode });
    case "optional":
      return optionalCodec.toJsonSchema(node as never, { convertNode });
    case "nullable":
      return nullableCodec.toJsonSchema(node as never, { convertNode });
    case "nullish":
      return nullishCodec.toJsonSchema(node as never, { convertNode });
    case "union":
      return unionCodec.toJsonSchema(node as never, { convertNode });
    case "tuple":
      return tupleCodec.toJsonSchema(node as never, { convertNode });
    case "record":
      return recordCodec.toJsonSchema(node as never, { convertNode });
    case "enum":
      return enumCodec.toJsonSchema(node as never, { convertNode });
    case "set":
      return setCodec.toJsonSchema(node as never, { convertNode });
    case "map":
      return mapCodec.toJsonSchema(node as never, { convertNode });
    case "date":
      return dateCodec.toJsonSchema(node as never, { convertNode });
    case "file":
      return fileCodec.toJsonSchema(node as never, { convertNode });
    case "blob":
      return blobCodec.toJsonSchema(node as never, { convertNode });
  }
}

// string JSON Schema conversion moved to src/types/string.ts (see stringCodec)

// number JSON Schema conversion moved to src/types/number.ts (see numberCodec)

export type { JsonSchema };
