import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/enum", () => {
  it("serialize union of literals to enum node", () => {
    const u = serialize(v.union([v.literal("a"), v.literal("b")]));
    expect(u.node).toEqual({ type: "enum", values: ["a", "b"] });
  });

  it("serialize picklist to enum node", () => {
    const e = serialize(v.picklist(["x", "y", "z"]));
    expect(e.node).toEqual({ type: "enum", values: ["x", "y", "z"] });
  });
});
