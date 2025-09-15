import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/unknown", () => {
  it("serialize unknown node shape", () => {
    const ser = fromValibot(v.unknown());
    expect(ser.node).toEqual({ type: "unknown" });
  });
});
