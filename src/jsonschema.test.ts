import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { FORMAT_VERSION, toJsonSchema } from "../main.ts";

const env = { kind: "schema" as const, vendor: "valibot" as const, version: 1 as const, format: FORMAT_VERSION };

describe("toJsonSchema extra coverage", () => {
  it("object default additionalProperties: true", () => {
    const js = toJsonSchema({ ...env, node: { type: "object", entries: { a: { type: "string" } } } });
    expect((js as Record<string, unknown>).additionalProperties).toBe(true);
  });

  it("string ip generic produces anyOf ipv4|ipv6", () => {
    const js = toJsonSchema({ ...env, node: { type: "string", ip: true } });
    const anyOf = (js as Record<string, unknown>).anyOf as Array<Record<string, string>>;
    expect(Array.isArray(anyOf)).toBe(true);
    const formats = new Set(anyOf.map((s) => s.format));
    expect(formats.has("ipv4") && formats.has("ipv6")).toBe(true);
  });

  it("startsWith/endsWith escaped patterns", () => {
    const js = toJsonSchema({ ...env, node: { type: "string", startsWith: "+", endsWith: "(x)" } });
    const allOf = (js as Record<string, unknown>).allOf as Array<{ pattern: string }>;
    expect(allOf.length).toBe(2);
    expect(allOf[0].pattern.startsWith("^\\+")).toBe(true);
    expect(allOf[1].pattern.endsWith("\\(x\\)$")).toBe(true);
  });

  it("record/set/map/tuple/date/file/blob mappings", () => {
    // record
    const rec = toJsonSchema({ ...env, node: { type: "record", key: { type: "string" }, value: { type: "number" } } });
    expect((rec as Record<string, unknown>).type).toBe("object");
    // set
    const set = toJsonSchema({ ...env, node: { type: "set", value: { type: "string" }, minSize: 1, maxSize: 2 } });
    expect((set as Record<string, unknown>).uniqueItems).toBe(true);
    expect((set as Record<string, number>).minItems).toBe(1);
    expect((set as Record<string, number>).maxItems).toBe(2);
    // map
    const map = toJsonSchema({ ...env, node: { type: "map", key: { type: "string" }, value: { type: "number" }, minSize: 3 } });
    expect((map as Record<string, number>).minProperties).toBe(3);
    // tuple fixed
    const tup = toJsonSchema({ ...env, node: { type: "tuple", items: [{ type: "string" }, { type: "number" }] } });
    expect((tup as Record<string, unknown>).items).toBe(false);
    expect((tup as Record<string, number>).minItems).toBe(2);
    expect((tup as Record<string, number>).maxItems).toBe(2);
    // tuple with rest
    const rest = toJsonSchema({ ...env, node: { type: "tuple", items: [{ type: "string" }], rest: { type: "number" } } });
    expect((rest as Record<string, number>).minItems).toBe(1);
    // date
    const date = toJsonSchema({ ...env, node: { type: "date" } });
    expect((date as Record<string, string>).format).toBe("date-time");
    // file single type
    const file1 = toJsonSchema({ ...env, node: { type: "file", mimeTypes: ["text/plain"] } });
    expect((file1 as Record<string, string>).contentMediaType).toBe("text/plain");
    // file many types
    const file2 = toJsonSchema({ ...env, node: { type: "file", mimeTypes: ["a/b", "c/d"] } });
    expect(Array.isArray((file2 as Record<string, unknown>).anyOf as unknown[])).toBe(true);
    // blob single
    const blob1 = toJsonSchema({ ...env, node: { type: "blob", mimeTypes: ["image/png"] } });
    expect((blob1 as Record<string, string>).contentMediaType).toBe("image/png");
  });

  it("string flags add patterns and formats buckets", () => {
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string",
        pattern: "x",
        imei: true,
        mac: true,
        mac48: true,
        mac64: true,
        base64: true,
        isoDate: true,
        isoTime: true,
        isoTimeSecond: true,
        isoDateTime: true,
        isoTimestamp: true,
        isoWeek: true,
        minWords: 1,
        maxWords: 2,
        email: true,
        url: true,
        uuid: true,
        ipv4: true,
        ipv6: true,
      },
    });
    const out = js as Record<string, unknown>;
    // Expect patterns bucketed into allOf due to multiple entries
    expect(Array.isArray(out.allOf as unknown[])).toBe(true);
    // Multiple formats should produce anyOf of formatted strings
    expect(Array.isArray(out.anyOf as unknown[])).toBe(true);
  });
});
