import * as v from "@valibot/valibot";
import { describe, it } from "@std/testing/bdd";
import { e2eCheck } from "./_common.ts";

describe("e2e - bigint", () => {
  it("roundtrips serialize/deserialize and code", async () => {
    await e2eCheck(v.bigint());
  });
});
