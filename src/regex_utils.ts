export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function unescapeRegex(s: string): string {
  return s.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}
