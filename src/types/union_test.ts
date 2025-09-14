import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/union", () => {
  it("serialize union node", () => {
    const u = serialize(v.union([v.string(), v.number()]));
    expect(u.node).toEqual({
      type: "union",
      options: [{ type: "string" }, { type: "number" }],
    });
  });

  it("toJsonSchema collapses all-literals to enum", async () => {
    const { FORMAT_VERSION, toJsonSchema } = await import("../../main.ts");
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema({
      ...env,
      node: {
        type: "union" as const,
        options: [
          { type: "literal" as const, value: "a" },
          { type: "literal" as const, value: 1 },
        ],
      },
    });
    expect((js as Record<string, unknown>).enum).toEqual(["a", 1]);
  });
});
