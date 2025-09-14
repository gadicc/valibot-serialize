import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../converters/encode.ts";

describe("types/file", () => {
  it("serialize file node", () => {
    const f = serialize(
      v.pipe(v.file(), v.minSize(1), v.maxSize(2), v.mimeType(["text/plain"])),
    );
    expect(f.node).toEqual({
      type: "file",
      minSize: 1,
      maxSize: 2,
      mimeTypes: ["text/plain"],
    });
  });
});
