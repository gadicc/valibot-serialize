import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { toValibot } from "../converters/to_valibot.ts";
import { fromJsonSchema } from "../converters/from_jsonschema.ts";
import { fromValibot } from "../converters/from_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";

describe("types/string integration", () => {
  it("serialize captures string validators and transforms", () => {
    const schema = v.pipe(
      v.string(),
      v.minLength(3),
      v.maxLength(5),
      v.trim(),
    );
    const ser = fromValibot(schema as never);
    expect(ser.node.type).toBe("string");
    const s = ser.node as Extract<
      NonNullable<typeof ser.node>,
      { type: "string" }
    >;
    expect(s.minLength).toBe(3);
    expect(s.maxLength).toBe(5);
    expect(s.transforms).toEqual(["trim"]);
  });

  it("serialize captures many validators/extras", () => {
    const schema = v.pipe(
      v.string(),
      v.email(),
      v.rfcEmail(),
      v.url(),
      v.uuid(),
      v.ip(),
      v.ipv4(),
      v.ipv6(),
      v.hexColor(),
      v.slug(),
      v.creditCard(),
      v.imei(),
      v.mac(),
      v.mac48(),
      v.mac64(),
      v.base64(),
      v.ulid(),
      v.nanoid(),
      v.cuid2(),
      v.isoDate(),
      v.isoDateTime(),
      v.isoTime(),
      v.isoTimeSecond(),
      v.isoTimestamp(),
      v.isoWeek(),
      v.digits(),
      v.emoji(),
      v.hexadecimal(),
      v.minGraphemes(1),
      v.maxGraphemes(2),
      v.startsWith("st"),
      v.endsWith("nd"),
    );
    const ser = fromValibot(schema as never);
    const s = ser.node as unknown as Record<string, unknown>;
    const keys = [
      "email",
      "rfcEmail",
      "url",
      "uuid",
      "ip",
      "ipv4",
      "ipv6",
      "hexColor",
      "slug",
      "creditCard",
      "imei",
      "mac",
      "mac48",
      "mac64",
      "base64",
      "ulid",
      "nanoid",
      "cuid2",
      "isoDate",
      "isoDateTime",
      "isoTime",
      "isoTimeSecond",
      "isoTimestamp",
      "isoWeek",
      "digits",
      "emoji",
      "hexadecimal",
    ];
    for (const k of keys) expect(Boolean(s[k])).toBe(true);
    expect(s.minGraphemes).toBe(1);
    expect(s.maxGraphemes).toBe(2);
    expect(s.startsWith).toBe("st");
    expect(s.endsWith).toBe("nd");
  });

  it("deserialize builds working string schema", () => {
    const node = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: {
        type: "string" as const,
        minLength: 2,
        startsWith: "a",
        transforms: ["toUpperCase"],
      },
    };
    const schema = toValibot(node as never);
    expect(v.parse(schema, "ab")).toBe("AB");
    expect(() => v.parse(schema, "b")).toThrow();
  });

  it("deserializes transforms: trimStart + trimEnd + normalize", () => {
    const payload = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: {
        type: "string" as const,
        transforms: ["trimStart", "trimEnd", "normalize"],
      },
    };
    const schema = toValibot(payload as never);
    expect(v.parse(schema, "  a  ")).toBe("a");
  });

  it("toCode emits pipe for string validators", () => {
    const expr = toCode({
      kind: "schema",
      vendor: "valibot",
      version: 1,
      format: 1,
      node: { type: "string", minLength: 1, transforms: ["trim"] },
    });
    expect(expr).toContain("v.string()");
    expect(expr).toContain("v.minLength(1)");
    expect(expr).toContain("v.trim()");
  });

  it("toJsonSchema/fromJsonSchema round-trip for string", () => {
    const ser = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: 1 as const,
      node: { type: "string" as const, minLength: 2, endsWith: "x" },
    };
    const js = toJsonSchema(ser as never);
    expect(js).toMatchObject({ type: "string" });
    const back = fromJsonSchema(js as never);
    expect(back.node.type).toBe("string");
  });

  it("toCode covers many validators, extras, and transforms", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const code = toCode({
      ...env,
      node: {
        type: "string" as const,
        // validators
        email: true,
        rfcEmail: true,
        url: true,
        uuid: true,
        ip: true,
        ipv4: true,
        ipv6: true,
        hexColor: true,
        slug: true,
        creditCard: true,
        imei: true as never,
        mac: true as never,
        mac48: true as never,
        mac64: true as never,
        base64: true as never,
        minLength: 1,
        maxLength: 5,
        length: 3,
        pattern: "abc",
        patternFlags: "i",
        startsWith: "st",
        endsWith: "nd",
        // extras
        isoDate: true,
        isoDateTime: true,
        isoTime: true,
        isoTimeSecond: true,
        isoTimestamp: true,
        isoWeek: true,
        digits: true,
        emoji: true,
        hexadecimal: true,
        minGraphemes: 2,
        maxGraphemes: 4,
        ulid: true as never,
        nanoid: true as never,
        cuid2: true as never,
        // transforms
        transforms: [
          "trim",
          "trimStart",
          "trimEnd",
          "toUpperCase",
          "toLowerCase",
          "normalize",
        ],
      },
    } as never);
    // spot-check some representative items
    expect(code).toContain("v.string()");
    expect(code).toContain("v.email()");
    expect(code).toContain("v.rfcEmail()");
    expect(code).toContain("v.url()");
    expect(code).toContain("v.uuid()");
    expect(code).toContain("v.ip()");
    expect(code).toContain("v.ipv4()");
    expect(code).toContain("v.ipv6()");
    expect(code).toContain("v.hexColor()");
    expect(code).toContain("v.slug()");
    expect(code).toContain("v.creditCard()");
    expect(code).toContain("v.imei()");
    expect(code).toContain("v.mac()");
    expect(code).toContain("v.mac48()");
    expect(code).toContain("v.mac64()");
    expect(code).toContain("v.base64()");
    expect(code).toContain("v.minLength(1)");
    expect(code).toContain("v.maxLength(5)");
    expect(code).toContain("v.length(3)");
    expect(code).toContain("v.regex(/abc/i)");
    expect(code).toContain('v.startsWith("st")');
    expect(code).toContain('v.endsWith("nd")');
    expect(code).toContain("v.isoDate()");
    expect(code).toContain("v.isoDateTime()");
    expect(code).toContain("v.isoTime()");
    expect(code).toContain("v.isoTimeSecond()");
    expect(code).toContain("v.isoTimestamp()");
    expect(code).toContain("v.isoWeek()");
    expect(code).toContain("v.digits()");
    expect(code).toContain("v.emoji()");
    expect(code).toContain("v.hexadecimal()");
    expect(code).toContain("v.minGraphemes(2)");
    expect(code).toContain("v.maxGraphemes(4)");
    expect(code).toContain("v.ulid()");
    expect(code).toContain("v.nanoid()");
    expect(code).toContain("v.cuid2()");
    expect(code).toContain("v.trim()");
    expect(code).toContain("v.trimStart()");
    expect(code).toContain("v.trimEnd()");
    expect(code).toContain("v.toUpperCase()");
    expect(code).toContain("v.toLowerCase()");
    expect(code).toContain("v.normalize()");
  });

  it("toJsonSchema buckets multiple patterns and formats", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string" as const,
        startsWith: "a",
        endsWith: "z",
        minWords: 1 as never,
        maxWords: 2 as never,
        uuid: true,
        ipv4: true,
      },
    } as never) as Record<string, unknown>;
    expect(Array.isArray(js.allOf as unknown[])).toBe(true);
    expect(Array.isArray(js.anyOf as unknown[])).toBe(true);
  });

  it("toJsonSchema escapes startsWith/endsWith special characters", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string" as const,
        startsWith: ".*+?^$()[]{}|\\",
        endsWith: ".*+?^$()[]{}|\\",
      },
    } as never) as Record<string, unknown>;
    const allOf = js.allOf as Array<{ pattern: string }>;
    expect(
      allOf[0].pattern.startsWith(
        "^\\.\\*\\+\\?\\^\\$\\(\\)\\[\\]\\{\\}\\|\\\\",
      ),
    )
      .toBe(true);
    expect(
      allOf[1].pattern.endsWith("\\.\\*\\+\\?\\^\\$\\(\\)\\[\\]\\{\\}\\|\\\\$"),
    )
      .toBe(true);
  });

  it("toJsonSchema minWords/maxWords patterns exact", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string" as const,
        minWords: 3 as never,
        maxWords: 5 as never,
      },
    } as never) as Record<string, unknown>;
    const allOf = js.allOf as Array<{ pattern: string }>;
    const hasMin = allOf.some((p) =>
      p.pattern === "^(?:\\S+\\s+){2}\\S+(?:\\s+\\S+)*$"
    );
    const hasMax = allOf.some((p) =>
      p.pattern === "^\\s*(?:\\S+(?:\\s+|$)){0,5}$"
    );
    expect(hasMin && hasMax).toBe(true);
  });

  it("toJsonSchema combines user pattern with starts/ends in allOf", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema({
      ...env,
      node: {
        type: "string" as const,
        pattern: "abc",
        startsWith: "^x",
        endsWith: "z$",
      },
    } as never) as Record<string, unknown>;
    const allOf = js.allOf as Array<{ pattern: string }>;
    const hasUser = allOf.some((p) => p.pattern === "abc");
    const hasStart = allOf.some((p) => p.pattern.startsWith("^\\^x"));
    const hasEnd = allOf.some((p) => p.pattern.endsWith("z\\$$"));
    expect(hasUser && hasStart && hasEnd).toBe(true);
  });

  it("toJsonSchema ip+ipv4 collapses to single format ipv4 (no anyOf)", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const js = toJsonSchema(
      {
        ...env,
        node: { type: "string" as const, ip: true, ipv4: true },
      } as never,
    ) as Record<string, unknown>;
    expect(js.format).toBe("ipv4");
    expect(js.anyOf).toBeUndefined();
  });

  it("fromJsonSchema detects slug/nanoid/cuid2", () => {
    const slug = fromJsonSchema(
      { type: "string", pattern: "abc-def" } as never,
    );
    expect((slug.node as { slug?: boolean }).slug).toBe(true);
    const nano = fromJsonSchema(
      { type: "string", pattern: "ABC_123" } as never,
    );
    expect((nano.node as { nanoid?: boolean }).nanoid).toBe(true);
    const cuid = fromJsonSchema(
      { type: "string", pattern: "abcdefghijklmnopqrstuvwxy" } as never,
    );
    expect((cuid.node as { cuid2?: boolean }).cuid2).toBe(true);
  });

  it("fromJsonSchema detects base64 via simplified pattern", () => {
    const b64 = fromJsonSchema({ type: "string", pattern: "ABCD==" } as never);
    expect((b64.node as { base64?: boolean }).base64).toBe(true);
  });

  it("toCode emits regex literal for empty and escaped pattern", () => {
    const empty = toCode(
      fromValibot(v.pipe(v.string(), v.regex(new RegExp("")))) as never,
    );
    expect(empty).toContain("v.regex(/(?:)/)");
    const emptyI = toCode(
      fromValibot(v.pipe(v.string(), v.regex(new RegExp("", "i")))) as never,
    );
    expect(emptyI).toContain("v.regex(/(?:)/i)");
    const slash = toCode(
      fromValibot(v.pipe(v.string(), v.regex(/a\/b/i))) as never,
    );
    expect(slash).toContain("/a\\\\/b/i");
  });

  it("toJsonSchema single pattern and single format", () => {
    const env = {
      kind: "schema",
      vendor: "valibot",
      version: 1,
      format: FORMAT_VERSION,
    } as const;
    const onePattern = toJsonSchema(
      { ...env, node: { type: "string", minWords: 1 } } as never,
    );
    expect((onePattern as Record<string, unknown>).pattern).toBeDefined();
    expect((onePattern as Record<string, unknown>).allOf).toBeUndefined();
    const uuid = toJsonSchema(
      { ...env, node: { type: "string", uuid: true } } as never,
    );
    expect((uuid as Record<string, string>).format).toBe("uuid");
  });

  it("fromJsonSchema detects hexColor and digits", () => {
    const h = fromJsonSchema({ type: "string", pattern: "#AABBCC" } as never);
    expect((h.node as { hexColor?: boolean }).hexColor).toBe(true);
    const d = fromJsonSchema({ type: "string", pattern: "12345" } as never);
    expect((d.node as { digits?: boolean }).digits).toBe(true);
  });

  it("fromJsonSchema detects hexadecimal via pattern content", () => {
    const hex = fromJsonSchema({ type: "string", pattern: "A1B2C3" } as never);
    expect((hex.node as { hexadecimal?: boolean }).hexadecimal).toBe(true);
  });
});
