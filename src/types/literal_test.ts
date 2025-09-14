import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { deserialize } from "../converters/decode.ts";
import { fromJsonSchema } from "../converters/from_jsonschema.ts";
import { serialize } from "../converters/encode.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";

describe("types/literal", () => {
  it("serialize/deserialize literal values", () => {
    const s = serialize(v.literal("x"));
    expect(s.node).toEqual({ type: "literal", value: "x" });
    const schema = deserialize(s);
    expect(() => v.parse(schema, "x")).not.toThrow();
    expect(() => v.parse(schema, "y")).toThrow();
  });

  it("toJsonSchema/fromJsonSchema mapping for literal", () => {
    const js = toJsonSchema({
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "literal" as const, value: 3 },
    } as never);
    expect(js).toEqual({ const: 3 });
    const back = fromJsonSchema({ const: true } as never);
    expect(back.node).toEqual({ type: "literal", value: true });
  });
});
