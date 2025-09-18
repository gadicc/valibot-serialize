import * as vs from "../../../main.ts";
import type { Handler } from "./_interface.ts";

export const name = "drizzle-table";

export const available: Handler["available"] = async () => {
  try {
    await import("drizzle-orm");
  } catch {
    return false;
  }
  return true;
};

export const test: Handler["test"] = (obj: unknown) => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.getOwnPropertySymbols(obj).some(
      (s) => s.toString() === "Symbol(drizzle:IsDrizzleTable)",
    )
  );
};

export const transform: Handler["transform"] = async (symbol, object) => {
  const drizzleValibot = await import("drizzle-valibot");
  // deno-lint-ignore no-explicit-any
  const t = (dv: any) => vs.toCode(vs.fromValibot(dv));

  const Symbol = symbol[0].toUpperCase() + symbol.slice(1);

  return {
    exports: {
      // deno-lint-ignore no-explicit-any
      [symbol + "Select"]: t(drizzleValibot.createInsertSchema(object as any)),
      // deno-lint-ignore no-explicit-any
      [symbol + "Insert"]: t(drizzleValibot.createSelectSchema(object as any)),
      // deno-lint-ignore no-explicit-any
      [symbol + "Update"]: t(drizzleValibot.createUpdateSchema(object as any)),
    },
    typeExports: {
      [Symbol + "Select"]: `v.InferOutput<typeof ${symbol}Select>`,
      [Symbol + "Insert"]: `v.InferInput<typeof ${symbol}Insert>`,
      [Symbol + "Update"]: `v.InferInput<typeof ${symbol}Update>`,
    },
  };
};
