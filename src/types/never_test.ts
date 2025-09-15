import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/never", () => {
  it("serialize never node shape", () => {
    const ser = serialize(v.never());
    expect(ser.node).toEqual({ type: "never" });
  });
});
