import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/any", () => {
  it("serialize any node shape", () => {
    const ser = serialize(v.any());
    expect(ser.node).toEqual({ type: "any" });
  });
});
