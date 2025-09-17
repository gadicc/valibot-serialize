import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toCode } from "../converters/to_code.ts";

describe("types/picklist", () => {
  it("serialize picklist to picklist node", () => {
    const s = fromValibot(v.picklist(["x", "y", "z"]));
    expect(s.node).toEqual({ type: "picklist", values: ["x", "y", "z"] });
  });

  it("toCode emits picklist", () => {
    const ast = fromValibot(v.picklist(["x", "y"]));
    const code = toCode(ast);
    expect(code).toBe('v.picklist(["x","y"])');
  });
});
