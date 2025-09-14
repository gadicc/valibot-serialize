import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/boolean", () => {
  it("serialize boolean node shape", () => {
    const ser = serialize(v.boolean());
    expect(ser.node).toEqual({ type: "boolean" });
  });
});
