import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { fromJsonSchema } from "../../main.ts";

describe("fromJsonSchema extra coverage", () => {
  it("detects ip from anyOf string formats", () => {
    const s = fromJsonSchema({
      type: "string",
      anyOf: [{ type: "string", format: "ipv4" }, {
        type: "string",
        format: "ipv6",
      }],
    });
    expect(s.node.type).toBe("string");
    expect((s.node as { ip?: boolean }).ip).toBe(true);
  });

  it("string patterns map to flags and starts/ends", () => {
    // Provide patterns in the simplified forms recognized by fromJsonSchema
    const ulid = fromJsonSchema({
      type: "string",
      pattern: "00000000000000000000000000",
    });
    expect((ulid.node as { ulid?: boolean }).ulid).toBe(true);
    const base64 = fromJsonSchema({ type: "string", pattern: "ABCD==" });
    expect((base64.node as { base64?: boolean }).base64).toBe(true);
    const starts = fromJsonSchema({ type: "string", pattern: "^ab.*" });
    expect((starts.node as { startsWith?: string }).startsWith).toBe("ab");
    const ends = fromJsonSchema({ type: "string", pattern: ".*yz$" });
    expect((ends.node as { endsWith?: string }).endsWith).toBe("yz");
  });

  it("maps date-time format to date node", () => {
    const s = fromJsonSchema({ type: "string", format: "date-time" });
    expect(s.node.type).toBe("date");
  });

  it("numbers including integer and bounds", () => {
    const s = fromJsonSchema({
      type: "integer",
      minimum: 1,
      maximum: 2,
      exclusiveMinimum: 0,
      exclusiveMaximum: 3,
      multipleOf: 2,
    });
    const n = s.node as {
      type: string;
      integer?: boolean;
      min?: number;
      max?: number;
      gt?: number;
      lt?: number;
      multipleOf?: number;
    };
    expect(n.type).toBe("number");
    expect(n.integer).toBe(true);
    expect(n.min).toBe(1);
    expect(n.max).toBe(2);
    expect(n.gt).toBe(0);
    expect(n.lt).toBe(3);
    expect(n.multipleOf).toBe(2);
  });

  it("union anyOf fallback (non-const)", () => {
    const s = fromJsonSchema({
      anyOf: [{ type: "string" }, { type: "number" }],
    });
    expect(s.node.type).toBe("union");
  });

  it("array forms: tuple, tuple with rest, set, array", () => {
    const tuple = fromJsonSchema({
      type: "array",
      prefixItems: [{ type: "string" }, { type: "number" }],
    });
    expect(tuple.node.type).toBe("tuple");
    const rest = fromJsonSchema({
      type: "array",
      prefixItems: [{ type: "string" }],
      items: { type: "number" },
    });
    expect((rest.node as { rest?: unknown }).rest).toBeDefined();
    const set = fromJsonSchema({
      type: "array",
      uniqueItems: true,
      items: { type: "string" },
      minItems: 1,
      maxItems: 2,
    });
    expect(set.node.type).toBe("set");
    const arr = fromJsonSchema({
      type: "array",
      items: { type: "number" },
      minItems: 3,
      maxItems: 4,
    });
    const an = arr.node as {
      type: string;
      minLength?: number;
      maxLength?: number;
    };
    expect(an.type).toBe("array");
    expect(an.minLength).toBe(3);
    expect(an.maxLength).toBe(4);
  });

  it("object additionalProperties object (rest) and bounds", () => {
    const s = fromJsonSchema({
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
      additionalProperties: { type: "number" },
      minProperties: 1,
      maxProperties: 5,
    });
    const node = s.node as {
      type: string;
      entries: Record<string, unknown>;
      rest?: unknown;
      minEntries?: number;
      maxEntries?: number;
    };
    expect(node.type).toBe("object");
    expect(Object.keys(node.entries)).toEqual(["a"]);
    expect(node.rest).toBeDefined();
    expect(node.minEntries).toBe(1);
    expect(node.maxEntries).toBe(5);
  });

  it("fallback to string on unknown input and boolean mapping", () => {
    const fb = fromJsonSchema({});
    expect(fb.node.type).toBe("string");
    const b = fromJsonSchema({ type: "boolean" });
    expect(b.node.type).toBe("boolean");
  });
});
