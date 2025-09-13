import { isSerializedSchema } from "./guard.ts";
import type { SchemaNode, SerializedSchema } from "./types.ts";
import { stringCodec, numberCodec, booleanCodec, dateCodec, literalCodec, enumCodec, fileCodec, blobCodec, arrayCodec, objectCodec, optionalCodec, nullableCodec, nullishCodec, unionCodec, tupleCodec, recordCodec, setCodec, mapCodec } from "./registry.ts";

// Generate minimal Valibot builder code from a SerializedSchema.
// Returns a compact expression string ending with a semicolon, e.g.:
//   v.object({email:v.string(),password:v.string()});
export function toCode(serialized: SerializedSchema): string {
  if (!isSerializedSchema(serialized)) {
    throw new Error("Invalid serialized schema format");
  }
  return nodeToCode(serialized.node) + ";";
}

function nodeToCode(node: SchemaNode): string {
  switch (node.type) {
    case "string":
      return stringCodec.toCode(node as never, { nodeToCode });
    case "number":
      return numberCodec.toCode(node as never, { nodeToCode });
    case "boolean":
      return booleanCodec.toCode(node as never, { nodeToCode });
    case "date":
      return dateCodec.toCode(node as never, { nodeToCode });
    case "blob":
      return blobCodec.toCode(node as never, { nodeToCode });
    case "file":
      return fileCodec.toCode(node as never, { nodeToCode });
    case "literal":
      return literalCodec.toCode(node as never, { nodeToCode });
    case "array":
      return arrayCodec.toCode(node as never, { nodeToCode });
    case "object":
      return objectCodec.toCode(node as never, { nodeToCode });
    case "optional":
      return optionalCodec.toCode(node as never, { nodeToCode });
    case "nullable":
      return nullableCodec.toCode(node as never, { nodeToCode });
    case "nullish":
      return nullishCodec.toCode(node as never, { nodeToCode });
    case "union":
      return unionCodec.toCode(node as never, { nodeToCode });
    case "tuple":
      return tupleCodec.toCode(node as never, { nodeToCode });
    case "record":
      return recordCodec.toCode(node as never, { nodeToCode });
    case "enum":
      return enumCodec.toCode(node as never, { nodeToCode });
    case "set":
      return setCodec.toCode(node as never, { nodeToCode });
    case "map":
      return mapCodec.toCode(node as never, { nodeToCode });
    default:
      return neverType(node as { type: string });
  }
}

// string/number codegen moved to src/types (see registry)

// file/blob codegen moved to src/types (see registry)

// composite codegen moved to src/types (see registry)

// literal builder now moved to src/types/literal.ts

// regex literal builder now lives in src/types/string.ts

// propKey handled within object codec

function neverType(n: { type: string }): never {
  throw new Error(`Unsupported node type: ${n.type}`);
}
