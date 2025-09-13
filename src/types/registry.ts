import type { BaseIssue, BaseSchema } from "@valibot/valibot";
import type { SchemaNode } from "../types.ts";
import type { JsonSchema } from "../jsonschema.ts";
import * as stringMod from "./string.ts";
import * as numberMod from "./number.ts";
import * as booleanMod from "./boolean.ts";
import * as dateMod from "./date.ts";
import * as literalMod from "./literal.ts";
import * as enumMod from "./enum.ts";
import * as fileMod from "./file.ts";
import * as blobMod from "./blob.ts";
import * as arrayMod from "./array.ts";
import * as objectMod from "./object.ts";
import * as wrappersMod from "./wrappers.ts";
import * as unionMod from "./union.ts";
import * as tupleMod from "./tuple.ts";
import * as recordMod from "./record.ts";
import * as setMod from "./set.ts";
import * as mapMod from "./map.ts";

export type AnySchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export interface TypeCodec<K extends SchemaNode["type"]> {
  typeName: K;
  matches: (schema: { type?: string } & Record<string, unknown>) => boolean;
  encode: (
    schema: { type?: string; pipe?: unknown[] } & Record<string, unknown>,
    ctx: { encodeNode: (schema: AnySchema) => SchemaNode },
  ) => Extract<SchemaNode, { type: K }> | SchemaNode;
  decode: (node: Extract<SchemaNode, { type: K }>, ctx: { decodeNode: (node: SchemaNode) => AnySchema }) => AnySchema;
  toCode: (node: Extract<SchemaNode, { type: K }>, ctx: { nodeToCode: (node: SchemaNode) => string }) => string;
  toJsonSchema: (node: Extract<SchemaNode, { type: K }>, ctx: { convertNode: (node: SchemaNode) => JsonSchema }) => JsonSchema;
  fromJsonSchema: (schema: Record<string, unknown>, ctx: { convert: (js: Record<string, unknown>) => SchemaNode }) => SchemaNode;
}

export const stringCodec: TypeCodec<"string"> = {
  typeName: stringMod.typeName,
  matches: stringMod.matchesValibotType,
  encode: (s) => stringMod.encodeString(s),
  decode: (n) => stringMod.decodeString(n),
  toCode: (n) => stringMod.stringToCode(n),
  toJsonSchema: (n) => stringMod.stringToJsonSchema(n),
  fromJsonSchema: (schema) => stringMod.stringFromJsonSchema(schema) as SchemaNode,
};

export const numberCodec: TypeCodec<"number"> = {
  typeName: numberMod.typeName,
  matches: numberMod.matchesValibotType,
  encode: (s) => numberMod.encodeNumber(s),
  decode: (n) => numberMod.decodeNumber(n),
  toCode: (n) => numberMod.numberToCode(n),
  toJsonSchema: (n) => numberMod.numberToJsonSchema(n),
  fromJsonSchema: (schema) => numberMod.numberFromJsonSchema(schema) as SchemaNode,
};

export const booleanCodec: TypeCodec<"boolean"> = {
  typeName: booleanMod.typeName,
  matches: booleanMod.matchesValibotType,
  encode: (s) => booleanMod.encodeBoolean(s),
  decode: (n) => booleanMod.decodeBoolean(n),
  toCode: (n) => booleanMod.booleanToCode(n),
  toJsonSchema: (n) => booleanMod.booleanToJsonSchema(n),
  fromJsonSchema: (schema) => booleanMod.booleanFromJsonSchema(schema) as SchemaNode,
};

export const dateCodec: TypeCodec<"date"> = {
  typeName: dateMod.typeName,
  matches: dateMod.matchesValibotType,
  encode: (s) => dateMod.encodeDate(s),
  decode: (n) => dateMod.decodeDate(n),
  toCode: (n) => dateMod.dateToCode(n),
  toJsonSchema: (n) => dateMod.dateToJsonSchema(n),
  fromJsonSchema: (schema) => dateMod.dateFromJsonSchema(schema) as SchemaNode,
};

export const literalCodec: TypeCodec<"literal"> = {
  typeName: literalMod.typeName,
  matches: literalMod.matchesValibotType,
  encode: (s) => literalMod.encodeLiteral(s),
  decode: (n) => literalMod.decodeLiteral(n),
  toCode: (n) => literalMod.literalToCode(n),
  toJsonSchema: (n) => literalMod.literalToJsonSchema(n),
  fromJsonSchema: (schema) => literalMod.literalFromJsonSchema(schema) as SchemaNode,
};

export const enumCodec: TypeCodec<"enum"> = {
  typeName: enumMod.typeName,
  matches: enumMod.matchesValibotType,
  encode: (s) => enumMod.encodeEnum(s),
  decode: (n) => enumMod.decodeEnum(n),
  toCode: (n) => enumMod.enumToCode(n),
  toJsonSchema: (n) => enumMod.enumToJsonSchema(n),
  fromJsonSchema: (schema) => enumMod.enumFromJsonSchema(schema) as SchemaNode,
};

export const fileCodec: TypeCodec<"file"> = {
  typeName: fileMod.typeName,
  matches: fileMod.matchesValibotType,
  encode: (s) => fileMod.encodeFile(s),
  decode: (n) => fileMod.decodeFile(n),
  toCode: (n) => fileMod.fileToCode(n),
  toJsonSchema: (n) => fileMod.fileToJsonSchema(n),
  fromJsonSchema: (schema) => fileMod.fileFromJsonSchema(schema) as SchemaNode,
};

export const blobCodec: TypeCodec<"blob"> = {
  typeName: blobMod.typeName,
  matches: blobMod.matchesValibotType,
  encode: (s) => blobMod.encodeBlob(s),
  decode: (n) => blobMod.decodeBlob(n),
  toCode: (n) => blobMod.blobToCode(n),
  toJsonSchema: (n) => blobMod.blobToJsonSchema(n),
  fromJsonSchema: (schema) => blobMod.blobFromJsonSchema(schema) as SchemaNode,
};

export const arrayCodec: TypeCodec<"array"> = {
  typeName: arrayMod.typeName,
  matches: arrayMod.matchesValibotType,
  encode: (s, ctx) => arrayMod.encodeArray(s as never, ctx as never),
  decode: (n, ctx) => arrayMod.decodeArray(n as never, ctx as never),
  toCode: (n, ctx) => arrayMod.arrayToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => arrayMod.arrayToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => arrayMod.arrayFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const objectCodec: TypeCodec<"object"> = {
  typeName: objectMod.typeName,
  matches: objectMod.matchesValibotType,
  encode: (s, ctx) => objectMod.encodeObject(s as never, ctx as never),
  decode: (n, ctx) => objectMod.decodeObject(n as never, ctx as never),
  toCode: (n, ctx) => objectMod.objectToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => objectMod.objectToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => objectMod.objectFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const optionalCodec: TypeCodec<"optional"> = {
  typeName: wrappersMod.optionalTypeName,
  matches: wrappersMod.matchesOptional,
  encode: (s, ctx) => wrappersMod.encodeOptional(s as never, ctx as never),
  decode: (n, ctx) => wrappersMod.decodeOptional(n as never, ctx as never),
  toCode: (n, ctx) => wrappersMod.optionalToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => wrappersMod.optionalToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => wrappersMod.optionalFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const nullableCodec: TypeCodec<"nullable"> = {
  typeName: wrappersMod.nullableTypeName,
  matches: wrappersMod.matchesNullable,
  encode: (s, ctx) => wrappersMod.encodeNullable(s as never, ctx as never),
  decode: (n, ctx) => wrappersMod.decodeNullable(n as never, ctx as never),
  toCode: (n, ctx) => wrappersMod.nullableToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => wrappersMod.nullableToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => wrappersMod.nullableFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const nullishCodec: TypeCodec<"nullish"> = {
  typeName: wrappersMod.nullishTypeName,
  matches: wrappersMod.matchesNullish,
  encode: (s, ctx) => wrappersMod.encodeNullish(s as never, ctx as never),
  decode: (n, ctx) => wrappersMod.decodeNullish(n as never, ctx as never),
  toCode: (n, ctx) => wrappersMod.nullishToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => wrappersMod.nullishToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => wrappersMod.nullishFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const unionCodec: TypeCodec<"union"> = {
  typeName: unionMod.typeName,
  matches: unionMod.matchesValibotType,
  encode: (s, ctx) => unionMod.encodeUnion(s as never, ctx as never),
  decode: (n, ctx) => unionMod.decodeUnion(n as never, ctx as never),
  toCode: (n, ctx) => unionMod.unionToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => unionMod.unionToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => unionMod.unionFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const tupleCodec: TypeCodec<"tuple"> = {
  typeName: tupleMod.typeName,
  matches: tupleMod.matchesValibotType,
  encode: (s, ctx) => tupleMod.encodeTuple(s as never, ctx as never),
  decode: (n, ctx) => tupleMod.decodeTuple(n as never, ctx as never),
  toCode: (n, ctx) => tupleMod.tupleToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => tupleMod.tupleToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => tupleMod.tupleFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const recordCodec: TypeCodec<"record"> = {
  typeName: recordMod.typeName,
  matches: recordMod.matchesValibotType,
  encode: (s, ctx) => recordMod.encodeRecord(s as never, ctx as never),
  decode: (n, ctx) => recordMod.decodeRecord(n as never, ctx as never),
  toCode: (n, ctx) => recordMod.recordToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => recordMod.recordToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => recordMod.recordFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const setCodec: TypeCodec<"set"> = {
  typeName: setMod.typeName,
  matches: setMod.matchesValibotType,
  encode: (s, ctx) => setMod.encodeSet(s as never, ctx as never),
  decode: (n, ctx) => setMod.decodeSet(n as never, ctx as never),
  toCode: (n, ctx) => setMod.setToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => setMod.setToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => setMod.setFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const mapCodec: TypeCodec<"map"> = {
  typeName: mapMod.typeName,
  matches: mapMod.matchesValibotType,
  encode: (s, ctx) => mapMod.encodeMap(s as never, ctx as never),
  decode: (n, ctx) => mapMod.decodeMap(n as never, ctx as never),
  toCode: (n, ctx) => mapMod.mapToCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => mapMod.mapToJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) => mapMod.mapFromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const codecs = [
  stringCodec,
  numberCodec,
  booleanCodec,
  dateCodec,
  literalCodec,
  enumCodec,
  fileCodec,
  blobCodec,
  arrayCodec,
  objectCodec,
  optionalCodec,
  nullableCodec,
  nullishCodec,
  unionCodec,
  tupleCodec,
  recordCodec,
  setCodec,
  mapCodec,
] as const;
export type AnyTypeCodec = (typeof codecs)[number];
