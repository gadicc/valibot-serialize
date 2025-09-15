import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/object", () => {
  it("serialize object node shape", () => {
    const s = fromValibot(v.object({ a: v.string(), b: v.number() }));
    expect(s.node).toEqual({
      type: "object",
      entries: { a: { type: "string" }, b: { type: "number" } },
    });
  });

  it("serialize object with optional keys advertises optionalKeys", () => {
    const s = fromValibot(
      v.object({ a: v.optional(v.string()), b: v.number() }),
    );
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
    const loose = fromValibot(v.looseObject({ a: v.string() }));
    expect(loose.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      policy: "loose",
    });
    const strict = fromValibot(v.strictObject({ a: v.string() }));
    expect(strict.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      policy: "strict",
    });
    const rest = fromValibot(v.objectWithRest({ a: v.string() }, v.number()));
    expect(rest.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      rest: { type: "number" },
    });
    const withCounts = fromValibot(
      v.pipe(v.object({ a: v.string() }), v.minEntries(1), v.maxEntries(2)),
    );
    expect(withCounts.node).toEqual({
      type: "object",
      entries: { a: { type: "string" } },
      minEntries: 1,
      maxEntries: 2,
    });
  });

  it("toCode escapes prop keys and toJsonSchema omits empty required", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const code = toCode({
      ...env,
      node: {
        type: "object",
        entries: {
          "a-b": { type: "string" },
          c: { type: "optional", base: { type: "number" } },
        },
      },
    } as never);
    expect(code).toContain('{"a-b":v.string(),c:v.optional(v.number())}');

    const js = toJsonSchema({
      ...env,
      node: {
        type: "object",
        entries: { a: { type: "optional", base: { type: "string" } } },
      },
    } as never) as Record<string, unknown>;
    expect((js as Record<string, unknown>).required).toBeUndefined();
    expect((js.properties as Record<string, unknown>).a).toBeDefined();
  });
});
