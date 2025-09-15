import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/boolean", () => {
  it("serialize boolean node shape", () => {
    const ser = fromValibot(v.boolean());
    expect(ser.node).toEqual({ type: "boolean" });
  });
});
