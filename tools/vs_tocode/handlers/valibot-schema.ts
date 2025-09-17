import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Handler } from "./_interface.ts";
import * as vs from "../../../main.ts";

export const name = "valibot-schema";

export const available: Handler["available"] = async () => {
  try {
    await import("@valibot/valibot");
  } catch {
    return false;
  }
  return true;
};

function getStandard(schema: unknown): StandardSchemaV1["~standard"] | null {
  if (typeof schema !== "object" || schema === null) return null;
  if ("~standard" in schema) {
    const std = (schema as Record<string, unknown>)["~standard"];
    if (
      typeof std === "object" && std !== null && "vendor" in std &&
      "version" in std
    ) {
      return std as StandardSchemaV1["~standard"];
    }
  }
  return null;
}

export const test: Handler["test"] = function test(object: unknown): boolean {
  return getStandard(object)?.vendor === "valibot";
};

export const transform: Handler["transform"] = (
  symbol: string,
  object: unknown,
) => {
  const Symbol = symbol[0].toUpperCase() + symbol.slice(1);

  return {
    exports: {
      [symbol]: vs.toCode(
        // deno-lint-ignore no-explicit-any
        vs.fromValibot(object as any),
      ),
    },
    typeExports: {
      [Symbol]: `v.InferOutput<typeof ${symbol}>`,
    },
  };
};
