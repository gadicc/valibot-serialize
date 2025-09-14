import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/record", () => {
  it("serialize record node", () => {
    const r = serialize(v.record(v.string(), v.number()));
    expect(r.node).toEqual({
      type: "record",
      key: { type: "string" },
      value: { type: "number" },
    });
  });
});
