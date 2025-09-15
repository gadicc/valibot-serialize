import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/never", () => {
  it("serialize never node shape", () => {
    const ser = fromValibot(v.never());
    expect(ser.node).toEqual({ type: "never" });
  });
});
