import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/undefined", () => {
  it("serialize undefined node shape", () => {
    const ser = fromValibot(v.undefined());
    expect(ser.node).toEqual({ type: "undefined" });
  });
});
