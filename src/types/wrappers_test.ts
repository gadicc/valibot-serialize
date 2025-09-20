import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { isSchemaNode as isOptionalNode } from "./optional.ts";
import { isSchemaNode as isNullableNode } from "./nullable.ts";
import { isSchemaNode as isNullishNode } from "./nullish.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { FORMAT_VERSION } from "../types.ts";
import { isSchemaNode as isExactOptionalNode } from "./exact_optional.ts";
import { isSchemaNode as isNonNullableNode } from "./non_nullable.ts";
import { isSchemaNode as isNonNullishNode } from "./non_nullish.ts";
import { isSchemaNode as isNonOptionalNode } from "./non_optional.ts";
import { isSchemaNode as isUndefinedableNode } from "./undefinedable.ts";

describe("types/wrappers", () => {
  it("guards reject missing/invalid base", () => {
    expect(
      isOptionalNode({ type: "optional" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isNullableNode({ type: "nullable", base: 1 } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isNullishNode({ type: "nullish", base: 1 } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isExactOptionalNode({ type: "exact_optional" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isUndefinedableNode({ type: "undefinedable" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isNonNullableNode({ type: "non_nullable" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isNonNullishNode({ type: "non_nullish" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isNonOptionalNode({ type: "non_optional" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
  });
  it("serialize optional/nullable/nullish wrappers", () => {
    const opt = fromValibot(v.optional(v.string()));
    expect(opt.node).toEqual({ type: "optional", base: { type: "string" } });
    const nul = fromValibot(v.nullable(v.number()));
    expect(nul.node).toEqual({ type: "nullable", base: { type: "number" } });
    const nsh = fromValibot(v.nullish(v.boolean()));
    expect(nsh.node).toEqual({ type: "nullish", base: { type: "boolean" } });
  });

  it("serialize wrappers with defaults and non-nullish variants", () => {
    const exact = fromValibot(v.exactOptional(v.string(), "foo"));
    expect(exact.node).toEqual({
      type: "exact_optional",
      base: { type: "string" },
      default: "foo",
      hasDefault: true,
    });
    const undef = fromValibot(v.undefinedable(v.number(), 42));
    expect(undef.node).toEqual({
      type: "undefinedable",
      base: { type: "number" },
      default: 42,
      hasDefault: true,
    });
    const nonNull = fromValibot(v.nonNullable(v.string()));
    expect(nonNull.node).toEqual({
      type: "non_nullable",
      base: { type: "string" },
    });
    const nonNsh = fromValibot(v.nonNullish(v.number()));
    expect(nonNsh.node).toEqual({
      type: "non_nullish",
      base: { type: "number" },
    });
    const nonOpt = fromValibot(v.nonOptional(v.boolean()));
    expect(nonOpt.node).toEqual({
      type: "non_optional",
      base: { type: "boolean" },
    });
  });

  it("toCode and toJsonSchema for wrappers", () => {
    const env = {
      kind: "schema" as const,
      vendor: "valibot" as const,
      version: 1 as const,
      format: FORMAT_VERSION,
    };
    const opt = toCode(
      { ...env, node: { type: "optional", base: { type: "string" } } } as never,
    );
    expect(opt).toBe("v.optional(v.string())");
    const nul = toCode(
      { ...env, node: { type: "nullable", base: { type: "number" } } } as never,
    );
    expect(nul).toBe("v.nullable(v.number())");
    const nsh = toCode(
      { ...env, node: { type: "nullish", base: { type: "boolean" } } } as never,
    );
    expect(nsh).toBe("v.nullish(v.boolean())");

    const nulJs = toJsonSchema(
      { ...env, node: { type: "nullable", base: { type: "string" } } } as never,
    );
    const nshJs = toJsonSchema(
      { ...env, node: { type: "nullish", base: { type: "number" } } } as never,
    );
    expect(Array.isArray((nulJs as Record<string, unknown>).anyOf as unknown[]))
      .toBe(true);
    expect(Array.isArray((nshJs as Record<string, unknown>).anyOf as unknown[]))
      .toBe(true);

    const exactCode = toCode({
      ...env,
      node: {
        type: "exact_optional",
        base: { type: "string" },
        default: "foo",
        hasDefault: true,
      },
    } as never);
    expect(exactCode).toBe('v.exactOptional(v.string(),"foo")');

    const undCode = toCode({
      ...env,
      node: {
        type: "undefinedable",
        base: { type: "number" },
        default: 42,
        hasDefault: true,
      },
    } as never);
    expect(undCode).toBe("v.undefinedable(v.number(),42)");
  });
});
