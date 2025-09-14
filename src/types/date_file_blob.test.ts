import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { serialize } from "../../main.ts";

describe("types/date, file, blob", () => {
  it("serialize date node", () => {
    const d = serialize(v.date());
    expect(d.node).toEqual({ type: "date" });
  });

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

  it("serialize blob node", () => {
    const b = serialize(
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
