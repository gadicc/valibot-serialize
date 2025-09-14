import * as v from "@valibot/valibot";
import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { e2eCheck } from "./_common.ts";

describe("e2e - simple", () => {
  it("LoginSchema", async () => {
    await e2eCheck(
      v.object({
        email: v.string(),
        password: v.string(),
      }),
      { checkJsonSchema: true },
    );
  });

  it("pipe example", async () => {
    const schema = v.pipe(v.string(), v.trim());
    await e2eCheck(schema);
    await expect(e2eCheck(schema, { checkJsonSchema: true })).rejects
      .toThrow();
  });
});
