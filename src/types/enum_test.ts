import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize, toCode } from "../../main.ts";

describe("types/enum", () => {
  it("serialize union of literals to enum node", () => {
    const u = serialize(v.union([v.literal("a"), v.literal("b")]));
    expect(u.node).toEqual({ type: "enum", values: ["a", "b"] });
  });

  it("serialize picklist to enum node", () => {
    const e = serialize(v.picklist(["x", "y", "z"]));
    expect(e.node).toEqual({ type: "enum", values: ["x", "y", "z"] });
  });

  it("toCode uses union for mixed literal types", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
    };
    const code = toCode(
      { ...env, node: { type: "enum", values: ["x", 1, true, null] } } as never,
    );
    expect(code).toBe(
      'v.union([v.literal("x"),v.literal(1),v.literal(true),v.literal(null)]);',
    );
  });
});
