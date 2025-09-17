import { build, emptyDir } from "@deno/dnt";
import denoJson from "../deno.json" with { type: "json" };

await emptyDir("./npm");

function rewrite(path: string, rewriter: (content: string) => string) {
  const original = Deno.readTextFileSync(path);
  const updated = rewriter(original);
  Deno.writeTextFileSync(path, updated);
}

await build({
  entryPoints: ["./main.ts", {
    kind: "bin",
    name: "vs_tocode",
    path: "./tools/vs_tocode.ts",
  }],
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
    devDependencies: {
      "tsx": "^4.20.0",
    },
    peerDependencies: {
      "drizzle-orm": denoJson.imports["drizzle-orm"].split("@").pop(),
      "drizzle-valibot": denoJson.imports["drizzle-valibot"].split("@").pop(),
    },
  },
  importMap: "deno.json",

  // Use jsr import in deno.json for valibot once we get
  // https://github.com/jsr-que/async/pull/3

  // until we can solve @namespace/imports from jsr.  mappings don't work.
  typeCheck: false,

  postBuild() {
    // steps to run after building and before running the tests
    const pkg = Deno.readTextFileSync("npm/package.json");
    const pkgJson = JSON.parse(pkg);
    for (const peerDep of Object.keys(pkgJson.peerDependencies)) {
      delete pkgJson.dependencies[peerDep];
    }
    Deno.writeTextFileSync(
      "npm/package.json",
      JSON.stringify(pkgJson, null, 2) + "\n",
    );

    rewrite("npm/esm/tools/vs_tocode.js", (content) =>
      content.replace(
        /^\#\!\/usr\/bin\/env node/,
        "#!/usr/bin/env -S tsx",
      ));
    rewrite("npm/script/tools/vs_tocode.js", (content) =>
      content.replace(
        /^\#\!\/usr\/bin\/env node/,
        "#!/usr/bin/env -S tsx",
      ));

    Deno.copyFileSync("LICENSE.txt", "npm/LICENSE.txt");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
