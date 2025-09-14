import type { SchemaNode } from "./types.ts";
import type { TypeCodec } from "./type_interfaces.ts";
import * as stringMod from "./types/string.ts";
import * as numberMod from "./types/number.ts";
import * as booleanMod from "./types/boolean.ts";
import * as dateMod from "./types/date.ts";
import * as literalMod from "./types/literal.ts";
import * as enumMod from "./types/enum.ts";
import * as fileMod from "./types/file.ts";
import * as blobMod from "./types/blob.ts";
import * as arrayMod from "./types/array.ts";
import * as objectMod from "./types/object.ts";
import * as optionalMod from "./types/optional.ts";
import * as nullableMod from "./types/nullable.ts";
import * as nullishMod from "./types/nullish.ts";
import * as unionMod from "./types/union.ts";
import * as tupleMod from "./types/tuple.ts";
import * as recordMod from "./types/record.ts";
import * as setMod from "./types/set.ts";
import * as mapMod from "./types/map.ts";

export const stringCodec: TypeCodec<"string"> = {
  typeName: stringMod.typeName,
  matches: stringMod.matches,
  encode: (s, ctx) => stringMod.encode(s as never, ctx as never),
  decode: (n, ctx) => stringMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => stringMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => stringMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    stringMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const numberCodec: TypeCodec<"number"> = {
  typeName: numberMod.typeName,
  matches: numberMod.matches,
  encode: (s, ctx) => numberMod.encode(s as never, ctx as never),
  decode: (n, ctx) => numberMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => numberMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => numberMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    numberMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const booleanCodec: TypeCodec<"boolean"> = {
  typeName: booleanMod.typeName,
  matches: booleanMod.matches,
  encode: (s, ctx) => booleanMod.encode(s as never, ctx as never),
  decode: (n, ctx) => booleanMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => booleanMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => booleanMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    booleanMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const dateCodec: TypeCodec<"date"> = {
  typeName: dateMod.typeName,
  matches: dateMod.matches,
  encode: (s, ctx) => dateMod.encode(s as never, ctx as never),
  decode: (n, ctx) => dateMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => dateMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => dateMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    dateMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const literalCodec: TypeCodec<"literal"> = {
  typeName: literalMod.typeName,
  matches: literalMod.matches,
  encode: (s, ctx) => literalMod.encode(s as never, ctx as never),
  decode: (n, ctx) => literalMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => literalMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => literalMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    literalMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const enumCodec: TypeCodec<"enum"> = {
  typeName: enumMod.typeName,
  matches: enumMod.matches,
  encode: (s, ctx) => enumMod.encode(s as never, ctx as never),
  decode: (n, ctx) => enumMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => enumMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => enumMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    enumMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const fileCodec: TypeCodec<"file"> = {
  typeName: fileMod.typeName,
  matches: fileMod.matches,
  encode: (s, ctx) => fileMod.encode(s as never, ctx as never),
  decode: (n, ctx) => fileMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => fileMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => fileMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    fileMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const blobCodec: TypeCodec<"blob"> = {
  typeName: blobMod.typeName,
  matches: blobMod.matches,
  encode: (s, ctx) => blobMod.encode(s as never, ctx as never),
  decode: (n, ctx) => blobMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => blobMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => blobMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    blobMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const arrayCodec: TypeCodec<"array"> = {
  typeName: arrayMod.typeName,
  matches: arrayMod.matches,
  encode: (s, ctx) => arrayMod.encode(s as never, ctx as never),
  decode: (n, ctx) => arrayMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => arrayMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => arrayMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    arrayMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const objectCodec: TypeCodec<"object"> = {
  typeName: objectMod.typeName,
  matches: objectMod.matches,
  encode: (s, ctx) => objectMod.encode(s as never, ctx as never),
  decode: (n, ctx) => objectMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => objectMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => objectMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    objectMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const optionalCodec: TypeCodec<"optional"> = {
  typeName: optionalMod.typeName,
  matches: optionalMod.matches,
  encode: (s, ctx) => optionalMod.encode(s as never, ctx as never),
  decode: (n, ctx) => optionalMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => optionalMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => optionalMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    optionalMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const nullableCodec: TypeCodec<"nullable"> = {
  typeName: nullableMod.typeName,
  matches: nullableMod.matches,
  encode: (s, ctx) => nullableMod.encode(s as never, ctx as never),
  decode: (n, ctx) => nullableMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => nullableMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => nullableMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    nullableMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const nullishCodec: TypeCodec<"nullish"> = {
  typeName: nullishMod.typeName,
  matches: nullishMod.matches,
  encode: (s, ctx) => nullishMod.encode(s as never, ctx as never),
  decode: (n, ctx) => nullishMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => nullishMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => nullishMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    nullishMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const unionCodec: TypeCodec<"union"> = {
  typeName: unionMod.typeName,
  matches: unionMod.matches,
  encode: (s, ctx) => unionMod.encode(s as never, ctx as never),
  decode: (n, ctx) => unionMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => unionMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => unionMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    unionMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const tupleCodec: TypeCodec<"tuple"> = {
  typeName: tupleMod.typeName,
  matches: tupleMod.matches,
  encode: (s, ctx) => tupleMod.encode(s as never, ctx as never),
  decode: (n, ctx) => tupleMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => tupleMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => tupleMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    tupleMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const recordCodec: TypeCodec<"record"> = {
  typeName: recordMod.typeName,
  matches: recordMod.matches,
  encode: (s, ctx) => recordMod.encode(s as never, ctx as never),
  decode: (n, ctx) => recordMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => recordMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => recordMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    recordMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const setCodec: TypeCodec<"set"> = {
  typeName: setMod.typeName,
  matches: setMod.matches,
  encode: (s, ctx) => setMod.encode(s as never, ctx as never),
  decode: (n, ctx) => setMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => setMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => setMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    setMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
};

export const mapCodec: TypeCodec<"map"> = {
  typeName: mapMod.typeName,
  matches: mapMod.matches,
  encode: (s, ctx) => mapMod.encode(s as never, ctx as never),
  decode: (n, ctx) => mapMod.decode(n as never, ctx as never),
  toCode: (n, ctx) => mapMod.toCode(n as never, ctx as never),
  toJsonSchema: (n, ctx) => mapMod.toJsonSchema(n as never, ctx as never),
  fromJsonSchema: (schema, ctx) =>
    mapMod.fromJsonSchema(schema as never, ctx as never) as SchemaNode,
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
