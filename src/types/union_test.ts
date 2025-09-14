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
});
