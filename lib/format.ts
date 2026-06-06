/** Display formatting helpers. */

/** price_level 1–4 → "$"…"$$$$". null/0 → "". */
export function priceLabel(level: number | null | undefined): string {
  if (!level || level < 1) return "";
  return "$".repeat(Math.min(level, 4));
}

/**
 * Cuisine is stored as a comma-separated list of tags (e.g. "Hot Dog, Pizza").
 * Parse it into trimmed, de-duped tags.
 */
export function parseCuisines(cuisine: string | null | undefined): string[] {
  if (!cuisine) return [];
  const seen = new Set<string>();
  for (const part of cuisine.split(",")) {
    const t = part.trim();
    if (t) seen.add(t);
  }
  return [...seen];
}
