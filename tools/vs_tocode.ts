import * as fs from "@std/fs";
import { parseArgs } from "@std/cli";
import * as path from "@std/path";
import { fileList } from "./vs_tocode/util.ts";
import * as _handlers from "./vs_tocode/handlers/index.ts";
import type { HandlerTransformResult } from "./vs_tocode/handlers/_interface.ts";

// Useful for anyone not using the CLI directly
export * as util from "./vs_tocode/util.ts";
export * as _handlers from "./vs_tocode/handlers/index.ts";
export type { HandlerTransformResult };

function gen_export(symbol: string, code: string, module: "cjs" | "esm") {
  if (module === "esm") {
    return `export const ${symbol} = ${code};\n`;
  }
  return `exports.${symbol} = ${code};\n`;
}
function gen_type_export(symbol: string, code: string, module: "cjs" | "esm") {
  if (module === "esm") {
    return `export type ${symbol} = ${code};`;
  }
  return null;
}

interface CreateFileOptions {
  module: "cjs" | "esm";
  typescript: boolean;
  header(): string;
  valibotPackage: string;
}

const createFileDefaults: Omit<CreateFileOptions, "options"> = {
  module: "esm",
  typescript: true,
  header() {
    return "// This file is auto-generated. Do not edit.\n";
  },
  valibotPackage: "valibot",
};

async function mapRelevantExports(
  filePath: string,
  handlers: _handlers.Handler[],
) {
  const mod = await import(filePath);
  return (await Promise.all(
    Object.entries(mod).map(async ([symbol, object]) => {
      const handler = handlers.find((h) => h.test(object));
      if (!handler) return null;

      const transformResult = await handler.transform(symbol, object);
      if (!transformResult) return null;

      return { symbol, handler: handler.name, transformResult };
    }),
  )).filter((r) => r !== null);
}

export interface FileResult {
  filePath: string;
  outFilePath: string;
  symbolResults: Awaited<ReturnType<typeof mapRelevantExports>>;
  contents: string;
}

function createFileContents(
  fileResult: Omit<FileResult, "contents">,
  cfOpts: Partial<CreateFileOptions>,
) {
  const opts = { ...createFileDefaults, ...cfOpts } as CreateFileOptions;
  const { symbolResults } = fileResult;

  const out = [opts.header()];

  if (cfOpts.module === "esm") {
    out.push(`import * as v from "${opts.valibotPackage}";\n`);
  } else {
    out.push(`const v = require("${opts.valibotPackage}");\n`);
  }

  for (const { transformResult } of symbolResults) {
    if (transformResult.exports) {
      for (const [name, code] of Object.entries(transformResult.exports)) {
        if (!code) continue;
        const result = gen_export(name, code, opts.module);
        if (result) out.push(result);
      }
    }

    if (opts.typescript && transformResult.typeExports) {
      for (const [name, code] of Object.entries(transformResult.typeExports)) {
        if (!code) continue;
        const result = gen_type_export(name, code, opts.module);
        if (result) out.push(result);
      }
    }
  }

  return out.filter(Boolean).join("\n");
}

export interface Options {
  dryRun?: boolean;
  explicitFiles?: string[];
  exclude?: string[];
  include?: string[];
  outDir?: string;
  verbose?: boolean;
  quiet?: boolean;
  watch?: boolean;
  console: Console;
  typescript: boolean;
  module: "esm" | "cjs";
  /** Function to generate output file path from input file */
  genOutputFilePath(
    fileResult: Omit<FileResult, "outFilePath" | "contents">,
    goOpts: Options,
  ): string;
}

const defaultOptions: Options = {
  console,
  typescript: true,
  module: "esm",
  genOutputFilePath(fileResult: FileResult, goOpts: Options) {
    const inExt = path.extname(fileResult.filePath);
    const outExt = goOpts.typescript ? ".ts" : ".js";

    if (goOpts.outDir) {
      return path.join(
        goOpts.outDir,
        path.basename(fileResult.filePath, inExt) + outExt,
      );
    }
    return path.basename(fileResult.filePath, inExt) + ".vs" + outExt;
  },
};

async function writeFile(
  fileResult: FileResult,
  goOpts: Options,
  projectRoot: string = "",
) {
  const { console, quiet, dryRun, verbose } = goOpts;
  const { filePath, outFilePath, symbolResults, contents } = fileResult;

  if (!quiet) {
    console.log(
      "* " + (dryRun ? "(dry run) " : "") +
        path.relative(projectRoot, filePath),
    );
  }
  if (verbose) {
    const shortOutFilePath = path.relative(
      path.dirname(filePath),
      outFilePath,
    );
    console.log(
      `  -> ${shortOutFilePath} (${symbolResults.length} symbol(s), ${contents.length} bytes)`,
    );
    console.log("contents", dryRun);
    if (dryRun) {
      console.log(contents.split("\n").map((l) => "     " + l).join("\n"));
      console.log();
    }
  }

  if (!dryRun) {
    await fs.ensureDir(path.dirname(outFilePath));
    await Deno.writeTextFile(outFilePath, contents);
  }
}

async function go(options: Partial<Options>) {
  const opts: Options = { ...defaultOptions, ...options };
  const console = opts.console;

  // TODO, actual projectRoot?
  const projectRoot = Deno.cwd();

  const isDenoProject = await fs.exists(
    path.join(projectRoot, "deno.json"),
  ) || await fs.exists(
    path.join(projectRoot, "deno.jsonc"),
  );

  const valibotPackage = isDenoProject ? "@valibot/valibot" : "valibot";

  const explicitFiles =
    opts.explicitFiles?.map((f) => path.resolve(f as string)) || [];
  if (explicitFiles.length) {
    if (opts.include || opts.exclude) {
      throw new Error("Cannot use include/exclude with explicit file list");
    }
  } else if (!opts.include?.length) {
    throw new Error(
      "Must provide either explicit file list or --include globs",
    );
  }

  const files = explicitFiles.length ? explicitFiles : await fileList(
    opts.include!,
    opts.exclude,
  );

  const handlers = await Promise.all(
    Object.values(_handlers).filter((h) => h.available()),
  );
  if (opts.verbose) {
    console.log(
      `Available handlers: ${handlers.map((h) => `"${h.name}"`).join(", ")}`,
    );
  }

  const _fileResults = (await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      symbolResults: await mapRelevantExports(filePath, handlers),
    })),
  )).filter((r) => r.symbolResults.length > 0);
  const allInputFiles = _fileResults.map((r) => r.filePath);

  const fileResults: Omit<FileResult, "contents">[] = _fileResults
    .map((fileResult) => {
      const outFilePath = opts.genOutputFilePath(fileResult, opts);
      if (allInputFiles?.includes(outFilePath)) {
        console.warn(`Skipping overwrite of input file: ${outFilePath}`);
        return null;
      }

      return { ...fileResult, outFilePath };
    })
    .filter((r) => r !== null);

  const finalResults = await Promise.all(
    fileResults.map(async (fileResult) => ({
      ...fileResult,
      contents: await createFileContents(fileResult, {
        module: opts.module,
        typescript: opts.typescript,
        valibotPackage,
      }),
    })),
  );

  await Promise.all(
    finalResults.map((fr) => writeFile(fr, opts, projectRoot)),
  );

  return finalResults;
}

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["watch", "help", "verbose", "quiet", "dryRun", "typescript"],
    string: ["include", "exclude", "dryRun", "module"],
    negatable: ["typescript"],
    default: {
      dryRun: false,
      help: false,
      quiet: false,
      verbose: false,
      watch: false,
      typescript: true,
      module: "esm",
    },
    alias: {
      w: "watch",
      h: "help",
      v: "verbose",
      q: "quiet",
      "-out-dir": "outDir",
      "-dry-run": "dryRun",
    },
  });

  if (flags.help) {
    console.log(`
Usage
  $ tocode [options] [files...]

Options
  -h, --help         Show this help
  --dry-run          Do not write any files, just show what would be done
  --exclude=<globs>  Comma-separated list of files to exclude
  -f, --force        Force overwrite of existing files
  --out-dir=<dir>    Output directory (default: same as source file)
  --include=<globs>  Comma-separated list, e.g. "db/schema/*.ts,models/**/*.ts"
  -q, --quiet        Suppress non-error output
  -v, --verbose      Show verbose output
  -w, --watch        Watch for changes  
`);
    Deno.exit();
  }

  try {
    await go({
      dryRun: flags["dry-run"],
      explicitFiles: flags._.map((f) => f as string),
      exclude: flags.exclude ? flags.exclude.split(",") : undefined,
      include: flags.include ? flags.include.split(",") : undefined,
      outDir: flags["outDir"],
      typescript: flags.typescript,
      module: flags.module === "esm" ? "esm" : "cjs",
      quiet: flags.quiet,
      verbose: flags.verbose,
      watch: flags.watch,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      Deno.exit(1);
    }
  }
}

if (import.meta.main) {
  main();
}
