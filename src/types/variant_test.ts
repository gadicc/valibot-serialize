import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/variant", () => {
  const schema = v.variant("kind", [
    v.object({ kind: v.literal("A"), value: v.string() }),
    v.object({ kind: v.literal("B"), value: v.number() }),
  ]);

  const env = {
    kind: "schema" as const,
    vendor: "valibot" as const,
    version: 1 as const,
    format: FORMAT_VERSION,
  };

  it("serializes variant node", () => {
    const serialized = fromValibot(schema);
    expect(serialized.node).toMatchObject({
      type: "variant",
      key: "kind",
    });
    const rebuilt = toValibot(serialized);
    expect(rebuilt.type).toBe("variant");
  });

  it("generates code and JSON schema", () => {
    const serialized = fromValibot(schema);
    const code = toCode({ ...env, node: serialized.node } as never);
    expect(code).toContain('v.variant("kind"');

    const json = toJsonSchema({ ...env, node: serialized.node } as never);
    expect(Array.isArray((json as { anyOf?: unknown[] }).anyOf)).toBe(true);
  });
});
