import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/array", () => {
  it("serialize array node shape", () => {
    const s = serialize(v.array(v.string()));
    expect(s.node).toEqual({ type: "array", item: { type: "string" } });
  });

  it("serialize array constraints (min/max/length)", () => {
    const s1 = serialize(
      v.pipe(v.array(v.string()), v.minLength(2), v.maxLength(3)),
    );
    expect(s1.node).toEqual({
      type: "array",
      item: { type: "string" },
      minLength: 2,
      maxLength: 3,
    });
    const s2 = serialize(v.pipe(v.array(v.number()), v.length(2)));
    expect(s2.node).toEqual({
      type: "array",
      item: { type: "number" },
      length: 2,
    });
  });
});
