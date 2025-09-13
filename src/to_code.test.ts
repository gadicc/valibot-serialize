import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize, toCode } from "../main.ts";

describe("toCode", () => {
  it("object with primitives (compact)", () => {
    const ast = serialize(
      v.object({ email: v.string(), password: v.string() }),
    );
    const code = toCode(ast);
    expect(code).toBe("v.object({email:v.string(),password:v.string()});");
  });

  it("string with regex and bounds", () => {
    const ast = serialize(
      v.pipe(v.string(), v.minLength(3), v.maxLength(5), v.regex(/abc/i)),
    );
    const code = toCode(ast);
    expect(code).toBe(
      "v.pipe(v.string(),v.minLength(3),v.maxLength(5),v.regex(/abc/i));",
    );
  });

  it("number constraints", () => {
    const ast = serialize(v.pipe(v.number(), v.minValue(1), v.maxValue(10)));
    const code = toCode(ast);
    expect(code).toBe("v.pipe(v.number(),v.minValue(1),v.maxValue(10));");
  });

  it("enum uses picklist for strings", () => {
    const ast = serialize(v.picklist(["x", "y"]));
    const code = toCode(ast);
    expect(code).toBe('v.picklist(["x","y"]);');
  });

  it("evaluated code reconstructs equivalent schema", () => {
    const original = v.object({
      a: v.array(v.number()),
      b: v.optional(v.string()),
    });
    const ast = serialize(original);
    const code = toCode(ast);
    const build = new Function("v", "return " + code) as (
      vx: typeof v,
    ) => unknown;
    const schema = build(v) as unknown;
    const rebuilt = serialize(schema as never);
    expect(rebuilt.node).toEqual(ast.node);
  });
});
