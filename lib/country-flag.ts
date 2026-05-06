/** ISO 3166-1 alpha-2 → regional-indicator flag emoji. */
export function countryFlagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode) return "🌍";
  const c = countryCode.trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "🌍";
  const base = 0x1f1e6;
  return String.fromCodePoint(base + (c.charCodeAt(0) - 65), base + (c.charCodeAt(1) - 65));
}
