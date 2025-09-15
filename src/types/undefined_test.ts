import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/undefined", () => {
  it("serialize undefined node shape", () => {
    const ser = serialize(v.undefined());
    expect(ser.node).toEqual({ type: "undefined" });
  });
});
