import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize, deserialize, toJsonSchema, fromJsonSchema, toCode } from "../../main.ts";

describe("types/number integration", () => {
  it("serialize captures number validators", () => {
    const schema = v.pipe(v.number(), v.minValue(1), v.maxValue(3), v.integer());
    const ser = serialize(schema as never);
    expect(ser.node.type).toBe("number");
    const n = ser.node as Extract<NonNullable<typeof ser.node>, { type: "number" }>;
    expect(n.min).toBe(1);
    expect(n.max).toBe(3);
    expect(n.integer).toBe(true);
  });

  it("deserialize builds working number schema", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, min: 2, max: 4 },
    };
    const schema = deserialize(payload as never);
    expect(v.parse(schema, 3)).toBe(3);
    expect(() => v.parse(schema, 1)).toThrow();
  });

  it("toCode emits validators", () => {
    const expr = toCode({
      kind: "schema",
      vendor: "valibot",
      version: 1,
      format: 1,
      node: { type: "number", min: 1, max: 3, integer: true },
    });
    expect(expr).toContain("v.number()");
    expect(expr).toContain("v.minValue(1)");
    expect(expr).toContain("v.integer()");
  });

  it("json schema round-trip for number", () => {
    const ser = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, min: 1, max: 5 },
    };
    const js = toJsonSchema(ser as never);
    expect(js).toMatchObject({ type: "number" });
    const back = fromJsonSchema(js as never);
    expect(back.node.type).toBe("number");
  });
});

