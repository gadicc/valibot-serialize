#!/usr/bin/env -S deno run --allow-write=docs/MAPPINGS.md
import * as v from "@valibot/valibot";
import { serialize, toJsonSchema } from "../main.ts";

type Sample = {
  title: string;
  code: string;
  build: () => unknown;
};

const samples: Sample[] = [
  {
    title: "string.email",
    code: "v.pipe(v.string(), v.email())",
    build: () => v.pipe(v.string(), v.email()),
  },
  {
    title: "string.url",
    code: "v.pipe(v.string(), v.url())",
    build: () => v.pipe(v.string(), v.url()),
  },
  {
    title: "string.uuid",
    code: "v.pipe(v.string(), v.uuid())",
    build: () => v.pipe(v.string(), v.uuid()),
  },
  {
    title: "string.ip(ipv4|ipv6)",
    code: "v.pipe(v.string(), v.ip())",
    build: () => v.pipe(v.string(), v.ip()),
  },
  {
    title: "string.ipv4",
    code: "v.pipe(v.string(), v.ipv4())",
    build: () => v.pipe(v.string(), v.ipv4()),
  },
  {
    title: "string.ipv6",
    code: "v.pipe(v.string(), v.ipv6())",
    build: () => v.pipe(v.string(), v.ipv6()),
  },
  {
    title: "string.hexColor",
    code: "v.pipe(v.string(), v.hexColor())",
    build: () => v.pipe(v.string(), v.hexColor()),
  },
  {
    title: "string.slug",
    code: "v.pipe(v.string(), v.slug())",
    build: () => v.pipe(v.string(), v.slug()),
  },
  {
    title: "string.digits",
    code: "v.pipe(v.string(), v.digits())",
    build: () => v.pipe(v.string(), v.digits()),
  },
  {
    title: "string.emoji",
    code: "v.pipe(v.string(), v.emoji())",
    build: () => v.pipe(v.string(), v.emoji()),
  },
  {
    title: "string.hexadecimal",
    code: "v.pipe(v.string(), v.hexadecimal())",
    build: () => v.pipe(v.string(), v.hexadecimal()),
  },
  {
    title: "string.creditCard",
    code: "v.pipe(v.string(), v.creditCard())",
    build: () => v.pipe(v.string(), v.creditCard()),
  },
  {
    title: "string.imei",
    code: "v.pipe(v.string(), v.imei())",
    build: () => v.pipe(v.string(), v.imei()),
  },
  {
    title: "string.mac",
    code: "v.pipe(v.string(), v.mac())",
    build: () => v.pipe(v.string(), v.mac()),
  },
  {
    title: "string.mac48",
    code: "v.pipe(v.string(), v.mac48())",
    build: () => v.pipe(v.string(), v.mac48()),
  },
  {
    title: "string.mac64",
    code: "v.pipe(v.string(), v.mac64())",
    build: () => v.pipe(v.string(), v.mac64()),
  },
  {
    title: "string.base64",
    code: "v.pipe(v.string(), v.base64())",
    build: () => v.pipe(v.string(), v.base64()),
  },
  {
    title: "string.ulid",
    code: "v.pipe(v.string(), v.ulid())",
    build: () => v.pipe(v.string(), v.ulid()),
  },
  {
    title: "string.nanoid",
    code: "v.pipe(v.string(), v.nanoid())",
    build: () => v.pipe(v.string(), v.nanoid()),
  },
  {
    title: "string.cuid2",
    code: "v.pipe(v.string(), v.cuid2())",
    build: () => v.pipe(v.string(), v.cuid2()),
  },
  {
    title: "string.isoDate",
    code: "v.pipe(v.string(), v.isoDate())",
    build: () => v.pipe(v.string(), v.isoDate()),
  },
  {
    title: "string.isoDateTime",
    code: "v.pipe(v.string(), v.isoDateTime())",
    build: () => v.pipe(v.string(), v.isoDateTime()),
  },
  {
    title: "string.isoTime",
    code: "v.pipe(v.string(), v.isoTime())",
    build: () => v.pipe(v.string(), v.isoTime()),
  },
  {
    title: "string.isoTimeSecond",
    code: "v.pipe(v.string(), v.isoTimeSecond())",
    build: () => v.pipe(v.string(), v.isoTimeSecond()),
  },
  {
    title: "string.isoTimestamp",
    code: "v.pipe(v.string(), v.isoTimestamp())",
    build: () => v.pipe(v.string(), v.isoTimestamp()),
  },
  {
    title: "string.isoWeek",
    code: "v.pipe(v.string(), v.isoWeek())",
    build: () => v.pipe(v.string(), v.isoWeek()),
  },
  {
    title: "string.startsWith/endsWith",
    code: "v.pipe(v.string(), v.startsWith(\"ab\"), v.endsWith(\"yz\"))",
    build: () => v.pipe(v.string(), v.startsWith("ab"), v.endsWith("yz")),
  },
  {
    title: "string.min/max length",
    code: "v.pipe(v.string(), v.minLength(3), v.maxLength(5))",
    build: () => v.pipe(v.string(), v.minLength(3), v.maxLength(5)),
  },
  {
    title: "string.graphemes",
    code: "v.pipe(v.string(), v.minGraphemes(1), v.maxGraphemes(5))",
    build: () => v.pipe(v.string(), v.minGraphemes(1), v.maxGraphemes(5)),
  },
];

function header(title: string): string {
  return `\n\n## ${title}\n`;
}

function codeBlock(code: string, lang = "ts"): string {
  return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
}

function jsonBlock(obj: unknown, title?: string): string {
  const content = JSON.stringify(obj, null, 2);
  return `${title ? `\n\n**${title}**` : ""}\n\n\`\`\`json\n${content}\n\`\`\`\n`;
}

const parts: string[] = [];
parts.push("# Valibot → AST → JSON Schema Mappings\n\nGenerated examples for common string validators and flags.\n\nRun: `deno task gen-docs` to refresh this file.\n");

for (const s of samples) {
  try {
    const built = s.build();
    const ast = serialize(built as unknown as Parameters<typeof serialize>[0]);
    const js = toJsonSchema(ast);
    parts.push(header(s.title));
    parts.push(codeBlock(s.code));
    parts.push(jsonBlock(ast, "AST"));
    parts.push(jsonBlock(js, "JSON Schema"));
  } catch (err) {
    parts.push(header(s.title));
    parts.push("(failed to generate: " + (err instanceof Error ? err.message : String(err)) + ")\n");
  }
}

await Deno.mkdir("docs", { recursive: true });
await Deno.writeTextFile("docs/MAPPINGS.md", parts.join("\n"));
console.log("Wrote docs/MAPPINGS.md");

