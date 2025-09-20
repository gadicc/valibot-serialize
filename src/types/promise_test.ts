import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/promise", () => {
  const env = {
    kind: "schema" as const,
    vendor: "valibot" as const,
    version: 1 as const,
    format: FORMAT_VERSION,
  };

  it("serializes promise schema", () => {
    const serialized = fromValibot(v.promise());
    expect(serialized.node).toEqual({ type: "promise" });
    const rebuilt = toValibot(serialized);
    expect(rebuilt.type).toBe("promise");
  });

  it("generates code and JSON schema", () => {
    const code = toCode({ ...env, node: { type: "promise" } } as never);
    expect(code).toBe("v.promise()");
    const json = toJsonSchema({ ...env, node: { type: "promise" } } as never);
    expect(json).toEqual({});
  });
});
