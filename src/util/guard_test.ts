import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize } from "../converters/decode.ts";
import { serialize } from "../converters/encode.ts";
import { FORMAT_VERSION } from "../types.ts";
import { isSerializedSchema } from "./guard.ts";

describe("guards and error paths", () => {
  it("serialize throws on unsupported literal value", () => {
    const fake = {
      type: "literal",
      value: { a: 1 },
    } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(fake as never)).toThrow();
  });

  it("serialize throws on picklist without options", () => {
    const fake = { type: "picklist" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(fake as never)).toThrow();
  });

  it("serialize throws on object missing/invalid entries", () => {
    const missing = { type: "object" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(missing as never)).toThrow();
    const invalid = {
      type: "object",
      entries: { a: undefined },
    } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(invalid as never)).toThrow();
  });

  it("serialize throws on tuple_with_rest missing parts", () => {
    const noItems = {
      type: "tuple_with_rest",
      rest: v.number(),
    } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(noItems as never)).toThrow();
    const noRest = {
      type: "tuple_with_rest",
      items: [v.string()],
    } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(noRest as never)).toThrow();
  });

  it("serialize throws on record without key/value and enum without options", () => {
    const rec = { type: "record" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(rec as never)).toThrow();
    const en = { type: "enum" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(en as never)).toThrow();
  });

  it("serialize throws on map/optional/nullable/nullish bad shapes and enum bad value", () => {
    const badMap1 = { type: "map" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(badMap1 as never)).toThrow();
    const badMap2 = { type: "map", key: v.string() } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(badMap2 as never)).toThrow();

    const badOpt = { type: "optional" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(badOpt as never)).toThrow();
    const badNul = { type: "nullable" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(badNul as never)).toThrow();
    const badNsh = { type: "nullish" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(badNsh as never)).toThrow();

    const badEnumVal = {
      type: "enum",
      options: [{ a: 1 }],
    } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(badEnumVal as never)).toThrow();
  });

  it("isSerializedSchema rejects invalid string transforms and word counts", () => {
    const base = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const badTransforms = {
      ...base,
      node: { type: "string" as const, transforms: ["bad"] as unknown },
    };
    expect(isSerializedSchema(badTransforms)).toBe(false);
    const badMinWords = {
      ...base,
      node: { type: "string" as const, minWords: "x" as unknown as number },
    };
    expect(isSerializedSchema(badMinWords)).toBe(false);
    const badMaxWords = {
      ...base,
      node: { type: "string" as const, maxWords: {} as unknown as number },
    };
    expect(isSerializedSchema(badMaxWords)).toBe(false);
    const badStarts = {
      ...base,
      node: { type: "string" as const, startsWith: 1 as unknown as string },
    };
    expect(isSerializedSchema(badStarts)).toBe(false);
    const badEnds = {
      ...base,
      node: { type: "string" as const, endsWith: {} as unknown as string },
    };
    expect(isSerializedSchema(badEnds)).toBe(false);
  });

  it("serialize throws on unsupported schema type", () => {
    const unk = { type: "weird" } as unknown as v.BaseSchema<
      unknown,
      unknown,
      v.BaseIssue<unknown>
    >;
    expect(() => serialize(unk as never)).toThrow();
  });

  it("isSerializedSchema rejects invalid node shapes", () => {
    const base = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const badString = { ...base, node: { type: "string", minLength: "x" } };
    expect(isSerializedSchema(badString)).toBe(false);
    const badObject = { ...base, node: { type: "object", entries: "bad" } };
    expect(isSerializedSchema(badObject)).toBe(false);
    const badEnum = { ...base, node: { type: "enum", values: [{ a: 1 }] } };
    expect(isSerializedSchema(badEnum)).toBe(false);
    const badArrayLen = {
      ...base,
      node: { type: "array", item: { type: "string" }, length: "x" },
    };
    expect(isSerializedSchema(badArrayLen)).toBe(false);
    // additional guards
    expect(isSerializedSchema(null)).toBe(false);
    expect(isSerializedSchema(123)).toBe(false);
    const notObjectNode = { ...base, node: 1 };
    expect(isSerializedSchema(notObjectNode)).toBe(false);
    const badFlags = { ...base, node: { type: "string", patternFlags: 1 } };
    expect(isSerializedSchema(badFlags)).toBe(false);
  });

  it("deserialize throws on unsupported node type", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: { type: "weird" },
    };
    expect(() => deserialize(payload as never)).toThrow();
  });
});

describe("isSerializedSchema type guard", () => {
  it("accepts valid payload", () => {
    const payload = serialize(v.string());
    expect(isSerializedSchema(payload)).toBe(true);
  });

  it("rejects various invalid shapes across node types", () => {
    const base = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const cases = [
      // object: invalid optionalKeys and rest
      {
        ...base,
        node: {
          type: "object" as const,
          entries: {},
          optionalKeys: [1] as unknown as string[],
        },
      },
      {
        ...base,
        node: {
          type: "object" as const,
          entries: {},
          rest: 123 as unknown as { type: string },
        },
      },
      // union: options not array / invalid element
      {
        ...base,
        node: { type: "union" as const, options: {} as unknown as [] },
      },
      {
        ...base,
        node: { type: "union" as const, options: [{}, 1] as unknown as [] },
      },
      {
        ...base,
        node: {
          type: "union" as const,
          options: [{ type: "string" }, {} as unknown as { type: string }],
        },
      },
      // tuple: items not array / invalid elements
      { ...base, node: { type: "tuple" as const, items: {} as unknown as [] } },
      {
        ...base,
        node: {
          type: "tuple" as const,
          items: [{} as unknown as { type: string }],
        },
      },
      {
        ...base,
        node: {
          type: "tuple" as const,
          items: [{ type: "string" }, 1 as unknown as { type: string }],
        },
      },
      // record: key/value not schema nodes
      {
        ...base,
        node: {
          type: "record" as const,
          key: 1 as unknown as { type: string },
          value: { type: "string" },
        },
      },
      {
        ...base,
        node: {
          type: "record" as const,
          key: { type: "string" },
          value: 2 as unknown as { type: string },
        },
      },
      // set/map: wrong sizes and missing child nodes
      {
        ...base,
        node: { type: "set" as const, value: 1 as unknown as { type: string } },
      },
      {
        ...base,
        node: {
          type: "set" as const,
          value: { type: "string" },
          minSize: "x" as unknown as number,
        },
      },
      {
        ...base,
        node: {
          type: "map" as const,
          key: { type: "string" },
          value: { type: "number" },
          maxSize: {} as unknown as number,
        },
      },
      {
        ...base,
        node: {
          type: "map" as const,
          key: 1 as unknown as { type: string },
          value: { type: "number" },
        },
      },
      // number: wrong field types
      {
        ...base,
        node: { type: "number" as const, min: "1" as unknown as number },
      },
      {
        ...base,
        node: { type: "number" as const, max: {} as unknown as number },
      },
      {
        ...base,
        node: { type: "number" as const, gt: "1" as unknown as number },
      },
      {
        ...base,
        node: { type: "number" as const, lt: [] as unknown as number },
      },
      {
        ...base,
        node: { type: "number" as const, integer: false as unknown as true },
      },
      {
        ...base,
        node: { type: "number" as const, multipleOf: "2" as unknown as number },
      },
      // file/blob: bad mimeTypes
      {
        ...base,
        node: { type: "file" as const, mimeTypes: [1] as unknown as string[] },
      },
      {
        ...base,
        node: { type: "blob" as const, mimeTypes: [1] as unknown as string[] },
      },
      // literal: bad value
      {
        ...base,
        node: { type: "literal" as const, value: { a: 1 } as unknown as never },
      },
      // array: invalid item and wrong bounds
      {
        ...base,
        node: {
          type: "array" as const,
          item: 1 as unknown as { type: string },
        },
      },
      {
        ...base,
        node: {
          type: "array" as const,
          item: { type: "string" },
          minLength: "x" as unknown as number,
        },
      },
      // wrappers: base missing or invalid
      {
        ...base,
        node: { type: "optional" as const } as unknown as {
          kind: "schema";
          vendor: "valibot";
          version: 1;
          format: typeof FORMAT_VERSION;
          node: { type: "optional" };
        },
      },
      {
        ...base,
        node: {
          type: "nullable" as const,
          base: 1 as unknown as { type: string },
        },
      },
      {
        ...base,
        node: {
          type: "nullish" as const,
          base: 1 as unknown as { type: string },
        },
      },
    ];
    for (const payload of cases) {
      expect(isSerializedSchema(payload)).toBe(false);
    }
  });

  it("rejects wrong vendor/version/format", () => {
    const payload = serialize(v.string());
    const badVendor = { ...payload, vendor: "other" as const };
    const badVersion = { ...payload, version: 2 as 1 } as typeof payload;
    const badFormat = {
      ...payload,
      format: (FORMAT_VERSION + 1) as typeof FORMAT_VERSION,
    } as typeof payload;
    expect(isSerializedSchema(badVendor)).toBe(false);
    expect(isSerializedSchema(badVersion)).toBe(false);
    expect(isSerializedSchema(badFormat)).toBe(false);
  });

  it("accepts comprehensive node shapes", () => {
    const base = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const ok = isSerializedSchema({
      ...base,
      node: {
        type: "object" as const,
        entries: {
          a: {
            type: "string" as const,
            minLength: 1,
            maxLength: 2,
            length: 2,
            pattern: "x",
            patternFlags: "i",
            email: true,
            rfcEmail: true,
            url: true,
            uuid: true,
            ip: true,
            ipv4: true,
            ipv6: true,
            hexColor: true,
            slug: true,
            creditCard: true,
            imei: true,
            mac: true,
            mac48: true,
            mac64: true,
            base64: true,
            ulid: true,
            nanoid: true,
            cuid2: true,
            isoDate: true,
            isoDateTime: true,
            isoTime: true,
            isoTimeSecond: true,
            isoTimestamp: true,
            isoWeek: true,
            digits: true,
            emoji: true,
            hexadecimal: true,
            minGraphemes: 1,
            maxGraphemes: 2,
            minWords: 1,
            maxWords: 2,
            startsWith: "a",
            endsWith: "b",
            transforms: [
              "trim",
              "trimStart",
              "trimEnd",
              "toUpperCase",
              "toLowerCase",
              "normalize",
            ],
          },
          b: {
            type: "number" as const,
            min: 1,
            max: 2,
            gt: 0,
            lt: 3,
            integer: true,
            safeInteger: true,
            multipleOf: 1,
            finite: true,
          },
        },
        optionalKeys: ["b"],
        policy: "loose" as const,
        rest: { type: "boolean" as const },
        minEntries: 1,
        maxEntries: 3,
      },
    });
    expect(ok).toBe(true);

    const others = [
      { type: "bigint" as const },
      { type: "boolean" as const },
      { type: "undefined" as const },
      { type: "void" as const },
      { type: "symbol" as const },
      { type: "date" as const },
      {
        type: "file" as const,
        minSize: 1,
        maxSize: 2,
        mimeTypes: ["text/plain"],
      },
      {
        type: "blob" as const,
        minSize: 1,
        maxSize: 2,
        mimeTypes: ["text/plain"],
      },
      { type: "literal" as const, value: null },
      {
        type: "array" as const,
        item: { type: "boolean" as const },
        minLength: 1,
        maxLength: 2,
        length: 1,
      },
      { type: "optional" as const, base: { type: "number" as const } },
      { type: "nullable" as const, base: { type: "number" as const } },
      { type: "nullish" as const, base: { type: "number" as const } },
      {
        type: "union" as const,
        options: [{ type: "string" as const }, { type: "number" as const }],
      },
      {
        type: "tuple" as const,
        items: [{ type: "string" as const }, { type: "number" as const }],
        rest: { type: "boolean" as const },
      },
      {
        type: "record" as const,
        key: { type: "string" as const },
        value: { type: "number" as const },
      },
      { type: "enum" as const, values: ["a", 1, true, null] },
      {
        type: "set" as const,
        value: { type: "string" as const },
        minSize: 1,
        maxSize: 2,
      },
      {
        type: "map" as const,
        key: { type: "string" as const },
        value: { type: "number" as const },
        minSize: 1,
        maxSize: 2,
      },
    ] as const;
    for (const node of others) {
      const ok2 = isSerializedSchema(
        {
          kind: "schema",
          vendor: "valibot",
          version: 1,
          format: FORMAT_VERSION,
          node,
        } as const,
      );
      expect(ok2).toBe(true);
    }
  });
});
