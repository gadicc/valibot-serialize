import * as v from "@valibot/valibot";
import * as fc from "fast-check";
import * as vs from "../main.ts";
import {
  SeedInvalidDataGenerator,
  seedToInvalidData,
  seedToSchema,
  seedToValidData,
} from "@traversable/valibot-test";
import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { fail } from "@std/assert";

import XFormatter from "../tools/vs_tocode/formatter.ts";
const formatter = new XFormatter("deno");
const format = (code: string) => formatter.format(code, "file.ts");

type LoggerDeps = {
  // deno-lint-ignore no-explicit-any
  schema: v.BaseSchema<any, any, any>;
  data: unknown;
  error: unknown;
};

function logger({ schema, data, error }: LoggerDeps) {
  console.group("FAILURE: property test");
  console.error("Error:", error);
  console.debug("schema:", format(JSON.stringify(vs.fromValibot(schema))));
  console.debug("data:", data);
  console.groupEnd();
}

const fuzzTestsEnabled = (() => {
  /*
  try {
    return Deno.env.get("FUZZ_TESTS") === "1";
  } catch (_error) {
    console.log("Deno.env.get is not available, skipping fuzz tests");
    return false;
  }
  */
  return true;
})();

if (fuzzTestsEnabled) {
  describe("fuzz testing", () => {
    it("Invariant: vs.toValibot does not change the schema's semantics", () => {
      fc.assert(
        fc.property(SeedInvalidDataGenerator, (seed) => {
          const inputSchema = seedToSchema(seed);
          const validData = seedToValidData(seed);
          const invalidData = seedToInvalidData(seed);

          // sanity check:
          expect(() => v.parse(inputSchema, invalidData)).toThrow();
          expect(() => v.parse(inputSchema, validData)).not.toThrow();

          // roundtrip: rebuild the same schema
          const serialized = vs.fromValibot(inputSchema);
          const outputSchema = vs.toValibot(serialized);

          // the real test:
          try {
            expect(() => v.parse(outputSchema, invalidData)).toThrow();
          } catch (error) {
            // if this test failed, log the failure so we can figure out what went wrong:
            logger({ schema: outputSchema, data: validData, error });
            fail("v.parse(outputSchema, invalidData) succeeded");
          }

          try {
            expect(() => v.parse(outputSchema, validData)).not.toThrow();
          } catch (error) {
            // if this test failed, log the failure so we can figure out what went wrong:
            logger({ schema: outputSchema, data: validData, error });
            fail("v.parse(outputSchema, validData) failed");
          }
        }),
        {
          numRuns:
            1_000, /* <- generate 1,000 Valibot schemas to enforce this invariant */
        },
      );
    });
    it("Invariant: vs.toCode does not change the schema's semantics", () => {
      return fc.assert(
        fc.asyncProperty(SeedInvalidDataGenerator, async (seed) => {
          const inputSchema = seedToSchema(seed);
          const validData = seedToValidData(seed);
          const invalidData = seedToInvalidData(seed);

          // sanity check:
          expect(() => v.parse(inputSchema, invalidData)).toThrow();
          expect(() => v.parse(inputSchema, validData)).not.toThrow();

          // roundtrip: rebuild the same schema
          const serialized = vs.fromValibot(inputSchema);
          const outputSchema = await eval(`(async () => {
          const v = await import('@valibot/valibot')
          return ${vs.toCode(serialized)}
        })()`);

          // the real test:
          try {
            expect(() => v.parse(outputSchema, invalidData)).toThrow();
          } catch (error) {
            // if this test failed, log the failure so we can figure out what went wrong:
            logger({ schema: outputSchema, data: validData, error });
            fail("v.parse(outputSchema, invalidData) succeeded");
          }

          try {
            expect(() => v.parse(outputSchema, validData)).not.toThrow();
          } catch (error) {
            // if this test failed, log the failure so we can figure out what went wrong:
            logger({ schema: outputSchema, data: validData, error });
            fail("v.parse(outputSchema, validData) failed");
          }
        }),
        {
          numRuns:
            1_000, /* <- generate 1,000 Valibot schemas to enforce this invariant */
        },
      );
    });
  });
}
