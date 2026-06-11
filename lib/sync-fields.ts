/**
 * Columns the Google Places sync can write. These are the only fields that get
 * "locked" when a human edits them in admin — locking them tells the sync to
 * skip them. menu_url / order_url / online_ordering are intentionally absent:
 * Google doesn't supply them, so the sync never touches them and there's
 * nothing to protect.
 */
export const SYNC_MANAGED_FIELDS = [
  "name",
  "cuisine",
  "price_level",
  "rating",
  "phone",
  "address",
  "hours",
  "accepts_cards",
  "accepts_cash",
  "dine_in",
  "takeout",
  "delivery",
  "description",
] as const;

export type SyncManagedField = (typeof SYNC_MANAGED_FIELDS)[number];

export function isSyncManaged(field: string): field is SyncManagedField {
  return (SYNC_MANAGED_FIELDS as readonly string[]).includes(field);
}

/** Coerce a text suggested_value into the right type for its column. */
export function coerceFieldValue(field: string, value: string): unknown {
  switch (field) {
    case "price_level":
      return Number.parseInt(value, 10);
    case "rating":
      return Number.parseFloat(value);
    case "accepts_cards":
    case "accepts_cash":
    case "online_ordering":
    case "dine_in":
    case "takeout":
    case "delivery":
    case "beach_delivery":
    case "published":
    case "featured":
      return value === "true" || value === "1" || value.toLowerCase() === "yes";
    case "hours":
      return JSON.parse(value); // may throw — caller handles
    default:
      return value;
  }
}
