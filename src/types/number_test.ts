import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize } from "../converters/decode.ts";
import { fromJsonSchema } from "../converters/from_jsonschema.ts";
import { serialize } from "../converters/encode.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";

describe("types/number integration", () => {
  it("serialize captures number validators", () => {
    const schema = v.pipe(
      v.number(),
      v.minValue(1),
      v.maxValue(3),
      v.integer(),
    );
    const ser = serialize(schema as never);
    expect(ser.node.type).toBe("number");
    const n = ser.node as Extract<
      NonNullable<typeof ser.node>,
      { type: "number" }
    >;
    expect(n.min).toBe(1);
    expect(n.max).toBe(3);
    expect(n.integer).toBe(true);
  });

  it("serialize captures number extras (finite/integer/safe/multipleOf/gt/lt)", () => {
    const schema = v.pipe(
      v.number(),
      v.finite(),
      v.integer(),
      v.safeInteger(),
      v.multipleOf(3),
      v.gtValue(1),
      v.ltValue(9),
    );
    const ser = serialize(schema as never);
    const n = ser.node as Extract<
      NonNullable<typeof ser.node>,
      { type: "number" }
    >;
    expect(n).toEqual({
      type: "number",
      finite: true,
      integer: true,
      safeInteger: true,
      multipleOf: 3,
      gt: 1,
      lt: 9,
    });
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

  it("toJsonSchema outputs integer type when integer flag", () => {
    const js = toJsonSchema({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, integer: true },
    } as never) as Record<string, unknown>;
    expect(js.type).toBe("integer");
  });

  it("deserialize handles 0,1,2,>2 validator lengths", () => {
    // 0 validators
    const zero = deserialize({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const },
    } as never);
    expect(() => v.parse(zero, 1)).not.toThrow();

    // 1 validator
    const one = deserialize({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, integer: true },
    } as never);
    expect(() => v.parse(one, 2)).not.toThrow();
    expect(() => v.parse(one, 2.5)).toThrow();

    // 2 validators
    const two = deserialize({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, min: 1, max: 3 },
    } as never);
    expect(() => v.parse(two, 2)).not.toThrow();
    expect(() => v.parse(two, 4)).toThrow();

    // >2 validators
    const many = deserialize({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "number" as const, min: 1, max: 5, multipleOf: 2 },
    } as never);
    expect(() => v.parse(many, 4)).not.toThrow();
    expect(() => v.parse(many, 3)).toThrow();
  });
});
