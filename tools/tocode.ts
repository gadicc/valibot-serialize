#!/usr/bin/env -S deno run --quiet
import { isSerializedSchema } from "../src/util/guard.ts";
import { toCode } from "../src/converters/to_code.ts";

const input = await new Response(Deno.stdin.readable).text();
try {
  const data = JSON.parse(input);
  if (!isSerializedSchema(data)) {
    console.error("Input is not a valid SerializedSchema envelope");
    Deno.exit(2);
  }
  const code = toCode(data);
  console.log(code);
} catch (err) {
  console.error(
    "Failed to read/convert input:",
    err instanceof Error ? err.message : String(err),
  );
  Deno.exit(1);
}
