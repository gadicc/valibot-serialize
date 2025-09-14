import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/set & map", () => {
  it("serialize set node", () => {
    const s = serialize(v.set(v.string()));
    expect(s.node).toEqual({ type: "set", value: { type: "string" } });
  });

  it("serialize map node", () => {
    const m = serialize(v.map(v.string(), v.number()));
    expect(m.node).toEqual({
      type: "map",
      key: { type: "string" },
      value: { type: "number" },
    });
  });
});
