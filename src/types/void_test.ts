import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/void", () => {
  it("serialize void node shape", () => {
    const ser = fromValibot(v.void());
    expect(ser.node).toEqual({ type: "void" });
  });
});
