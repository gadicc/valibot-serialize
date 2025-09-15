import * as v from "@valibot/valibot";
import * as vs from "../../main.ts";
import type { AnySchema } from "../../src/types/lib/type_interfaces.ts";
import { expect } from "@std/expect";
import fc from "fast-check";

// @ts-expect-error: ignore - for new Function() below.
globalThis.v = v;

export async function assertSameAcceptance<T>(
  // deno-lint-ignore no-explicit-any
  A: v.BaseSchema<T, any, any>,
  // deno-lint-ignore no-explicit-any
  B: v.BaseSchema<T, any, any>,
  arb: fc.Arbitrary<unknown>,
) {
  await fc.assert(
    // deno-lint-ignore require-await
    fc.asyncProperty(arb, async (x) => v.is(A, x) === v.is(B, x)),
  );
}

export async function assertSameOutput<T>(
  // deno-lint-ignore no-explicit-any
  A: v.BaseSchema<T, any, any>,
  // deno-lint-ignore no-explicit-any
  B: v.BaseSchema<T, any, any>,
  arb: fc.Arbitrary<unknown>,
) {
  // deno-lint-ignore require-await
  await fc.assert(fc.asyncProperty(arb, async (x) => {
    const a = v.safeParse(A, x);
    const b = v.safeParse(B, x);
    return a.success === b.success &&
      (!a.success || deepEqual(a.output, b.output));
  }));
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  const ta = typeof a;
  const tb = typeof b;
  if (ta !== tb) return false;
  if (a === null || b === null) return a === b;
  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a.entries()) {
      if (!b.has(k)) return false;
      if (!deepEqual(v, b.get(k))) return false;
    }
    return true;
  }
  // Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    outer: for (const va of a.values()) {
      for (const vb of b.values()) {
        if (deepEqual(va, vb)) continue outer;
      }
      return false;
    }
    return true;
  }
  // Plain objects
  if (ta === "object" && tb === "object") {
    const ao = a as Record<string | symbol, unknown>;
    const bo = b as Record<string | symbol, unknown>;
    const aKeys = Reflect.ownKeys(ao);
    const bKeys = Reflect.ownKeys(bo);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!deepEqual(ao[k as never], bo[k as never])) return false;
    }
    return true;
  }
  return false;
}

export function equalSchema(a: AnySchema, b: AnySchema, where?: string) {
  expect(JSON.parse(JSON.stringify(b)), where).toEqual(
    JSON.parse(JSON.stringify(a)),
  );
}

export async function e2eCheck(
  schema: AnySchema,
  { checkJsonSchema }: { checkJsonSchema?: boolean } = {
    checkJsonSchema: false,
  },
) {
  const serialized = vs.fromValibot(schema);

  const deserialized = vs.toValibot(serialized);
  equalSchema(schema, deserialized, "deserialized");
  await assertSameAcceptance(schema, deserialized, fc.anything());
  await assertSameOutput(
    schema,
    deserialized,
    fc.anything(),
  );

  if (checkJsonSchema) {
    const jsonSchema = vs.toJsonSchema(serialized);
    const schemaFromJsonSchema = vs.toValibot(vs.fromJsonSchema(jsonSchema));
    equalSchema(schema, schemaFromJsonSchema, "JSON schema");
    await assertSameAcceptance(schema, schemaFromJsonSchema, fc.anything());
    await assertSameOutput(
      schema,
      schemaFromJsonSchema,
      fc.anything(),
    );
  }

  const code = vs.toCode(serialized);
  const schemaFromCode = new Function(`return ${code}`)();
  equalSchema(schema, schemaFromCode, "code");
  await assertSameAcceptance(schema, schemaFromCode, fc.anything());
  await assertSameOutput(
    schema,
    schemaFromCode,
    fc.anything(),
  );
}
