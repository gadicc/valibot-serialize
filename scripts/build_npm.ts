import { build, emptyDir } from "@deno/dnt";
import denoJson from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./main.ts"],
  outDir: "./npm",
  test: false,
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "valibot-serialize",
    // version: Deno.args[0],
    version: "0.0.1", // semantic-release will replace this
    description: denoJson.description,
    author: "Gadi Cohen <dragon@wastelands.net>",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/gadicc/valibot-serialize.git",
    },
    bugs: {
      url: "https://github.com/gadicc/valibot-serialize/issues",
    },
    keywords: [
      "valibot",
      "validation",
      "schema",
      "serialize",
      "deserialize",
      "json-schema",
    ],
    "engines": {
      "node": ">=20.0.0",
    },
  },
  importMap: "deno.json",

  // Use jsr import in deno.json for valibot once we get
  // https://github.com/jsr-que/async/pull/3

  // until we can solve @namespace/imports from jsr.  mappings don't work.
  typeCheck: false,

  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE.txt", "npm/LICENSE.txt");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
