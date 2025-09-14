import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/object", () => {
  it("serialize object node shape", () => {
    const s = serialize(v.object({ a: v.string(), b: v.number() }));
    expect(s.node).toEqual({
      type: "object",
      entries: { a: { type: "string" }, b: { type: "number" } },
    });
  });

  it("serialize object with optional keys advertises optionalKeys", () => {
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

  it("serialize loose/strict/rest and min/max entries", () => {
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
});
