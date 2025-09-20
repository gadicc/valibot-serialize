import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/intersect", () => {
  const schema = v.intersect([
    v.object({ a: v.string() }),
    v.object({ b: v.number() }),
  ]);

  const env = {
    kind: "schema" as const,
    vendor: "valibot" as const,
    version: 1 as const,
    format: FORMAT_VERSION,
  };

  it("serializes intersect node", () => {
    const serialized = fromValibot(schema);
    expect(serialized.node).toMatchObject({
      type: "intersect",
      options: [{ type: "object" }, { type: "object" }],
    });
    const rebuilt = toValibot(serialized);
    expect(rebuilt.type).toBe("intersect");
  });

  it("generates code and JSON schema", () => {
    const serialized = fromValibot(schema);
    const code = toCode({ ...env, node: serialized.node } as never);
    expect(code).toContain("v.intersect([");

    const json = toJsonSchema({ ...env, node: serialized.node } as never);
    expect(Array.isArray((json as { allOf?: unknown[] }).allOf)).toBe(true);
  });
});
