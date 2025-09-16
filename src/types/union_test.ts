import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";
import { isSchemaNode as isUnionNode } from "./union.ts";

describe("types/union", () => {
  it("guard rejects invalid options shapes", () => {
    expect(
      isUnionNode({ type: "union", options: {} } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isUnionNode({ type: "union", options: [{}, 1] } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
  });
  it("serialize union node", () => {
    const u = fromValibot(v.union([v.string(), v.number()]));
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
