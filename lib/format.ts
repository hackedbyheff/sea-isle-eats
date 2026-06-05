/** Display formatting helpers. */

/** price_level 1–4 → "$"…"$$$$". null/0 → "". */
export function priceLabel(level: number | null | undefined): string {
  if (!level || level < 1) return "";
  return "$".repeat(Math.min(level, 4));
}
