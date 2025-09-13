// import removed; decoders are delegated to codecs now
import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode, SerializedSchema } from "./types.ts";
import { isSerializedSchema } from "./guard.ts";
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
} from "./registry.ts";

type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// Decoder: SerializedSchema -> Valibot schema
export function deserialize(data: SerializedSchema): AnySchema {
  if (!isSerializedSchema(data)) {
    throw new Error("Invalid serialized schema format");
  }
  return decodeNode(data.node);
}

function decodeNode(node: SchemaNode): AnySchema {
  switch (node.type) {
    case "string":
      return stringCodec.decode(node as never, { decodeNode });
    case "number":
      return numberCodec.decode(node as never, { decodeNode });
    case "boolean":
      return booleanCodec.decode(node as never, { decodeNode });
    case "date":
      return dateCodec.decode(node as never, { decodeNode });
    case "blob":
      return blobCodec.decode(node as never, { decodeNode });
    case "file":
      return fileCodec.decode(node as never, { decodeNode });
    case "literal":
      return literalCodec.decode(node as never, { decodeNode });
    case "array":
      return arrayCodec.decode(node as never, { decodeNode });
    case "object":
      return objectCodec.decode(node as never, { decodeNode });
    case "optional":
      return optionalCodec.decode(node as never, { decodeNode });
    case "nullable":
      return nullableCodec.decode(node as never, { decodeNode });
    case "nullish":
      return nullishCodec.decode(node as never, { decodeNode });
    case "union":
      return unionCodec.decode(node as never, { decodeNode });
    case "tuple":
      return tupleCodec.decode(node as never, { decodeNode });
    case "record":
      return recordCodec.decode(node as never, { decodeNode });
    case "enum":
      return enumCodec.decode(node as never, { decodeNode });
    case "set":
      return setCodec.decode(node as never, { decodeNode });
    case "map":
      return mapCodec.decode(node as never, { decodeNode });
    default:
      throw new Error(
        `Unsupported node type: ${(node as { type: string }).type}`,
      );
  }
}

// string/number decoders now live in src/types (see registry)

// composite decoders removed; handled via codecs

// file/blob decoders moved to src/types (see registry)

// composite decoders removed; handled via codecs
