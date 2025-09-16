import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { isSchemaNode as isRecordNode } from "./record.ts";

describe("types/record", () => {
  it("guard rejects non-node key/value", () => {
    expect(
      isRecordNode(
        { type: "record", key: 1, value: { type: "string" } } as unknown,
        {
          isSchemaNode: () => false,
        },
      ),
    ).toBe(false);
    expect(
      isRecordNode(
        { type: "record", key: { type: "string" }, value: 2 } as unknown,
        {
          isSchemaNode: () => false,
        },
      ),
    ).toBe(false);
  });
  it("serialize record node", () => {
    const r = fromValibot(v.record(v.string(), v.number()));
    expect(r.node).toEqual({
      type: "record",
      key: { type: "string" },
      value: { type: "number" },
    });
  });
});
