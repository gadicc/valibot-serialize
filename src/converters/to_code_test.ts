import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "./encode.ts";
import { toCode } from "./to_code.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("toCode", () => {
  it("rejects invalid payload and unknown node", () => {
    expect(() => toCode({} as never)).toThrow();
    const bad = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: { type: "__weird__" },
    };
    expect(() => toCode(bad as never)).toThrow();
  });

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

  it("array validators and tupleWithRest", () => {
    const arr = serialize(
      v.pipe(v.array(v.number()), v.minLength(1), v.maxLength(2)),
    );
    expect(toCode(arr)).toBe(
      "v.pipe(v.array(v.number()),v.minLength(1),v.maxLength(2));",
    );
    const tr = serialize(v.tupleWithRest([v.string()], v.number()));
    expect(toCode(tr)).toBe("v.tupleWithRest([v.string()],v.number());");
  });

  it("set/map/object policies and rest", () => {
    const set = serialize(
      v.pipe(v.set(v.string()), v.minSize(1), v.maxSize(2)),
    );
    expect(toCode(set)).toBe(
      "v.pipe(v.set(v.string()),v.minSize(1),v.maxSize(2));",
    );
    const map = serialize(v.pipe(v.map(v.string(), v.number()), v.minSize(1)));
    expect(toCode(map)).toBe(
      "v.pipe(v.map(v.string(),v.number()),v.minSize(1));",
    );
    const withRest = serialize(v.objectWithRest({ a: v.string() }, v.number()));
    expect(toCode(withRest)).toBe(
      "v.objectWithRest({a:v.string()},v.number());",
    );
  });

  it("blob multi mimeTypes and boolean/date", () => {
    const blob = serialize(
      v.pipe(
        v.blob(),
        v.minSize(1),
        v.maxSize(2),
        v.mimeType(["text/plain", "image/png"]),
      ),
    );
    expect(toCode(blob)).toBe(
      'v.pipe(v.blob(),v.minSize(1),v.maxSize(2),v.mimeType(["text/plain","image/png"]));',
    );
    expect(toCode(serialize(v.boolean()))).toBe("v.boolean();");
    expect(toCode(serialize(v.date()))).toBe("v.date();");
  });

  it("literal code emits correct values", () => {
    const env = { kind: "schema", vendor: "valibot", version: 1, format: 1 };
    expect(toCode({ ...env, node: { type: "literal", value: "x" } } as never))
      .toBe('v.literal("x");');
    expect(toCode({ ...env, node: { type: "literal", value: true } } as never))
      .toBe("v.literal(true);");
    expect(toCode({ ...env, node: { type: "literal", value: null } } as never))
      .toBe("v.literal(null);");
    // Non-finite numbers serialize to null in codegen helper
    expect(
      toCode({ ...env, node: { type: "literal", value: Infinity } } as never),
    )
      .toBe("v.literal(null);");
  });

  it("string regex literals emit correctly (empty and escaped)", () => {
    const empty = serialize(v.pipe(v.string(), v.regex(new RegExp(""))));
    expect(toCode(empty)).toContain("v.regex(/(?:)/)");
    const emptyI = serialize(v.pipe(v.string(), v.regex(new RegExp("", "i"))));
    expect(toCode(emptyI)).toContain("v.regex(/(?:)/i)");
    const slash = serialize(
      v.pipe(v.string(), v.regex(new RegExp("a/b", "i"))),
    );
    expect(toCode(slash)).toContain("/a\\\\/b/i");
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
