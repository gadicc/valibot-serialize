import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize, serialize } from "../../main.ts";

describe("types/set & map", () => {
  it("serialize set node", () => {
    const s = serialize(v.set(v.string()));
    expect(s.node).toEqual({ type: "set", value: { type: "string" } });
  });

  it("serialize map node", () => {
    const m = serialize(v.map(v.string(), v.number()));
    expect(m.node).toEqual({
      type: "map",
      key: { type: "string" },
      value: { type: "number" },
    });
  });

  it("encode size validators for set/map", () => {
    const s = serialize(
      v.pipe(v.set(v.string()), v.minSize(1), v.maxSize(2)),
    );
    expect(s.node).toEqual({
      type: "set",
      value: { type: "string" },
      minSize: 1,
      maxSize: 2,
    });

    const m = serialize(
      v.pipe(v.map(v.string(), v.number()), v.minSize(3), v.maxSize(4)),
    );
    expect(m.node).toEqual({
      type: "map",
      key: { type: "string" },
      value: { type: "number" },
      minSize: 3,
      maxSize: 4,
    });
  });

  it("decode set/map validators branches (0/1/2)", () => {
    // set: 0 validators
    const set0 = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "set" as const, value: { type: "string" as const } },
    };
    const set0schema = deserialize(set0 as never);
    expect(() => v.parse(set0schema, new Set(["a"]))).not.toThrow();

    // set: 1 validator (max only)
    const set1 = {
      ...set0,
      node: { ...set0.node, maxSize: 1 },
    } as const;
    const set1schema = deserialize(set1 as never);
    expect(() => v.parse(set1schema, new Set(["a"]))).not.toThrow();
    expect(() => v.parse(set1schema, new Set(["a", "b"]))).toThrow();

    // set: 2 validators already covered in converters tests

    // map: 0 validators
    const map0 = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: {
        type: "map" as const,
        key: { type: "string" as const },
        value: { type: "number" as const },
      },
    } as const;
    const map0schema = deserialize(map0 as never);
    expect(() => v.parse(map0schema, new Map([["a", 1]]))).not.toThrow();

    // map: 1 validator (max only)
    const map1 = { ...map0, node: { ...map0.node, maxSize: 1 } } as const;
    const map1schema = deserialize(map1 as never);
    expect(() => v.parse(map1schema, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(map1schema, new Map([["a", 1], ["b", 2]]))).toThrow();

    // map: 2 validators (min + max)
    const map2 = {
      ...map0,
      node: { ...map0.node, minSize: 1, maxSize: 1 },
    } as const;
    const map2schema = deserialize(map2 as never);
    expect(() => v.parse(map2schema, new Map([["a", 1]]))).not.toThrow();
    expect(() => v.parse(map2schema, new Map())).toThrow();
    expect(() => v.parse(map2schema, new Map([["a", 1], ["b", 2]]))).toThrow();
  });
});
