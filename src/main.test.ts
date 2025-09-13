import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import {
  deserialize,
  FORMAT_VERSION,
  isSerializedSchema,
  serialize,
  serializedSchemaJson,
  toJsonSchema,
} from "../main.ts";

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

  it("object with optional keys advertises optionalKeys", () => {
    const s = serialize(v.object({ a: v.optional(v.string()), b: v.number() }));
    expect(s.node).toEqual({
      type: "object",
      entries: {
        a: { type: "optional", base: { type: "string" } },
        b: { type: "number" },
      },
      optionalKeys: ["a"],
    });
  });

  it("loose/strict/objectWithRest nodes", () => {
    const loose = serialize(v.looseObject({ a: v.string() }));
    expect(loose.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      policy: "loose",
    });
    const strict = serialize(v.strictObject({ a: v.string() }));
    expect(strict.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      policy: "strict",
    });
    const rest = serialize(v.objectWithRest({ a: v.string() }, v.number()));
    expect(rest.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      rest: { type: "number" },
    });
    const withCounts = serialize(
      v.pipe(v.object({ a: v.string() }), v.minEntries(1), v.maxEntries(2)),
    );
    expect(withCounts.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      minEntries: 1,
      maxEntries: 2,
    });
  });

  it("optional and nullable wrappers", () => {
    const opt = serialize(v.optional(v.string()));
    expect(opt.node).toEqual({ type: "optional", base: { type: "string" } });
    const nul = serialize(v.nullable(v.number()));
    expect(nul.node).toEqual({ type: "nullable", base: { type: "number" } });
    const nsh = serialize(v.nullish(v.boolean()));
    expect(nsh.node).toEqual({ type: "nullish", base: { type: "boolean" } });
  });

  it("string constraints (min/max/regex)", () => {
    const s = serialize(
      v.pipe(v.string(), v.minLength(3), v.maxLength(5), v.regex(/abc/i)),
    );
    expect(s.node).toEqual({
      type: "string",
      minLength: 3,
      maxLength: 5,
      pattern: "abc",
      patternFlags: "i",
    });
  });

  it("number constraints (min/max)", () => {
    const s = serialize(v.pipe(v.number(), v.minValue(1), v.maxValue(10)));
    expect(s.node).toEqual({ type: "number", min: 1, max: 10 });
  });

  it("array constraints (min/max/length)", () => {
    const s1 = serialize(
      v.pipe(v.array(v.string()), v.minLength(2), v.maxLength(3)),
    );
    expect(s1.node).toEqual({
      type: "array",
      item: { type: "string" },
      minLength: 2,
      maxLength: 3,
    });
    const s2 = serialize(v.pipe(v.array(v.number()), v.length(2)));
    expect(s2.node).toEqual({
      type: "array",
      item: { type: "number" },
      length: 2,
    });
  });

  it("string formats and anchors", () => {
    const s = serialize(
      v.pipe(
        v.string(),
        v.email(),
        v.rfcEmail(),
        v.url(),
        v.uuid(),
        v.ip(),
        v.ipv4(),
        v.ipv6(),
        v.hexColor(),
        v.slug(),
        v.isoDate(),
        v.isoDateTime(),
        v.isoTime(),
        v.isoTimeSecond(),
        v.isoTimestamp(),
        v.digits(),
        v.emoji(),
        v.hexadecimal(),
        v.minGraphemes(1),
        v.maxGraphemes(5),
        v.startsWith("ab"),
        v.endsWith("yz"),
      ),
    );
    expect(s.node).toMatchObject({
      type: "string",
      email: true,
      rfcEmail: true,
      url: true,
      uuid: true,
      ip: true,
      ipv4: true,
      ipv6: true,
      hexColor: true,
      slug: true,
      isoDate: true,
      isoDateTime: true,
      isoTime: true,
      isoTimeSecond: true,
      isoTimestamp: true,
      digits: true,
      emoji: true,
      hexadecimal: true,
      minGraphemes: 1,
      maxGraphemes: 5,
      startsWith: "ab",
      endsWith: "yz",
    });
  });

  it("ulid/nanoid/cuid2 + isoWeek flags", () => {
    const s = serialize(
      v.pipe(v.string(), v.ulid(), v.nanoid(), v.cuid2(), v.isoWeek()),
    );
    expect(s.node).toMatchObject({
      type: "string",
      ulid: true,
      nanoid: true,
      cuid2: true,
      isoWeek: true,
    });
  });

  it("number extras (integer/safe/multipleOf)", () => {
    const s = serialize(
      v.pipe(
        v.number(),
        v.finite(),
        v.integer(),
        v.safeInteger(),
        v.multipleOf(3),
        v.gtValue(1),
        v.ltValue(9),
      ),
    );
    expect(s.node).toEqual({
      type: "number",
      finite: true,
      integer: true,
      safeInteger: true,
      multipleOf: 3,
      gt: 1,
      lt: 9,
    });
  });

  it("enum node (union of literals and picklist)", () => {
    const u = serialize(v.union([v.literal("a"), v.literal("b")]));
    expect(u.node).toEqual({ type: "enum", values: ["a", "b"] });
    const e = serialize(v.picklist(["x", "y", "z"]));
    expect(e.node).toEqual({ type: "enum", values: ["x", "y", "z"] });
  });

  it("set and map nodes", () => {
    const s = serialize(v.set(v.string()));
    expect(s.node).toEqual({ type: "set", value: { type: "string" } });
    const m = serialize(v.map(v.string(), v.number()));
    expect(m.node).toEqual({
      type: "map",
      key: { type: "string" },
      value: { type: "number" },
    });
  });

  it("tuple with rest node", () => {
    const t = serialize(v.tupleWithRest([v.string()], v.number()));
    expect(t.node).toEqual({
      type: "tuple",
      items: [{ type: "string" }],
      rest: { type: "number" },
    });
  });

  it("date node shape", () => {
    const d = serialize(v.date());
    expect(d.node).toEqual({ type: "date" });
  });

  it("string transforms shape", () => {
    const s = serialize(v.pipe(v.string(), v.trim(), v.toUpperCase()));
    expect(s.node).toMatchObject({
      type: "string",
      transforms: ["trim", "toUpperCase"],
    });
  });

  it("file node shape", () => {
    const f = serialize(
      v.pipe(v.file(), v.minSize(1), v.maxSize(2), v.mimeType(["text/plain"])),
    );
    expect(f.node).toEqual({
      type: "file",
      minSize: 1,
      maxSize: 2,
      mimeTypes: ["text/plain"],
    });
  });

  it("blob node shape", () => {
    const b = serialize(
      v.pipe(v.blob(), v.minSize(1), v.maxSize(2), v.mimeType(["text/plain"])),
    );
    expect(b.node).toEqual({
      type: "blob",
      minSize: 1,
      maxSize: 2,
      mimeTypes: ["text/plain"],
    });
  });

  it("union, tuple, record nodes", () => {
    const u = serialize(v.union([v.string(), v.number()]));
    expect(u.node).toEqual({
      type: "union",
      options: [{ type: "string" }, { type: "number" }],
    });
    const t = serialize(v.tuple([v.string(), v.number()]));
    expect(t.node).toEqual({
      type: "tuple",
      items: [{ type: "string" }, { type: "number" }],
    });
    const r = serialize(v.record(v.string(), v.number()));
    expect(r.node).toEqual({
      type: "record",
      key: { type: "string" },
      value: { type: "number" },
    });
  });

  it("serialized JSON Schema shape", () => {
    // Weak structural checks without using `any`
    expect(typeof serializedSchemaJson.$schema).toBe("string");
    const props = (serializedSchemaJson as Record<string, unknown>)
      .properties as Record<string, unknown>;
    expect(typeof props).toBe("object");
    expect(Object.prototype.hasOwnProperty.call(props, "node")).toBe(true);
    const defs = (serializedSchemaJson as Record<string, unknown>)
      .$defs as Record<string, unknown>;
    expect(typeof defs).toBe("object");
    expect(Object.keys(defs).length).toBeGreaterThan(5);
  });

  it("toJsonSchema basics", () => {
    const ast = serialize(
      v.object({ a: v.string(), b: v.optional(v.number()) }),
    );
    const js = toJsonSchema(ast);
    const props = (js as Record<string, unknown>).properties as Record<
      string,
      unknown
    >;
    const req = (js as Record<string, unknown>).required as string[];
    expect((js as Record<string, unknown>).type).toBe("object");
    expect(Object.keys(props)).toEqual(["a", "b"]);
    expect(req).toEqual(["a"]);

    const unionAst = serialize(v.union([v.string(), v.number()]));
    const unionJs = toJsonSchema(unionAst);
    expect((unionJs as Record<string, unknown>).anyOf).toBeDefined();

    const enumAst = serialize(v.picklist(["x", "y"]));
    const enumJs = toJsonSchema(enumAst);
    expect((enumJs as Record<string, unknown>).enum).toEqual(["x", "y"]);
  });

  it("toJsonSchema string ID/validator patterns", () => {
    const idAst = serialize(
      v.pipe(v.string(), v.ulid(), v.nanoid(), v.cuid2(), v.creditCard()),
    );
    const js = toJsonSchema(idAst) as Record<string, unknown>;
    expect(js.type).toBe("string");
    // Expect a combined pattern/allOf present
    expect(
      Object.prototype.hasOwnProperty.call(js, "pattern") ||
        Object.prototype.hasOwnProperty.call(js, "allOf"),
    ).toBe(true);
  });

  it("fromJsonSchema anyOf consts to enum", async () => {
    const { fromJsonSchema } = await import("../main.ts");
    const js = { anyOf: [{ const: "a" }, { const: "b" }] } as unknown as Record<
      string,
      unknown
    >;
    const s = fromJsonSchema(js);
    expect(s.node.type).toBe("enum");
    expect((s.node as { type: string; values: string[] }).values).toEqual([
      "a",
      "b",
    ]);
  });

  it("fromJsonSchema subset roundtrip", async () => {
    const js = {
      type: "object",
      properties: {
        a: { type: "string", minLength: 1 },
        b: { type: "number" },
      },
      required: ["a"],
      additionalProperties: false,
      minProperties: 1,
    } as const;
    const { fromJsonSchema } = await import("../main.ts");
    const serialized = fromJsonSchema(js as unknown as Record<string, unknown>);
    expect(isSerializedSchema(serialized)).toBe(true);
    const node = serialized.node as {
      type: string;
      entries: Record<string, unknown>;
      policy: string;
    };
    expect(node.type).toBe("object");
    expect(Object.keys(node.entries)).toEqual(["a", "b"]);
    expect(node.policy).toBe("strict");
    const back = toJsonSchema(serialized) as Record<string, unknown>;
    expect(back.type).toBe("object");
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
    const badFormat = {
      ...payload,
      format: (FORMAT_VERSION + 1) as typeof FORMAT_VERSION,
    } as typeof payload;
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

  it("pick/omit/partial behavior", () => {
    const base = v.object({ a: v.string(), b: v.number(), c: v.boolean() });
    const picked = deserialize(serialize(v.pick(base, ["a", "b"])));
    expect(() => v.parse(picked, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(picked, { a: "x" as unknown as number })).toThrow();

    const omitted = deserialize(serialize(v.omit(base, ["c"])));
    expect(() => v.parse(omitted, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(omitted, { a: "x", b: 1, c: true })).not.toThrow();

    const partial = deserialize(serialize(v.partial(base)));
    expect(() => v.parse(partial, {})).not.toThrow();
    expect(() => v.parse(partial, { a: "x" })).not.toThrow();
  });

  it("loose/strict/rest behavior", () => {
    const loose = deserialize(serialize(v.looseObject({ a: v.string() })));
    expect(() => v.parse(loose, { a: "x", extra: 1 })).not.toThrow();

    const strict = deserialize(serialize(v.strictObject({ a: v.string() })));
    expect(() => v.parse(strict, { a: "x" })).not.toThrow();
    expect(() => v.parse(strict, { a: "x", extra: 1 })).toThrow();

    const rest = deserialize(
      serialize(v.objectWithRest({ a: v.string() }, v.number())),
    );
    expect(() => v.parse(rest, { a: "x", extra: 1 })).not.toThrow();
    expect(() => v.parse(rest, { a: "x", extra: "no" })).toThrow();
    const counted = deserialize(
      serialize(
        v.pipe(v.object({ a: v.string(), b: v.number() }), v.minEntries(2)),
      ),
    );
    expect(() => v.parse(counted, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(counted, { a: "x" })).toThrow();
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

  it("nullish boolean", () => {
    const serialized = serialize(v.nullish(v.boolean()));
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, null)).not.toThrow();
    expect(() => v.parse(schema, undefined)).not.toThrow();
    expect(() => v.parse(schema, true)).not.toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("string constraints behavior", () => {
    const serialized = serialize(
      v.pipe(v.string(), v.minLength(2), v.regex(/^a/)),
    );
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, "ab")).not.toThrow();
    expect(() => v.parse(schema, "b")).toThrow();
    expect(() => v.parse(schema, "a")).toThrow();
  });

  it("number constraints behavior", () => {
    const serialized = serialize(
      v.pipe(v.number(), v.minValue(2), v.maxValue(3)),
    );
    const schema = deserialize(serialized);
    expect(() => v.parse(schema, 2)).not.toThrow();
    expect(() => v.parse(schema, 4)).toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("union/tuple/record behavior", () => {
    const u = deserialize(serialize(v.union([v.string(), v.number()])));
    expect(() => v.parse(u, "ok")).not.toThrow();
    expect(() => v.parse(u, 123)).not.toThrow();
    expect(() => v.parse(u, true)).toThrow();

    const t = deserialize(serialize(v.tuple([v.string(), v.number()])));
    expect(() => v.parse(t, ["a", 1])).not.toThrow();
    expect(() => v.parse(t, [1, "a"]))
      .toThrow();

    const r = deserialize(serialize(v.record(v.string(), v.number())));
    expect(() => v.parse(r, { a: 1, b: 2 })).not.toThrow();
    expect(() => v.parse(r, { a: "x" }))
      .toThrow();
  });

  it("enum + set/map behavior", () => {
    const e = deserialize(serialize(v.union([v.literal("a"), v.literal("b")])));
    expect(() => v.parse(e, "a")).not.toThrow();
    expect(() => v.parse(e, "c")).toThrow();

    const s = deserialize(serialize(v.set(v.number())));
    expect(() => v.parse(s, new Set([1, 2]))).not.toThrow();
    expect(() => v.parse(s, [1, 2] as unknown as Set<number>)).toThrow();

    const m = deserialize(serialize(v.map(v.string(), v.number())));
    expect(() => v.parse(m, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(m, { a: 1 } as unknown as Map<string, number>))
      .toThrow();
  });

  it("array constraints behavior", () => {
    const s = deserialize(
      serialize(v.pipe(v.array(v.number()), v.minLength(1), v.maxLength(2))),
    );
    expect(() => v.parse(s, [1])).not.toThrow();
    expect(() => v.parse(s, [1, 2])).not.toThrow();
    expect(() => v.parse(s, [])).toThrow();
    expect(() => v.parse(s, [1, 2, 3])).toThrow();
  });

  it("string formats behavior", () => {
    const s = deserialize(
      serialize(v.pipe(v.string(), v.email(), v.rfcEmail(), v.startsWith("a"))),
    );
    // This is approximate: just check a couple cases
    expect(() => v.parse(s, "a@test.com")).not.toThrow();
    expect(() => v.parse(s, "test.com")).toThrow();
    expect(() => v.parse(s, "b@test.com")).toThrow();
  });

  it("string transforms behavior", () => {
    const s = deserialize(
      serialize(v.pipe(v.string(), v.trim(), v.toUpperCase())),
    );
    expect(v.parse(s, "  a ")).toBe("A");
  });

  it("credit card behavior", () => {
    const s = deserialize(serialize(v.pipe(v.string(), v.creditCard())));
    expect(() => v.parse(s, "4111111111111111")).not.toThrow();
    expect(() => v.parse(s, "123")).toThrow();
  });

  it("array nonEmpty behavior", () => {
    const s = deserialize(serialize(v.pipe(v.array(v.string()), v.nonEmpty())));
    expect(() => v.parse(s, ["a"])).not.toThrow();
    expect(() => v.parse(s, [])).toThrow();
  });

  it("date behavior", () => {
    const s = deserialize(serialize(v.date()));
    expect(() => v.parse(s, new Date())).not.toThrow();
    expect(() => v.parse(s, "2020-01-01")).toThrow();
  });

  it("file behavior", () => {
    const f = deserialize(
      serialize(
        v.pipe(
          v.file(),
          v.minSize(1),
          v.maxSize(2),
          v.mimeType(["text/plain"]),
        ),
      ),
    );
    const ok = new File([new Uint8Array(1)], "a.txt", { type: "text/plain" });
    const tooBig = new File([new Uint8Array(3)], "b.txt", {
      type: "text/plain",
    });
    const wrongType = new File([new Uint8Array(1)], "c.bin", {
      type: "application/octet-stream",
    });
    expect(() => v.parse(f, ok)).not.toThrow();
    expect(() => v.parse(f, tooBig)).toThrow();
    expect(() => v.parse(f, wrongType)).toThrow();
  });

  it("blob behavior", () => {
    const b = deserialize(
      serialize(
        v.pipe(
          v.blob(),
          v.minSize(1),
          v.maxSize(2),
          v.mimeType(["text/plain"]),
        ),
      ),
    );
    const ok = new Blob([new Uint8Array(1)], { type: "text/plain" });
    const tooBig = new Blob([new Uint8Array(3)], { type: "text/plain" });
    const wrongType = new Blob([new Uint8Array(1)], {
      type: "application/octet-stream",
    });
    expect(() => v.parse(b, ok)).not.toThrow();
    expect(() => v.parse(b, tooBig)).toThrow();
    expect(() => v.parse(b, wrongType)).toThrow();
  });

  it("set/map constraints behavior", () => {
    const setSerialized = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: {
        type: "set" as const,
        value: { type: "string" as const },
        minSize: 1,
        maxSize: 2,
      },
    };
    const setSchema = deserialize(setSerialized);
    expect(() => v.parse(setSchema, new Set(["a"]))).not.toThrow();
    expect(() => v.parse(setSchema, new Set())).toThrow();
    expect(() => v.parse(setSchema, new Set(["a", "b", "c"]))).toThrow();

    const mapSerialized = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: {
        type: "map" as const,
        key: { type: "string" as const },
        value: { type: "number" as const },
        minSize: 1,
      },
    };
    const mapSchema = deserialize(mapSerialized);
    expect(() => v.parse(mapSchema, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(mapSchema, new Map())).toThrow();
  });

  it("tuple with rest behavior", () => {
    const schema = deserialize(
      serialize(v.tupleWithRest([v.string()], v.number())),
    );
    expect(() => v.parse(schema, ["a"])).not.toThrow();
    expect(() => v.parse(schema, ["a", 1, 2])).not.toThrow();
    expect(() => v.parse(schema, [1])).toThrow();
    expect(() => v.parse(schema, ["a", "b"])).toThrow();
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
