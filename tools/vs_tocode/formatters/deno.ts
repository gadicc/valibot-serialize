import type { Formatter } from "./_interface.ts";

export const name: Formatter["name"] = "deno";

export const test: Formatter["test"] = () => {
  return "Deno" in globalThis;
};

/*
// deno-lint-ignore no-explicit-any
let createStreaming: any;
// deno-lint-ignore no-explicit-any
let formatter: any;

export const format: Formatter["format"] = async (input: string) => {
  if (!createStreaming) {
    // deno-lint-ignore no-import-prefix
    createStreaming = (await import("jsr:@dprint/formatter")).createStreaming;
  }

  if (!formatter) {
    formatter = await createStreaming(
      fetch("https://plugins.dprint.dev/typescript-0.57.0.wasm"),
    );
    formatter.setConfig({}, { deno: true });
  }

  return formatter.formatText("file.ts", input);
};
*/

export const format: Formatter["format"] = async (code: string) => {
  const cmd = new Deno.Command("deno", {
    args: ["fmt", "--ext", "ts", "-"], // "--ext" tells fmt how to parse stdin
    stdin: "piped",
    stdout: "piped",
  });

  const proc = cmd.spawn();
  const writer = proc.stdin.getWriter();
  await writer.write(new TextEncoder().encode(code));
  writer.releaseLock();
  await proc.stdin.close();

  const formatted = await proc.stdout.text();
  return formatted;
};
