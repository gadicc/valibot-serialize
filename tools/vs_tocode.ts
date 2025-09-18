import * as fs from "@std/fs";
import { parseArgs } from "@std/cli";
import { debounce } from "@std/async";
import * as path from "@std/path";
import { basesFromGlobs, fileList, fileMatches } from "./vs_tocode/util.ts";
import * as _handlers from "./vs_tocode/handlers/index.ts";
import type { HandlerTransformResult } from "./vs_tocode/handlers/_interface.ts";
import XFormatter, { type Formatter } from "./vs_tocode/formatter.ts";

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

export interface CreateFileOptions {
  /** The module type: "esm" (ECMAScript Module) | "cjs" (CommonJS Module) */
  module: "esm" | "cjs";
  /** Whether to emit .ts files (default: true) */
  typescript: boolean;
  /** Function to generate file header */
  header(): string;
  /** The valibot package to import from, e.g. "valibot" or "@valibot/valibot" */
  valibotPackage: string;
  /** Optional formatter function to run on final output */
  formatter?: XFormatter | null;
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
): Promise<{
  symbol: string;
  handler: string;
  transformResult: _handlers.HandlerTransformResult;
}[]> {
  const mod = await import(filePath + "?t=" + Date.now());
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
  /** The full path to the file */
  filePath: string;
  /** The full path to the output file */
  outFilePath: string;
  /** The symbol results from mapping exports */
  symbolResults: Awaited<ReturnType<typeof mapRelevantExports>>;
  /** The final file contents */
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

  const contents = out.filter(Boolean).join("\n");
  return opts.formatter
    ? opts.formatter.format(contents, fileResult.outFilePath)
    : contents;
}

export interface Options {
  /** Whether to run in dry mode (no changes will be made) */
  dryRun?: boolean;
  /** Explicit files to include (overrides include/exclude) */
  explicitFiles?: string[];
  /** Glob patterns to exclude */
  exclude?: string[];
  /** Glob patterns to include */
  include?: string[];
  /** Output directory */
  outDir?: string;
  /** Show extra debugging information */
  verbose?: boolean;
  /** Suppress output */
  quiet?: boolean;
  /** Watch files for changes */
  watch?: boolean;
  /** Console to use for logging (default: global console) */
  console: Console;
  /** Whether to emit .ts files (default: true) */
  typescript: boolean;
  /** The module type: "esm" (ECMAScript Module) | "cjs" (CommonJS Module) */
  module: "esm" | "cjs";
  /** Formatter to use, "auto" to auto-detect, or a custom function */
  formatter: Formatter;
  /** Function to generate output file path from input file */
  genOutputFilePath(filePath: string, goOpts: Options): string;
}

const defaultOptions: Options = {
  console,
  typescript: true,
  module: "esm",
  formatter: "auto",
  genOutputFilePath(filePath: string, goOpts: Options) {
    const inExt = path.extname(filePath);
    const outExt = goOpts.typescript ? ".ts" : ".js";

    if (goOpts.outDir) {
      return path.join(
        goOpts.outDir,
        path.basename(filePath, inExt) + outExt,
      );
    }
    return path.basename(filePath, inExt) + ".vs" + outExt;
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
        path.relative(projectRoot, filePath) +
        ` (${symbolResults.length} symbol${
          symbolResults.length === 1 ? "" : "s"
        })`,
    );
  }
  if (verbose) {
    const shortOutFilePath = path.relative(
      path.dirname(filePath),
      outFilePath,
    );
    console.log(
      `  -> ${shortOutFilePath} (${contents.length} bytes)`,
    );
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

  const formatter = new XFormatter(opts.formatter, {
    quiet: opts.quiet,
    verbose: opts.verbose,
    console,
    projectRoot,
  });

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

  opts.include = opts.include?.map((p) => path.resolve(p as string));
  opts.exclude = opts.exclude?.map((p) => path.resolve(p as string));

  const files = explicitFiles.length ? explicitFiles : await fileList(
    opts.include!,
    opts.exclude,
  );

  const handlers = await Promise.all(
    Object.values(_handlers).filter((h) => h.available()),
  );
  if (!opts.quiet) {
    console.log(
      `Available handlers: ${handlers.map((h) => `"${h.name}"`).join(", ")}`,
    );
  }

  const allInputFiles: string[] = [];

  async function processFile(
    filePath: string,
  ) {
    const symbolResults = await mapRelevantExports(filePath, handlers);
    if (symbolResults.length === 0) return null;

    allInputFiles.push(filePath);

    const outFilePath = opts.genOutputFilePath(filePath, opts);
    if (allInputFiles?.includes(outFilePath)) {
      console.warn(`Skipping overwrite of input file: ${outFilePath}`);
      return null;
    }

    const interimFileResult: Omit<FileResult, "contents"> = {
      filePath,
      outFilePath,
      symbolResults,
    };

    const contents = await createFileContents(interimFileResult, {
      module: opts.module,
      typescript: opts.typescript,
      valibotPackage,
      formatter,
    });

    const fileResult: FileResult = { ...interimFileResult, contents };
    return fileResult;
  }

  const fileResults = (await Promise.all(
    files.map((filePath) => processFile(filePath)),
  )).filter((fr) => fr !== null);

  async function onChange(filePath: string) {
    const fr = await processFile(filePath);
    if (fr) {
      if (!fileResults.find((f) => f.filePath === fr.filePath)) {
        fileResults.push(fr);
      }
      await writeFile(fr, opts, projectRoot);
    }
  }

  const debouncedOnChange = debounce(onChange, 500);

  await Promise.all(
    fileResults.map((fr) => writeFile(fr, opts, projectRoot)),
  );

  if (opts.watch) {
    const bases = opts.include ? basesFromGlobs(opts.include) : [projectRoot];

    if (!opts.quiet) {
      console.log();
      console.log(
        `Watching ${bases.join(", ")} for changes... (Ctrl-C to exit)`,
      );
    }
    const watchers = bases.map((b) => Deno.watchFs(b, { recursive: true }));
    for (const watcher of watchers) {
      (async () => {
        for await (const event of watcher) {
          if (
            !["modify", "create"].includes(event.kind) ||
            event.paths.length === 0
          ) {
            continue;
          }

          const relevantFiles = event.paths.filter((p) =>
            fileMatches(
              p,
              opts.include || [],
              opts.exclude || [],
              explicitFiles,
            )
          );

          for (const filePath of relevantFiles) {
            debouncedOnChange(filePath);
          }
        }
      })();
    }
  }

  return fileResults;
}

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["watch", "help", "verbose", "quiet", "dryRun", "typescript"],
    string: ["include", "exclude", "outDir", "module", "formatter"],
    negatable: ["typescript"],
    default: {
      dryRun: false,
      help: false,
      quiet: false,
      verbose: false,
      watch: false,
      typescript: true,
      module: "esm",
      formatter: "auto",
    },
    alias: {
      h: "help",
      v: "verbose",
      q: "quiet",
      "out-dir": "outDir",
      "dry-run": "dryRun",
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
  --watch        Watch for changes  
`);
    Deno.exit();
  }

  try {
    await go({
      dryRun: flags["dryRun"],
      explicitFiles: flags._.map((f) => f as string),
      exclude: flags.exclude ? flags.exclude.split(",") : undefined,
      include: flags.include ? flags.include.split(",") : undefined,
      outDir: flags["outDir"],
      typescript: flags.typescript,
      module: flags.module === "esm" ? "esm" : "cjs",
      quiet: flags.quiet,
      verbose: flags.verbose,
      watch: flags.watch,
      // @ts-expect-error: another day
      formatter: flags.formatter,
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
