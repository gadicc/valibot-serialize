import type { Formatter } from "./_interface.ts";

export const name: Formatter["name"] = "biome";

export const test: Formatter["test"] = async () => {
  try {
    await import("@biomejs/biome/configuration_schema.json");
  } catch (_error) {
    return false;
  }

  try {
    await import("@biomejs/js-api/nodejs");
  } catch (_error) {
    console.warn("Biome found, but js-api not installed");
    console.warn(
      "Please run: npm install --save-dev @biomejs/js-api @biomejs/wasm-nodejs",
    );
    return false;
  }

  return true;
};

export const format: Formatter["format"] = async (source: string) => {
  const Biome = (await import("@biomejs/js-api/nodejs")).Biome;
  const biome = new Biome();

  const { projectKey } = biome.openProject(Deno.cwd());

  const filePath = "virtual.ts";
  const formatted = biome.formatContent(projectKey, source, { filePath });

  const fixed = biome.lintContent(projectKey, formatted.content, {
    filePath,
    fixFileMode: "safeFixes",
  });

  const hasErrors = fixed.diagnostics.some((d) => d.severity === "error");
  if (hasErrors) {
    throw new Error(
      `Linting errors in ${filePath}: ${
        JSON.stringify(fixed.diagnostics, null, 2)
      }`,
    );
  }

  return fixed.content;
};
