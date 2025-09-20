import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/nan", () => {
  const env = {
    kind: "schema" as const,
    vendor: "valibot" as const,
    version: 1 as const,
    format: FORMAT_VERSION,
  };

  it("serializes nan schema", () => {
    const serialized = fromValibot(v.nan());
    expect(serialized.node).toEqual({ type: "nan" });
    const rebuilt = toValibot(serialized);
    expect(rebuilt.type).toBe("nan");
  });

  it("emits code and JSON schema", () => {
    const code = toCode({ ...env, node: { type: "nan" } } as never);
    expect(code).toBe("v.nan()");
    const json = toJsonSchema({ ...env, node: { type: "nan" } } as never);
    expect(json).toEqual({ type: "number" });
  });
});
