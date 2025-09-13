#!/usr/bin/env -S deno run --quiet
import * as v from "@valibot/valibot";
import { serialize, toJsonSchema } from "../main.ts";

type Entry = { name: string; schema: unknown };

const entries: Entry[] = [
  { name: "string: email+startsWith", schema: v.pipe(v.string(), v.email(), v.startsWith("a")) },
  { name: "number: integer [0,10]", schema: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10)) },
  { name: "array<number>(length=2)", schema: v.pipe(v.array(v.number()), v.length(2)) },
  { name: "object strict", schema: v.strictObject({ a: v.string(), b: v.optional(v.number()) }) },
  { name: "union<string|number>", schema: v.union([v.string(), v.number()]) },
  { name: "enum picklist", schema: v.picklist(["x", "y", "z"]) },
  { name: "tuple [string, number]", schema: v.tuple([v.string(), v.number()]) },
  { name: "set<string> minSize=1", schema: v.pipe(v.set(v.string()), v.minSize(1)) },
  { name: "map<string,number>", schema: v.map(v.string(), v.number()) },
  { name: "date", schema: v.date() },
];

for (const { name, schema } of entries) {
  const ast = serialize(schema as unknown as Parameters<typeof serialize>[0]);
  const js = toJsonSchema(ast);
  console.log("\n===", name, "===\n");
  console.log("AST:\n", JSON.stringify(ast, null, 2));
  console.log("\nJSON Schema:\n", JSON.stringify(js, null, 2));
}

