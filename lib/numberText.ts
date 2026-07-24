// Strip leading zeros from typed number text ("05" -> "5") while
// leaving decimals like "0.5" intact.
export function cleanNumberText(raw: string): string {
  return raw.replace(/^0+(?=\d)/, "");
}
