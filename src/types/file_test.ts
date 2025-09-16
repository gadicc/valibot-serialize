import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { isSchemaNode as isFileNode } from "./file.ts";

describe("types/file", () => {
  it("guard rejects invalid mimeTypes", () => {
    expect(
      isFileNode({ type: "file", mimeTypes: [1] } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
  });
  it("serialize file node", () => {
    const f = fromValibot(
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
