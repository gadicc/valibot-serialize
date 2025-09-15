import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";
import { toCode } from "../converters/to_code.ts";

describe("types/picklist", () => {
  it("serialize picklist to picklist node", () => {
    const s = serialize(v.picklist(["x", "y", "z"]));
    expect(s.node).toEqual({ type: "picklist", values: ["x", "y", "z"] });
  });

  it("toCode emits picklist", () => {
    const ast = serialize(v.picklist(["x", "y"]));
    const code = toCode(ast);
    expect(code).toBe('v.picklist(["x","y"]);');
  });
});
