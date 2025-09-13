#!/usr/bin/env -S deno run --quiet
import { isSerializedSchema, toJsonSchema } from "../main.ts";

const input = await new Response(Deno.stdin.readable).text();
try {
  const data = JSON.parse(input);
  if (!isSerializedSchema(data)) {
    console.error("Input is not a valid SerializedSchema envelope");
    Deno.exit(2);
  }
  const js = toJsonSchema(data);
  console.log(JSON.stringify(js, null, 2));
} catch (err) {
  console.error(
    "Failed to read/convert input:",
    err instanceof Error ? err.message : String(err),
  );
  Deno.exit(1);
}
