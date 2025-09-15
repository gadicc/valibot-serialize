import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/any", () => {
  it("serialize any node shape", () => {
    const ser = fromValibot(v.any());
    expect(ser.node).toEqual({ type: "any" });
  });
});
