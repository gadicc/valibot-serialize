import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { escapeRegex, unescapeRegex } from "./regex_utils.ts";

describe("regex utils", () => {
  it("escape/unescape roundtrip", () => {
    const raw = "+(a)[b]{c}^$|?*\\";
    const escaped = escapeRegex(raw);
    // Escaped should differ and when used as a pattern, match the raw literally
    expect(escaped).not.toBe(raw);
    const re = new RegExp(escaped);
    expect(re.test(raw)).toBe(true);
    // unescape should reverse back to the original
    expect(unescapeRegex(escaped)).toBe(raw);
  });
});
