import * as formatters from "./formatters/index.ts";
export { formatters };

/**
 * The formatter to use. Can be:
 * - "auto" (default): Automatically detect and use an available formatter.
 * - "none" or null: Do not format the output.
 * - A specific formatter name (e.g., "prettier", "deno", etc.) if available.
 * - A custom formatting function that takes the source code and file path as
 *   arguments and returns the formatted code.
 */
export type Formatter =
  | "auto"
  | "none"
  | null
  | undefined
  | keyof typeof formatters
  | ((source: string, filePath: string) => string | Promise<string>);

interface XFormatterOptions {
  quiet?: boolean;
  verbose?: boolean;
  projectRoot?: string;
  console: Console;
}

const XFormatterOptionsDefaults: XFormatterOptions = {
  quiet: false,
  verbose: false,
  console,
};

export default class XFormatter {
  opts: XFormatterOptions;
  formatter:
    | null
    | ((source: string, filePath: string) => string | Promise<string>)
    | Promise<
      | ((source: string, filePath: string) => string | Promise<string>)
      | null
    > = null;

  /**
   * Creates an instance of XFormatter.
   * @param formatter The formatter to use (see `Formatter` type).
   * @param options Options for the formatter.
   */
  constructor(formatter: Formatter, options?: XFormatterOptions) {
    const opts = this.opts = { ...XFormatterOptionsDefaults, ...options };
    const { console, verbose, quiet } = opts;
    if (!opts.projectRoot) opts.projectRoot = Deno.cwd();

    if (formatter === undefined || formatter === "auto") {
      this.formatter = (async () => {
        for (const f of Object.values(formatters)) {
          if (await f.test()) {
            this.formatter = f.format;
            if (!quiet) {
              console.log(`Using formatter: ${f.name}`);
            }
            return this.formatter;
          }
        }
        if (verbose && !this.formatter) {
          console.warn(
            "No suitable formatter found, proceeding without formatting.",
          );
        }

        this.formatter = null;
        return null;
      })();
    } else if (formatter === null || formatter === "none") {
      this.formatter = null;
    } else if (typeof formatter === "function") {
      this.formatter = formatter;
    } else if (typeof formatter === "string" && formatter in formatters) {
      this.formatter = formatters[formatter as keyof typeof formatters].format;
    } else {
      throw new Error(
        `Unknown formatter: ${formatter}. Available formatters: auto, none, ${
          Object.keys(
            formatters,
          ).join(", ")
        }`,
      );
    }
  }

  async format(source: string, filePath: string): Promise<string> {
    const formatter = await this.formatter;
    if (!formatter) return source;

    const { console, verbose, quiet: _quiet } = this.opts;

    if (verbose) {
      console.log(`Formatting ${filePath} with ${formatter.name}...`);
    }

    const result = formatter(source, filePath);
    return result;
  }
}
