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
  deepEqual: (x: unknown, y: unknown) => boolean,
) {
  // deno-lint-ignore require-await
  await fc.assert(fc.asyncProperty(arb, async (x) => {
    const a = v.safeParse(A, x);
    const b = v.safeParse(B, x);
    return a.success === b.success &&
      (!a.success || deepEqual(a.output, b.output));
  }));
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
  const serialized = vs.serialize(schema);

  const deserialized = vs.deserialize(serialized);
  equalSchema(schema, deserialized, "deserialized");
  await assertSameAcceptance(schema, deserialized, fc.anything());
  await assertSameOutput(
    schema,
    deserialized,
    fc.anything(),
    (x, y) => JSON.stringify(x) === JSON.stringify(y),
  );

  if (checkJsonSchema) {
    const jsonSchema = vs.toJsonSchema(serialized);
    const schemaFromJsonSchema = vs.deserialize(vs.fromJsonSchema(jsonSchema));
    equalSchema(schema, schemaFromJsonSchema, "JSON schema");
    await assertSameAcceptance(schema, schemaFromJsonSchema, fc.anything());
    await assertSameOutput(
      schema,
      schemaFromJsonSchema,
      fc.anything(),
      (x, y) => JSON.stringify(x) === JSON.stringify(y),
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
    (x, y) => JSON.stringify(x) === JSON.stringify(y),
  );
}
