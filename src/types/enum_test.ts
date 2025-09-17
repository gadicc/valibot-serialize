import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toCode } from "../converters/to_code.ts";

describe("types/enum", () => {
  it("serialize union of non-string literals to enum node", () => {
    const u = fromValibot(v.union([v.literal(1), v.literal(2)]));
    expect(u.node).toEqual({ type: "enum", values: [1, 2] });
  });

  it("toCode uses union for mixed literal types", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
    };
    const code = toCode({
      ...env,
      node: { type: "enum", values: ["x", 1, true, null] },
    } as never);
    expect(code).toBe(
      'v.union([v.literal("x"),v.literal(1),v.literal(true),v.literal(null)])',
    );
  });
});
