import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";
import { deserialize } from "../converters/decode.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { fromJsonSchema } from "../converters/from_jsonschema.ts";

describe("types/null", () => {
  it("serialize null node shape", () => {
    // Prefer v.null or v.null_ if present, else use literal(null) for stability
    const anyV = v as unknown as Record<string, unknown>;
    const fn = (anyV["null"] ?? anyV["null_"]) as unknown;
    const schema = typeof fn === "function"
      ? (fn as () => unknown)()
      : v.literal(null as never);
    const ser = serialize(schema as never);
    expect(ser.node).toEqual({ type: "null" });
  });

  it("toJsonSchema/fromJsonSchema mapping for null", () => {
    const js = toJsonSchema({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "null" as const },
    } as never);
    expect(js).toEqual({ type: "null" });
    const back = fromJsonSchema({ type: "null" } as never);
    expect(back.node).toEqual({ type: "null" });
    const schema = deserialize(back);
    expect(() => v.parse(schema, null)).not.toThrow();
    expect(() => v.parse(schema, 1)).toThrow();
  });
});
