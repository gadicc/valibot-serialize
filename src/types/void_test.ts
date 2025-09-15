import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/void", () => {
  it("serialize void node shape", () => {
    const ser = serialize(v.void());
    expect(ser.node).toEqual({ type: "void" });
  });
});
