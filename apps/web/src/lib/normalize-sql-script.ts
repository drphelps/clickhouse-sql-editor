const UTF8_BOM_PREFIX = /^\uFEFF/;

export function normalizeSqlScriptText(script: string): string {
  return script
    .replace(UTF8_BOM_PREFIX, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}
