import type { Formatter } from "./_interface.ts";

export const name: Formatter["name"] = "prettier";

export const test: Formatter["test"] = async () => {
  try {
    await import("prettier");
  } catch (_error) {
    return false;
  }

  return true;
};

export const format: Formatter["format"] = async (source: string) => {
  const prettier = await import("prettier");
  return await prettier.format(source);
};
