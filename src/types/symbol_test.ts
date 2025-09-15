import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/symbol", () => {
  it("serialize symbol node shape", () => {
    const ser = fromValibot(v.symbol());
    expect(ser.node).toEqual({ type: "symbol" });
  });
});
