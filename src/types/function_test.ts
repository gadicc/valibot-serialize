import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/function", () => {
  const env = {
    kind: "schema" as const,
    vendor: "valibot" as const,
    version: 1 as const,
    format: FORMAT_VERSION,
  };

  it("round-trips through from/to Valibot", () => {
    const serialized = fromValibot(v.function());
    expect(serialized.node).toEqual({ type: "function" });
    const rebuilt = toValibot(serialized);
    expect(rebuilt.type).toBe("function");
  });

  it("generates code and JSON schema", () => {
    const code = toCode({ ...env, node: { type: "function" } } as never);
    expect(code).toBe("v.function()");

    const json = toJsonSchema({ ...env, node: { type: "function" } } as never);
    expect(json).toEqual({});
  });
});
