import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/date", () => {
  it("serialize date node", () => {
    const d = serialize(v.date());
    expect(d.node).toEqual({ type: "date" });
  });
});
