import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize, FORMAT_VERSION, isSerializedSchema, serialize } from "./main.ts";

describe("serialize (AST)", () => {
  it("string node shape", () => {
    const string = v.string();
    const serialized = serialize(string);
    expect(serialized).toMatchObject({
      kind: "schema",
      vendor: "valibot",
      version: 1,
      format: FORMAT_VERSION,
      node: { type: "string" },
    });
  });

  it("number and boolean nodes", () => {
    expect(serialize(v.number()).node).toEqual({ type: "number" });
    expect(serialize(v.boolean()).node).toEqual({ type: "boolean" });
  });

  it("array node shape", () => {
    const s = serialize(v.array(v.string()));
    expect(s.node).toEqual({ type: "array", item: { type: "string" } });
  });

  it("object node shape", () => {
    const s = serialize(v.object({ a: v.string(), b: v.number() }));
    expect(s.node).toEqual({
      type: "object",
      entries: { a: { type: "string" }, b: { type: "number" } },
    });
  });

  it("optional and nullable wrappers", () => {
    const opt = serialize(v.optional(v.string()));
    expect(opt.node).toEqual({ type: "optional", base: { type: "string" } });
    const nul = serialize(v.nullable(v.number()));
    expect(nul.node).toEqual({ type: "nullable", base: { type: "number" } });
  });

  it("string constraints (min/max/regex)", () => {
    const s = serialize(v.pipe(v.string(), v.minLength(3), v.maxLength(5), v.regex(/abc/i)));
    expect(s.node).toEqual({ type: "string", minLength: 3, maxLength: 5, pattern: "abc", patternFlags: "i" });
  });

  it("number constraints (min/max)", () => {
    const s = serialize(v.pipe(v.number(), v.minValue(1), v.maxValue(10)));
    expect(s.node).toEqual({ type: "number", min: 1, max: 10 });
  });
});

describe("type guard", () => {
  it("accepts valid payload", () => {
    const payload = serialize(v.string());
    expect(isSerializedSchema(payload)).toBe(true);
  });

  it("rejects wrong vendor/version/format", () => {
    const payload = serialize(v.string());
    const badVendor = { ...payload, vendor: "other" as const };
    const badVersion = { ...payload, version: 2 as 1 } as typeof payload;
    const badFormat = { ...payload, format: (FORMAT_VERSION + 1) as typeof FORMAT_VERSION } as typeof payload;
    expect(isSerializedSchema(badVendor)).toBe(false);
    expect(isSerializedSchema(badVersion)).toBe(false);
    expect(isSerializedSchema(badFormat)).toBe(false);
  });
});

describe("deserialize", () => {
  it("string", () => {
    const serialized = serialize(v.string());
    const schema = deserialize(serialized);
    // Behavior check
    expect(() => v.parse(schema, "ok")).not.toThrow();
    expect(() => v.parse(schema, 123)).toThrow();
  });

  it("array of strings", () => {
    const serialized = serialize(v.array(v.string()));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, ["a", "b"]))
      .not.toThrow();
    expect(() => v.parse(schema, [1, 2]))
      .toThrow();
  });

  it("object with primitives", () => {
    const serialized = serialize(v.object({ a: v.string(), b: v.number() }));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, { a: "x", b: 1 }))
      .not.toThrow();
    expect(() => v.parse(schema, { a: 1, b: "x" }))
      .toThrow();
  });

  it("optional string", () => {
    const serialized = serialize(v.optional(v.string()));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, undefined)).not.toThrow();
    expect(() => v.parse(schema, "hi")).not.toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("nullable number", () => {
    const serialized = serialize(v.nullable(v.number()));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, null)).not.toThrow();
    expect(() => v.parse(schema, 1)).not.toThrow();
    expect(() => v.parse(schema, "1")).toThrow();
  });

  it("string constraints behavior", () => {
    const serialized = serialize(v.pipe(v.string(), v.minLength(2), v.regex(/^a/)));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, "ab")).not.toThrow();
    expect(() => v.parse(schema, "b")).toThrow();
    expect(() => v.parse(schema, "a")).toThrow();
  });

  it("number constraints behavior", () => {
    const serialized = serialize(v.pipe(v.number(), v.minValue(2), v.maxValue(3)));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, 2)).not.toThrow();
    expect(() => v.parse(schema, 4)).toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });
});

describe("round-trip behavior", () => {
  it("string", () => {
    const original = v.string();
    const deserialized = deserialize(serialize(original));
    expect(() => v.parse(deserialized, "hi")).not.toThrow();
    expect(() => v.parse(deserialized, 1)).toThrow();
  });

  it("array", () => {
    const original = v.array(v.number());
    const deserialized = deserialize(serialize(original));
    expect(() => v.parse(deserialized, [1, 2, 3])).not.toThrow();
    expect(() => v.parse(deserialized, ["1"]))
      .toThrow();
  });

  it("object", () => {
    const original = v.object({ a: v.string(), b: v.boolean() });
    const deserialized = deserialize(serialize(original));
    expect(() => v.parse(deserialized, { a: "ok", b: true }))
      .not.toThrow();
    expect(() => v.parse(deserialized, { a: 1, b: "no" }))
      .toThrow();
  });

  it("optional + constraints", () => {
    const original = v.optional(v.pipe(v.string(), v.minLength(2)));
    const deserialized = deserialize(serialize(original));
    expect(() => v.parse(deserialized, undefined)).not.toThrow();
    expect(() => v.parse(deserialized, "a")).toThrow();
    expect(() => v.parse(deserialized, "ab")).not.toThrow();
  });
});
