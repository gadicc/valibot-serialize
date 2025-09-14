import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/union", () => {
  it("serialize union node", () => {
    const u = serialize(v.union([v.string(), v.number()]));
    expect(u.node).toEqual({
      type: "union",
      options: [{ type: "string" }, { type: "number" }],
    });
  });

  it("toJsonSchema collapses all-literals to enum", () => {
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
