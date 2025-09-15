import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/bigint", () => {
  it("serialize bigint node shape", () => {
    const ser = fromValibot(v.bigint());
    expect(ser.node).toEqual({ type: "bigint" });
  });
});
