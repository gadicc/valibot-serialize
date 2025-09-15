import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";

describe("types/blob", () => {
  it("serialize blob node", () => {
    const b = fromValibot(
      v.pipe(v.blob(), v.minSize(1), v.maxSize(2), v.mimeType(["text/plain"])),
    );
    expect(b.node).toEqual({
      type: "blob",
      minSize: 1,
      maxSize: 2,
      mimeTypes: ["text/plain"],
    });
  });
});
