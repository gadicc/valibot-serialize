import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { FORMAT_VERSION, deserialize, isSerializedSchema, serialize } from "../main.ts";

describe("codec error paths and guards", () => {
  it("serialize throws on unsupported literal value", () => {
    const fake = { type: "literal", value: { a: 1 } } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(fake as never)).toThrow();
  });

  it("serialize throws on picklist without options", () => {
    const fake = { type: "picklist" } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(fake as never)).toThrow();
  });

  it("serialize throws on object missing/invalid entries", () => {
    const missing = { type: "object" } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(missing as never)).toThrow();
    const invalid = { type: "object", entries: { a: undefined } } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(invalid as never)).toThrow();
  });

  it("serialize throws on tuple_with_rest missing parts", () => {
    const noItems = { type: "tuple_with_rest", rest: v.number() } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(noItems as never)).toThrow();
    const noRest = { type: "tuple_with_rest", items: [v.string()] } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(noRest as never)).toThrow();
  });

  it("serialize throws on record without key/value and enum without options", () => {
    const rec = { type: "record" } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(rec as never)).toThrow();
    const en = { type: "enum" } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(en as never)).toThrow();
  });

  it("serialize throws on unsupported schema type", () => {
    const unk = { type: "weird" } as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    expect(() => serialize(unk as never)).toThrow();
  });

  it("isSerializedSchema rejects invalid node shapes", () => {
    const base = { kind: "schema" as const, vendor: "valibot" as const, version: 1 as const, format: FORMAT_VERSION };
    const badString = { ...base, node: { type: "string", minLength: "x" } };
    expect(isSerializedSchema(badString)).toBe(false);
    const badObject = { ...base, node: { type: "object", entries: "bad" } };
    expect(isSerializedSchema(badObject)).toBe(false);
    const badEnum = { ...base, node: { type: "enum", values: [{ a: 1 }] } };
    expect(isSerializedSchema(badEnum)).toBe(false);
    // additional guards
    expect(isSerializedSchema(null)).toBe(false);
    expect(isSerializedSchema(123)).toBe(false);
    const notObjectNode = { ...base, node: 1 };
    expect(isSerializedSchema(notObjectNode)).toBe(false);
    const badFlags = { ...base, node: { type: "string", patternFlags: 1 } };
    expect(isSerializedSchema(badFlags)).toBe(false);
  });

  it("deserialize throws on unsupported node type", () => {
    const payload = { kind: "schema" as const, vendor: "valibot" as const, version: 1 as const, format: FORMAT_VERSION, node: { type: "weird" } };
    expect(() => deserialize(payload as never)).toThrow();
  });

  it("string transforms: trimStart + trimEnd + normalize", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: { type: "string" as const, transforms: ["trimStart", "trimEnd", "normalize"] },
    };
    const schema = deserialize(payload as never);
    expect(v.parse(schema, "  a  ")).toBe("a");
  });

  it("type guard accepts comprehensive node shapes", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
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
            transforms: ["trim", "trimStart", "trimEnd", "toUpperCase", "toLowerCase", "normalize"],
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
    };
    expect(isSerializedSchema(payload)).toBe(true);
    // Add other node kinds for guard execution
    const others = [
      { type: "date" as const },
      { type: "file" as const, minSize: 1, maxSize: 2, mimeTypes: ["text/plain"] },
      { type: "blob" as const, minSize: 1, maxSize: 2, mimeTypes: ["text/plain"] },
      { type: "literal" as const, value: null },
      { type: "array" as const, item: { type: "boolean" as const }, minLength: 1, maxLength: 2, length: 1 },
      { type: "optional" as const, base: { type: "number" as const } },
      { type: "nullable" as const, base: { type: "number" as const } },
      { type: "nullish" as const, base: { type: "number" as const } },
      { type: "union" as const, options: [{ type: "string" as const }, { type: "number" as const }] },
      { type: "tuple" as const, items: [{ type: "string" as const }, { type: "number" as const }], rest: { type: "boolean" as const } },
      { type: "record" as const, key: { type: "string" as const }, value: { type: "number" as const } },
      { type: "enum" as const, values: ["a", 1, true, null] },
      { type: "set" as const, value: { type: "string" as const }, minSize: 1, maxSize: 2 },
      { type: "map" as const, key: { type: "string" as const }, value: { type: "number" as const }, minSize: 1, maxSize: 2 },
    ];
    for (const node of others) {
      const ok = isSerializedSchema({ kind: "schema", vendor: "valibot", version: 1, format: FORMAT_VERSION, node } as const);
      expect(ok).toBe(true);
    }
  });
});
