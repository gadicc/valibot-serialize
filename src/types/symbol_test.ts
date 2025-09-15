import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/symbol", () => {
  it("serialize symbol node shape", () => {
    const ser = serialize(v.symbol());
    expect(ser.node).toEqual({ type: "symbol" });
  });
});
