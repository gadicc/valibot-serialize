import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { FORMAT_VERSION, toJsonSchema } from "../../main.ts";

const env = {
  kind: "schema" as const,
  vendor: "valibot" as const,
  version: 1 as const,
  format: FORMAT_VERSION,
};

describe("toJsonSchema extra coverage", () => {
  it("rejects unknown node type", () => {
    const bad = { ...env, node: { type: "__bad__" } } as const;
    expect(() => toJsonSchema(bad as never)).toThrow();
  });
  it("basics: object props/required + union/enum", () => {
    const ast = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
      node: {
        type: "object" as const,
        entries: {
          a: { type: "string" as const },
          b: { type: "optional" as const, base: { type: "number" as const } },
        },
        optionalKeys: ["b"],
      },
    };
    const js = toJsonSchema(ast);
    const props = (js as Record<string, unknown>).properties as Record<
      string,
      unknown
    >;
    const req = (js as Record<string, unknown>).required as string[];
    expect((js as Record<string, unknown>).type).toBe("object");
    expect(Object.keys(props)).toEqual(["a", "b"]);
    expect(req).toEqual(["a"]);

    const unionJs = toJsonSchema({
      ...env,
      node: {
        type: "union",
        options: [{ type: "string" }, { type: "number" }],
      },
    });
    expect((unionJs as Record<string, unknown>).anyOf).toBeDefined();

    const enumJs = toJsonSchema({
      ...env,
      node: { type: "enum", values: ["x", "y"] },
    });
    expect((enumJs as Record<string, unknown>).enum).toEqual(["x", "y"]);
  });

  it("string ID/validator patterns bucketed", () => {
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string",
        ulid: true,
        nanoid: true,
        cuid2: true,
        creditCard: true,
      },
    }) as Record<string, unknown>;
    expect(js.type).toBe("string");
    expect(
      Object.prototype.hasOwnProperty.call(js, "pattern") ||
        Object.prototype.hasOwnProperty.call(js, "allOf"),
    ).toBe(true);
  });
  it("object default additionalProperties: true", () => {
    const js = toJsonSchema({
      ...env,
      node: { type: "object", entries: { a: { type: "string" } } },
    });
    expect((js as Record<string, unknown>).additionalProperties).toBe(true);
  });

  it("string ip generic produces anyOf ipv4|ipv6", () => {
    const js = toJsonSchema({ ...env, node: { type: "string", ip: true } });
    const anyOf = (js as Record<string, unknown>).anyOf as Array<
      Record<string, string>
    >;
    expect(Array.isArray(anyOf)).toBe(true);
    const formats = new Set(anyOf.map((s) => s.format));
    expect(formats.has("ipv4") && formats.has("ipv6")).toBe(true);
  });

  it("startsWith/endsWith escaped patterns", () => {
    const js = toJsonSchema({
      ...env,
      node: { type: "string", startsWith: "+", endsWith: "(x)" },
    });
    const allOf = (js as Record<string, unknown>).allOf as Array<
      { pattern: string }
    >;
    expect(allOf.length).toBe(2);
    expect(allOf[0].pattern.startsWith("^\\+"))
      .toBe(true);
    expect(allOf[1].pattern.endsWith("\\(x\\)$"))
      .toBe(true);
  });

  it("record/set/map/tuple/date/file/blob mappings", () => {
    // record
    const rec = toJsonSchema({
      ...env,
      node: {
        type: "record",
        key: { type: "string" },
        value: { type: "number" },
      },
    });
    expect((rec as Record<string, unknown>).type).toBe("object");
    // set
    const set = toJsonSchema({
      ...env,
      node: { type: "set", value: { type: "string" }, minSize: 1, maxSize: 2 },
    });
    expect((set as Record<string, unknown>).uniqueItems).toBe(true);
    expect((set as Record<string, number>).minItems).toBe(1);
    expect((set as Record<string, number>).maxItems).toBe(2);
    // map
    const map = toJsonSchema({
      ...env,
      node: {
        type: "map",
        key: { type: "string" },
        value: { type: "number" },
        minSize: 3,
      },
    });
    expect((map as Record<string, number>).minProperties).toBe(3);
    // tuple fixed
    const tup = toJsonSchema({
      ...env,
      node: { type: "tuple", items: [{ type: "string" }, { type: "number" }] },
    });
    expect((tup as Record<string, unknown>).items).toBe(false);
    expect((tup as Record<string, number>).minItems).toBe(2);
    expect((tup as Record<string, number>).maxItems).toBe(2);
    // tuple with rest
    const rest = toJsonSchema({
      ...env,
      node: {
        type: "tuple",
        items: [{ type: "string" }],
        rest: { type: "number" },
      },
    });
    expect((rest as Record<string, number>).minItems).toBe(1);
    // date
    const date = toJsonSchema({ ...env, node: { type: "date" } });
    expect((date as Record<string, string>).format).toBe("date-time");
    // file single type
    const file1 = toJsonSchema({
      ...env,
      node: { type: "file", mimeTypes: ["text/plain"] },
    });
    expect((file1 as Record<string, string>).contentMediaType).toBe(
      "text/plain",
    );
    // file many types
    const file2 = toJsonSchema({
      ...env,
      node: { type: "file", mimeTypes: ["a/b", "c/d"] },
    });
    expect(Array.isArray((file2 as Record<string, unknown>).anyOf as unknown[]))
      .toBe(true);
    // blob single
    const blob1 = toJsonSchema({
      ...env,
      node: { type: "blob", mimeTypes: ["image/png"] },
    });
    expect((blob1 as Record<string, string>).contentMediaType).toBe(
      "image/png",
    );
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

  it("string ISO patterns included in allOf when flagged", async () => {
    const { patterns } = await import("../util/patterns.ts");
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string",
        isoDate: true,
        isoTime: true,
        isoTimeSecond: true,
        isoDateTime: true,
        isoTimestamp: true,
        isoWeek: true,
      },
    });
    const allOf = (js as Record<string, unknown>).allOf as Array<
      { pattern: string }
    >;
    const pats = new Set(allOf?.map((p) => p.pattern));
    expect(pats.has(patterns.isoDate)).toBe(true);
    expect(pats.has(patterns.isoTime)).toBe(true);
    expect(pats.has(patterns.isoTimeSecond)).toBe(true);
    expect(pats.has(patterns.isoDateTime)).toBe(true);
    expect(pats.has(patterns.isoWeek)).toBe(true);
  });

  it("string multiple formats produce anyOf, ip+ipv4 collapses to single format", () => {
    const jsMany = toJsonSchema({
      ...env,
      node: { type: "string", uuid: true, ipv4: true },
    });
    const anyOf = (jsMany as Record<string, unknown>).anyOf as Array<
      { type: string; format: string }
    >;
    expect(Array.isArray(anyOf)).toBe(true);
    const fmts = new Set(anyOf.map((e) => e.format));
    expect(fmts.has("uuid") && fmts.has("ipv4")).toBe(true);

    const jsIp4 = toJsonSchema({
      ...env,
      node: { type: "string", ip: true, ipv4: true },
    }) as Record<string, unknown>;
    expect(jsIp4.format).toBe("ipv4");
    expect(jsIp4.anyOf).toBeUndefined();
  });

  it("set/map min-only and max-only properties mapped", () => {
    const setMin = toJsonSchema({
      ...env,
      node: { type: "set", value: { type: "string" }, minSize: 2 },
    });
    expect((setMin as Record<string, number>).minItems).toBe(2);
    expect((setMin as Record<string, number>).maxItems).toBeUndefined();

    const setMax = toJsonSchema({
      ...env,
      node: { type: "set", value: { type: "string" }, maxSize: 3 },
    });
    expect((setMax as Record<string, number>).maxItems).toBe(3);
    expect((setMax as Record<string, number>).minItems).toBeUndefined();

    const mapMax = toJsonSchema({
      ...env,
      node: {
        type: "map",
        key: { type: "string" },
        value: { type: "number" },
        maxSize: 4,
      },
    });
    expect((mapMax as Record<string, number>).maxProperties).toBe(4);
    expect((mapMax as Record<string, number>).minProperties).toBeUndefined();
  });

  it("string imei/mac/base64 patterns included", async () => {
    const { patterns } = await import("../util/patterns.ts");
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string",
        imei: true,
        mac: true,
        mac48: true,
        mac64: true,
        base64: true,
      },
    });
    const allOf = (js as Record<string, unknown>).allOf as Array<
      { pattern: string }
    >;
    const pats = new Set(allOf?.map((p) => p.pattern));
    expect(pats.has("^\\d{15}$")).toBe(true);
    expect(pats.has(patterns.mac)).toBe(true);
    expect(pats.has(patterns.mac48)).toBe(true);
    expect(pats.has(patterns.mac64)).toBe(true);
    expect(pats.has(patterns.base64)).toBe(true);
  });

  it("array min/max/length mapping", () => {
    const base = { ...env, node: { type: "array", item: { type: "string" } } };
    const js1 = toJsonSchema(
      { ...base, node: { ...base.node, minLength: 1, maxLength: 2 } } as never,
    );
    expect((js1 as Record<string, number>).minItems).toBe(1);
    expect((js1 as Record<string, number>).maxItems).toBe(2);
    const js2 = toJsonSchema(
      { ...base, node: { ...base.node, length: 3 } } as never,
    );
    expect((js2 as Record<string, number>).minItems).toBe(3);
    expect((js2 as Record<string, number>).maxItems).toBe(3);
  });

  it("string single pattern and single format", () => {
    const onePattern = toJsonSchema({
      ...env,
      node: { type: "string", minWords: 1 },
    });
    expect((onePattern as Record<string, unknown>).pattern).toBeDefined();
    expect((onePattern as Record<string, unknown>).allOf).toBeUndefined();

    const uuid = toJsonSchema({ ...env, node: { type: "string", uuid: true } });
    expect((uuid as Record<string, string>).format).toBe("uuid");
  });
});
