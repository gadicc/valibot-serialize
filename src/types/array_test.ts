import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { isSchemaNode as isArrayNode } from "./array.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/array", () => {
  it("guard rejects invalid item and wrong bounds", () => {
    expect(
      isArrayNode({ type: "array", item: 1 } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isArrayNode(
        { type: "array", item: { type: "string" }, length: "x" } as unknown,
        {
          isSchemaNode: () => false,
        },
      ),
    ).toBe(false);
  });
  it("serialize array node shape", () => {
    const s = fromValibot(v.array(v.string()));
    expect(s.node).toEqual({ type: "array", item: { type: "string" } });
  });

  it("serialize array constraints (min/max/length)", () => {
    const s1 = fromValibot(
      v.pipe(v.array(v.string()), v.minLength(2), v.maxLength(3)),
    );
    expect(s1.node).toEqual({
      type: "array",
      item: { type: "string" },
      minLength: 2,
      maxLength: 3,
    });
    const s2 = fromValibot(v.pipe(v.array(v.number()), v.length(2)));
    expect(s2.node).toEqual({
      type: "array",
      item: { type: "number" },
      length: 2,
    });
  });

  it("serialize nonEmpty maps to minLength >= 1", () => {
    const s = fromValibot(v.pipe(v.array(v.string()), v.nonEmpty()));
    const n = s.node as { type: string; minLength?: number };
    expect(n.type).toBe("array");
    expect(n.minLength).toBe(1);
  });

  it("decode with three validators (min/max/length)", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: {
        type: "array" as const,
        item: { type: "number" as const },
        minLength: 1,
        maxLength: 3,
        length: 2,
      },
    };
    const sch = toValibot(payload as never);
    expect(() => v.parse(sch, [1, 2])).not.toThrow();
    expect(() => v.parse(sch, [1])).toThrow();
    expect(() => v.parse(sch, [1, 2, 3])).toThrow();
  });
});
