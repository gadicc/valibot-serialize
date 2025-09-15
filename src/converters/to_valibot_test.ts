import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { toValibot } from "./to_valibot.ts";
import { fromValibot } from "./from_valibot.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("converters/decode behavior", () => {
  it("string", () => {
    const serialized = fromValibot(v.string());
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, "ok")).not.toThrow();
    expect(() => v.parse(schema, 123)).toThrow();
  });

  it("array of strings", () => {
    const serialized = fromValibot(v.array(v.string()));
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, ["a", "b"]))
      .not.toThrow();
    expect(() => v.parse(schema, [1, 2]))
      .toThrow();
  });

  it("object with primitives", () => {
    const serialized = fromValibot(v.object({ a: v.string(), b: v.number() }));
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, { a: "x", b: 1 }))
      .not.toThrow();
    expect(() => v.parse(schema, { a: 1, b: "x" }))
      .toThrow();
  });

  it("pick/omit/partial behavior", () => {
    const base = v.object({ a: v.string(), b: v.number(), c: v.boolean() });
    const picked = toValibot(fromValibot(v.pick(base, ["a", "b"])));
    expect(() => v.parse(picked, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(picked, { a: "x" as unknown as number })).toThrow();

    const omitted = toValibot(fromValibot(v.omit(base, ["c"])));
    expect(() => v.parse(omitted, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(omitted, { a: "x", b: 1, c: true })).not.toThrow();

    const partial = toValibot(fromValibot(v.partial(base)));
    expect(() => v.parse(partial, {})).not.toThrow();
    expect(() => v.parse(partial, { a: "x" })).not.toThrow();
  });

  it("loose/strict/rest behavior", () => {
    const loose = toValibot(fromValibot(v.looseObject({ a: v.string() })));
    expect(() => v.parse(loose, { a: "x", extra: 1 })).not.toThrow();

    const strict = toValibot(fromValibot(v.strictObject({ a: v.string() })));
    expect(() => v.parse(strict, { a: "x" })).not.toThrow();
    expect(() => v.parse(strict, { a: "x", extra: 1 })).toThrow();

    const rest = toValibot(
      fromValibot(v.objectWithRest({ a: v.string() }, v.number())),
    );
    expect(() => v.parse(rest, { a: "x", extra: 1 })).not.toThrow();
    expect(() => v.parse(rest, { a: "x", extra: "no" })).toThrow();
    const counted = toValibot(
      fromValibot(
        v.pipe(v.object({ a: v.string(), b: v.number() }), v.minEntries(2)),
      ),
    );
    expect(() => v.parse(counted, { a: "x", b: 1 })).not.toThrow();
    expect(() => v.parse(counted, { a: "x" })).toThrow();
  });

  it("optional string", () => {
    const serialized = fromValibot(v.optional(v.string()));
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, undefined)).not.toThrow();
    expect(() => v.parse(schema, "hi")).not.toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("nullable number", () => {
    const serialized = fromValibot(v.nullable(v.number()));
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, null)).not.toThrow();
    expect(() => v.parse(schema, 1)).not.toThrow();
    expect(() => v.parse(schema, "1")).toThrow();
  });

  it("nullish boolean", () => {
    const serialized = fromValibot(v.nullish(v.boolean()));
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, null)).not.toThrow();
    expect(() => v.parse(schema, undefined)).not.toThrow();
    expect(() => v.parse(schema, true)).not.toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("string constraints behavior", () => {
    const serialized = fromValibot(
      v.pipe(v.string(), v.minLength(2), v.regex(/^a/)),
    );
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, "ab")).not.toThrow();
    expect(() => v.parse(schema, "b")).toThrow();
    expect(() => v.parse(schema, "a")).toThrow();
  });

  it("number constraints behavior", () => {
    const serialized = fromValibot(
      v.pipe(v.number(), v.minValue(2), v.maxValue(3)),
    );
    const schema = toValibot(serialized);
    expect(() => v.parse(schema, 2)).not.toThrow();
    expect(() => v.parse(schema, 4)).toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("union/tuple/record behavior", () => {
    const u = toValibot(fromValibot(v.union([v.string(), v.number()])));
    expect(() => v.parse(u, "ok")).not.toThrow();
    expect(() => v.parse(u, 123)).not.toThrow();
    expect(() => v.parse(u, true)).toThrow();

    const t = toValibot(fromValibot(v.tuple([v.string(), v.number()])));
    expect(() => v.parse(t, ["a", 1])).not.toThrow();
    expect(() => v.parse(t, [1, "a"]))
      .toThrow();

    const r = toValibot(fromValibot(v.record(v.string(), v.number())));
    expect(() => v.parse(r, { a: 1, b: 2 })).not.toThrow();
    expect(() => v.parse(r, { a: "x" }))
      .toThrow();
  });

  it("enum + set/map behavior", () => {
    const e = toValibot(fromValibot(v.union([v.literal("a"), v.literal("b")])));
    expect(() => v.parse(e, "a")).not.toThrow();
    expect(() => v.parse(e, "c")).toThrow();

    const s = toValibot(fromValibot(v.set(v.number())));
    expect(() => v.parse(s, new Set([1, 2]))).not.toThrow();
    expect(() => v.parse(s, [1, 2] as unknown as Set<number>)).toThrow();

    const m = toValibot(fromValibot(v.map(v.string(), v.number())));
    expect(() => v.parse(m, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(m, { a: 1 } as unknown as Map<string, number>))
      .toThrow();
  });

  it("array constraints behavior", () => {
    const s = toValibot(
      fromValibot(v.pipe(v.array(v.number()), v.minLength(1), v.maxLength(2))),
    );
    expect(() => v.parse(s, [1])).not.toThrow();
    expect(() => v.parse(s, [1, 2])).not.toThrow();
    expect(() => v.parse(s, [])).toThrow();
    expect(() => v.parse(s, [1, 2, 3])).toThrow();
  });

  it("string formats behavior", () => {
    const s = toValibot(
      fromValibot(
        v.pipe(v.string(), v.email(), v.rfcEmail(), v.startsWith("a")),
      ),
    );
    expect(() => v.parse(s, "a@test.com")).not.toThrow();
    expect(() => v.parse(s, "test.com")).toThrow();
    expect(() => v.parse(s, "b@test.com")).toThrow();
  });

  it("string transforms behavior", () => {
    const s = toValibot(
      fromValibot(v.pipe(v.string(), v.trim(), v.toUpperCase())),
    );
    expect(v.parse(s, "  a ")).toBe("A");
  });

  it("credit card behavior", () => {
    const s = toValibot(fromValibot(v.pipe(v.string(), v.creditCard())));
    expect(() => v.parse(s, "4111111111111111")).not.toThrow();
    expect(() => v.parse(s, "123")).toThrow();
  });

  it("array nonEmpty behavior", () => {
    const s = toValibot(fromValibot(v.pipe(v.array(v.string()), v.nonEmpty())));
    expect(() => v.parse(s, ["a"])).not.toThrow();
    expect(() => v.parse(s, [])).toThrow();
  });

  it("date behavior", () => {
    const s = toValibot(fromValibot(v.date()));
    expect(() => v.parse(s, new Date())).not.toThrow();
    expect(() => v.parse(s, "2020-01-01")).toThrow();
  });

  it("file behavior", () => {
    const f = toValibot(
      fromValibot(
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
    const b = toValibot(
      fromValibot(
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
    const setSchema = toValibot(setSerialized);
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
    const mapSchema = toValibot(mapSerialized);
    expect(() => v.parse(mapSchema, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(mapSchema, new Map())).toThrow();
  });

  it("tuple with rest behavior", () => {
    const schema = toValibot(
      fromValibot(v.tupleWithRest([v.string()], v.number())),
    );
    expect(() => v.parse(schema, ["a"])).not.toThrow();
    expect(() => v.parse(schema, ["a", 1, 2])).not.toThrow();
    expect(() => v.parse(schema, [1])).toThrow();
    expect(() => v.parse(schema, ["a", "b"])).toThrow();
  });
});

describe("converters round-trip", () => {
  it("string", () => {
    const original = v.string();
    const deserialized = toValibot(fromValibot(original));
    expect(() => v.parse(deserialized, "hi")).not.toThrow();
    expect(() => v.parse(deserialized, 1)).toThrow();
  });

  it("array", () => {
    const original = v.array(v.number());
    const deserialized = toValibot(fromValibot(original));
    expect(() => v.parse(deserialized, [1, 2, 3])).not.toThrow();
    expect(() => v.parse(deserialized, ["1"]))
      .toThrow();
  });

  it("object", () => {
    const original = v.object({ a: v.string(), b: v.boolean() });
    const deserialized = toValibot(fromValibot(original));
    expect(() => v.parse(deserialized, { a: "ok", b: true }))
      .not.toThrow();
    expect(() => v.parse(deserialized, { a: 1, b: "no" }))
      .toThrow();
  });

  it("optional + constraints", () => {
    const original = v.optional(v.pipe(v.string(), v.minLength(2)));
    const deserialized = toValibot(fromValibot(original));
    expect(() => v.parse(deserialized, undefined)).not.toThrow();
    expect(() => v.parse(deserialized, "a")).toThrow();
    expect(() => v.parse(deserialized, "ab")).not.toThrow();
  });
});
