import * as path from "@std/path";
import { globToRegExp } from "@std/path";
import { expandGlob } from "@std/fs";

export async function fileList(include: string[], exclude?: string[]) {
  const files = new Set<string>();
  for (const pattern of include) {
    for await (const file of expandGlob(pattern, { globstar: true, exclude })) {
      if (file.isFile) files.add(path.resolve(file.path));
    }
  }
  return Array.from(files);
}

/** Return the non-glob path prefix (e.g. "src" from "src/**\/*.ts"). */
export function globBase(pattern: string): string {
  const pat = pattern.replace(/[\\/]+/g, path.SEPARATOR); // normalize slashes
  const abs = path.isAbsolute(pat);
  const parts = pat.split(path.SEPARATOR);

  const GLOB = /[*?[\]{}()!+@]/; // catches **, extglobs, braces, etc.
  const base: string[] = [];

  for (const part of parts) {
    if (part === "" && abs) {
      base.push("");
      continue;
    } // keep root on absolute
    if (part === "." || part === "") continue; // ignore ./ and empty
    if (GLOB.test(part)) break; // stop at first globby seg
    base.push(part);
  }

  if (abs && base.length === 0) return path.SEPARATOR; // "/" (or drive root on Win)
  const joined = base.join(path.SEPARATOR) || (abs ? path.SEPARATOR : ".");
  return path.normalize(joined);
}

/** Given multiple globs, return minimal unique base directories. */
export function basesFromGlobs(patterns: string[]): string[] {
  const bases = patterns.map(globBase).map(path.normalize);

  // Remove bases that are children of another base
  const out: string[] = [];
  for (const b of [...new Set(bases)].sort((a, b) => a.length - b.length)) {
    if (
      !out.some((parent) => {
        const rel = path.relative(parent, b);
        return rel === "" || (!rel.startsWith("..") && rel !== "");
      })
    ) out.push(b);
  }
  return out;
}

export function fileMatches(
  path: string,
  include: string[],
  exclude: string[],
) {
  const inc = include.map((p) => globToRegExp(p));
  const exc = exclude.map((p) => globToRegExp(p));
  return inc.some((re) => re.test(path)) && !exc.some((re) => re.test(path));
}

export function basePaths(paths: string[]) {
  const bases = new Set<string>();
  for (const p of paths) {
    const dir = path.dirname(p);
    if (dir === "." || dir === "/") continue;
    bases.add(dir);
  }
  return Array.from(bases);
}
