import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/wrappers", () => {
  it("serialize optional/nullable/nullish wrappers", () => {
    const opt = fromValibot(v.optional(v.string()));
    expect(opt.node).toEqual({ type: "optional", base: { type: "string" } });
    const nul = fromValibot(v.nullable(v.number()));
    expect(nul.node).toEqual({ type: "nullable", base: { type: "number" } });
    const nsh = fromValibot(v.nullish(v.boolean()));
    expect(nsh.node).toEqual({ type: "nullish", base: { type: "boolean" } });
  });

  it("toCode and toJsonSchema for wrappers", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const opt = toCode(
      { ...env, node: { type: "optional", base: { type: "string" } } } as never,
    );
    expect(opt).toBe("v.optional(v.string());");
    const nul = toCode(
      { ...env, node: { type: "nullable", base: { type: "number" } } } as never,
    );
    expect(nul).toBe("v.nullable(v.number());");
    const nsh = toCode(
      { ...env, node: { type: "nullish", base: { type: "boolean" } } } as never,
    );
    expect(nsh).toBe("v.nullish(v.boolean());");

    const nulJs = toJsonSchema(
      { ...env, node: { type: "nullable", base: { type: "string" } } } as never,
    );
    const nshJs = toJsonSchema(
      { ...env, node: { type: "nullish", base: { type: "number" } } } as never,
    );
    expect(Array.isArray((nulJs as Record<string, unknown>).anyOf as unknown[]))
      .toBe(true);
    expect(Array.isArray((nshJs as Record<string, unknown>).anyOf as unknown[]))
      .toBe(true);
  });
});
