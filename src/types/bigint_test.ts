import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/bigint", () => {
  it("serialize bigint node shape", () => {
    const ser = serialize(v.bigint());
    expect(ser.node).toEqual({ type: "bigint" });
  });
});
