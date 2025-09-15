import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/date", () => {
  it("serialize date node", () => {
    const d = fromValibot(v.date());
    expect(d.node).toEqual({ type: "date" });
  });
});
