import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/unknown", () => {
  it("serialize unknown node shape", () => {
    const ser = serialize(v.unknown());
    expect(ser.node).toEqual({ type: "unknown" });
  });
});
