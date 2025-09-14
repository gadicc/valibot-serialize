import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/tuple", () => {
  it("serialize tuple with rest node", () => {
    const t = serialize(v.tupleWithRest([v.string()], v.number()));
    expect(t.node).toEqual({
      type: "tuple",
      items: [{ type: "string" }],
      rest: { type: "number" },
    });
  });

  it("serialize fixed tuple node", () => {
    const t = serialize(v.tuple([v.string(), v.number()]));
    expect(t.node).toEqual({
      type: "tuple",
      items: [{ type: "string" }, { type: "number" }],
    });
  });
});
