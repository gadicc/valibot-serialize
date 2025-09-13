#!/usr/bin/env -S deno run --quiet
import { isSerializedSchema } from "../main.ts";

const [path] = Deno.args;
const decoder = new TextDecoder();

async function readAll(): Promise<string> {
  if (path) return await Deno.readTextFile(path);
  const buf = await new Response(Deno.stdin.readable).arrayBuffer();
  return decoder.decode(new Uint8Array(buf));
}

const input = await readAll();
let count = 0;
let errors = 0;

function checkOne(obj: unknown, idx: number) {
  count++;
  if (!isSerializedSchema(obj)) {
    console.error(`Invalid SerializedSchema at index ${idx}`);
    errors++;
  }
}

try {
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    const arr = JSON.parse(trimmed);
    if (!Array.isArray(arr)) {
      throw new Error("Top-level JSON must be array or objects per line");
    }
    arr.forEach((o, i) => checkOne(o, i));
  } else {
    // Try NDJSON (one JSON per line)
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const obj = JSON.parse(line);
      checkOne(obj, i);
    }
  }
} catch (err) {
  console.error(
    "Failed to parse input:",
    err instanceof Error ? err.message : String(err),
  );
  Deno.exit(1);
}

if (errors > 0) {
  console.error(`Validation failed: ${errors}/${count} invalid.`);
  Deno.exit(2);
}
console.log(`Validation succeeded: ${count} schemas.`);
