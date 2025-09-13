import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize, deserialize, toJsonSchema, toCode, fromJsonSchema } from "../../main.ts";

describe("types/string integration", () => {
  it("serialize captures string validators and transforms", () => {
    const schema = v.pipe(
      v.string(),
      v.minLength(3),
      v.maxLength(5),
      v.trim(),
    );
    const ser = serialize(schema as never);
    expect(ser.node.type).toBe("string");
    const s = ser.node as Extract<NonNullable<typeof ser.node>, { type: "string" }>;
    expect(s.minLength).toBe(3);
    expect(s.maxLength).toBe(5);
    expect(s.transforms).toEqual(["trim"]);
  });

  it("deserialize builds working string schema", () => {
    const node = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: {
        type: "string" as const,
        minLength: 2,
        startsWith: "a",
        transforms: ["toUpperCase"],
      },
    };
    const schema = deserialize(node as never);
    expect(v.parse(schema, "ab")).toBe("AB");
    expect(() => v.parse(schema, "b")).toThrow();
  });

  it("toCode emits pipe for string validators", () => {
    const expr = toCode({
      kind: "schema",
      vendor: "valibot",
      version: 1,
      format: 1,
      node: { type: "string", minLength: 1, transforms: ["trim"] },
    });
    expect(expr).toContain("v.string()");
    expect(expr).toContain("v.minLength(1)");
    expect(expr).toContain("v.trim()");
  });

  it("toJsonSchema/fromJsonSchema round-trip for string", () => {
    const ser = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "string" as const, minLength: 2, endsWith: "x" },
    };
    const js = toJsonSchema(ser as never);
    expect(js).toMatchObject({ type: "string" });
    const back = fromJsonSchema(js as never);
    expect(back.node.type).toBe("string");
  });
});

