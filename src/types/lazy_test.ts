import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as v from "@valibot/valibot";
import { fromValibot } from "../converters/from_valibot.ts";
import { toValibot } from "../converters/to_valibot.ts";
import { toCode } from "../converters/to_code.ts";
import { toJsonSchema } from "../converters/to_jsonschema.ts";
import { isSchemaNode as isLazyNode } from "./lazy.ts";

function createRecursiveLazy(): v.BaseSchema<
  unknown,
  unknown,
  v.BaseIssue<unknown>
> {
  const schema: v.BaseSchema<
    unknown,
    unknown,
    v.BaseIssue<unknown>
  > = v.lazy(() =>
    v.object({
      value: v.string(),
      next: v.optional(schema),
    })
  ) as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
  return schema;
}

describe("types/lazy", () => {
  it("guard rejects invalid base", () => {
    expect(
      isLazyNode({ type: "lazy" } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
    expect(
      isLazyNode({ type: "lazy", base: 1 } as unknown, {
        isSchemaNode: () => false,
      }),
    ).toBe(false);
  });

  it("serialize simple lazy schema", () => {
    const serialized = fromValibot(v.lazy(() => v.string()));
    expect(serialized.node).toEqual({
      type: "lazy",
      base: { type: "string" },
    });
  });

  it("serialize recursive lazy schema retains self reference", () => {
    const nodeSchema = createRecursiveLazy();
    const serialized = fromValibot(nodeSchema);
    const lazyNode = serialized.node as unknown as {
      type: string;
      base: {
        type: string;
        entries: Record<
          string,
          { type: string; base?: unknown; required?: boolean }
        >;
      };
    };
    expect(lazyNode.type).toBe("lazy");
    expect(lazyNode.base.type).toBe("object");
    const nextEntry = lazyNode.base.entries.next;
    expect(nextEntry?.type).toBe("optional");
    expect(nextEntry?.base).toBe(serialized.node);
  });

  it("round trip recursive lazy schema", () => {
    const nodeSchema = createRecursiveLazy();
    const serialized = fromValibot(nodeSchema);
    const reconstructed = toValibot(serialized);
    expect(() =>
      v.parse(reconstructed, {
        value: "root",
        next: { value: "child", next: { value: "leaf" } },
      })
    ).not.toThrow();
    expect(() =>
      v.parse(reconstructed, {
        value: "root",
        next: { value: 123 as unknown as string },
      })
    ).toThrow();
  });

  it("toCode and toJsonSchema for simple lazy", () => {
    const serialized = fromValibot(v.lazy(() => v.number()));
    const code = toCode(serialized);
    expect(code).toBe("v.lazy(() => v.number())");
    const jsonSchema = toJsonSchema(serialized);
    expect(jsonSchema).toEqual({ type: "number" });
  });

  it("code/json exporters reject recursive lazies", () => {
    const serialized = fromValibot(createRecursiveLazy());
    expect(() => toCode(serialized)).toThrow(/Cyclic schema/);
    expect(() => toJsonSchema(serialized)).toThrow(/Cyclic schema/);
  });

  it("lazyAsync serialization rejects", () => {
    const asyncLazy = v.lazyAsync(() => Promise.resolve(v.string()));
    expect(() =>
      fromValibot(
        asyncLazy as unknown as v.BaseSchema<
          unknown,
          unknown,
          v.BaseIssue<unknown>
        >,
      )
    ).toThrow("async lazy not supported");
  });
});
