import type { Hours, HoursRange, Restaurant } from "./types";
import { SYNC_MANAGED_FIELDS } from "./sync-fields";

/**
 * Google Sheet <-> Supabase mapping for the VA workflow.
 *
 * The sheet has one row per restaurant. Hours are spread across 7 text columns
 * (one per day) like "11:00-22:00" or "11:00-14:00, 16:00-22:00"; blank = closed.
 * Editing a Google-managed field locks it (so the Places sync won't overwrite),
 * mirroring the admin behavior.
 */

const DAY_COLS = [
  "hours_sun",
  "hours_mon",
  "hours_tue",
  "hours_wed",
  "hours_thu",
  "hours_fri",
  "hours_sat",
] as const;

/** Column order the sheet uses (also the export header row). */
export const SHEET_COLUMNS = [
  "id", // key — do not edit
  "google_place_id", // key — do not edit
  "name",
  "cuisine",
  "price_level",
  "rating",
  "phone",
  "address",
  "accepts_cash",
  "accepts_cards",
  "online_ordering",
  "dine_in",
  "takeout",
  "delivery",
  "menu_url",
  "order_url",
  "website_url",
  "facebook_url",
  "instagram_url",
  "description",
  "notes",
  "status",
  "published",
  "owner_verified",
  ...DAY_COLS,
] as const;

type SheetRow = Record<string, string>;

const pad = (n: number) => String(n).padStart(2, "0");

function parseBool(v: string | undefined): boolean | null {
  if (v == null || v.trim() === "") return null;
  const t = v.trim().toLowerCase();
  if (["true", "yes", "y", "1", "x", "✓"].includes(t)) return true;
  if (["false", "no", "n", "0", ""].includes(t)) return false;
  return null;
}

/** "11:00-14:00, 16:00-22:00" -> [["11:00","14:00"],["16:00","22:00"]] */
function dayStringToRanges(s: string | undefined): HoursRange[] {
  if (!s || !s.trim()) return [];
  const out: HoursRange[] = [];
  for (const part of s.split(",")) {
    const m = part.trim().match(/^(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?$/);
    if (!m) continue;
    const a = `${pad(+m[1])}:${m[2] ?? "00"}`;
    const b = `${pad(+m[3])}:${m[4] ?? "00"}`;
    out.push([a, b]);
  }
  return out;
}

function rangesToDayString(ranges: HoursRange[]): string {
  return ranges.map((r) => `${r[0]}-${r[1]}`).join(", ");
}

/** Sheet row's 7 day columns -> hours jsonb (only days with ranges). */
export function sheetRowToHours(row: SheetRow): Hours {
  const hours: Hours = [];
  DAY_COLS.forEach((col, day) => {
    const ranges = dayStringToRanges(row[col]);
    if (ranges.length) hours.push({ day, ranges });
  });
  return hours;
}

/** A Restaurant -> a flat sheet row (strings). */
export function dbRowToSheetRow(r: Restaurant): SheetRow {
  const row: SheetRow = {
    id: r.id,
    google_place_id: r.google_place_id ?? "",
    name: r.name ?? "",
    cuisine: r.cuisine ?? "",
    price_level: r.price_level != null ? String(r.price_level) : "",
    rating: r.rating != null ? String(r.rating) : "",
    phone: r.phone ?? "",
    address: r.address ?? "",
    accepts_cash: r.accepts_cash == null ? "" : String(r.accepts_cash).toUpperCase(),
    accepts_cards: r.accepts_cards == null ? "" : String(r.accepts_cards).toUpperCase(),
    online_ordering: String(!!r.online_ordering).toUpperCase(),
    dine_in: r.dine_in == null ? "" : String(r.dine_in).toUpperCase(),
    takeout: r.takeout == null ? "" : String(r.takeout).toUpperCase(),
    delivery: r.delivery == null ? "" : String(r.delivery).toUpperCase(),
    menu_url: r.menu_url ?? "",
    order_url: r.order_url ?? "",
    website_url: r.website_url ?? "",
    facebook_url: r.facebook_url ?? "",
    instagram_url: r.instagram_url ?? "",
    description: r.description ?? "",
    notes: r.notes ?? "",
    status: r.status,
    published: String(!!r.published).toUpperCase(),
    owner_verified: String(!!r.owner_verified).toUpperCase(),
  };
  DAY_COLS.forEach((col, day) => {
    const entry = r.hours?.find((h) => h.day === day);
    row[col] = entry ? rangesToDayString(entry.ranges) : "";
  });
  return row;
}

function emptyToNull(v: string | undefined): string | null {
  return v == null || v.trim() === "" ? null : v.trim();
}

/**
 * Build the DB update from an edited sheet row, comparing to the current DB row
 * to decide which Google-managed fields to lock. Returns the update payload and
 * the merged locked_fields. Returns null if the row has no usable id.
 */
export function buildUpdateFromSheetRow(
  row: SheetRow,
  current: Restaurant,
): { update: Record<string, unknown>; locked_fields: string[] } | null {
  if (!row.id) return null;

  const update: Record<string, unknown> = {};
  // Only set name if non-blank (never wipe a name to empty).
  if (row.name?.trim()) update.name = row.name.trim();
  update.cuisine = emptyToNull(row.cuisine);
  update.price_level = row.price_level?.trim() ? parseInt(row.price_level, 10) : null;
  update.rating = row.rating?.trim() ? parseFloat(row.rating) : null;
  update.phone = emptyToNull(row.phone);
  update.address = emptyToNull(row.address);
  update.accepts_cash = parseBool(row.accepts_cash);
  update.accepts_cards = parseBool(row.accepts_cards);
  update.online_ordering = parseBool(row.online_ordering) ?? false;
  update.dine_in = parseBool(row.dine_in);
  update.takeout = parseBool(row.takeout);
  update.delivery = parseBool(row.delivery);
  update.menu_url = emptyToNull(row.menu_url);
  update.order_url = emptyToNull(row.order_url);
  update.website_url = emptyToNull(row.website_url);
  update.facebook_url = emptyToNull(row.facebook_url);
  update.instagram_url = emptyToNull(row.instagram_url);
  update.description = emptyToNull(row.description);
  update.notes = emptyToNull(row.notes);
  if (["unverified", "needs_call", "verified"].includes(row.status?.trim())) {
    update.status = row.status.trim();
  }
  update.published = parseBool(row.published) ?? false;
  update.owner_verified = parseBool(row.owner_verified) ?? false;
  update.hours = sheetRowToHours(row);

  // Lock any Google-managed field whose value changed vs the DB.
  const locked = new Set(current.locked_fields ?? []);
  for (const field of SYNC_MANAGED_FIELDS) {
    if (!(field in update)) continue;
    const before = JSON.stringify((current as unknown as Record<string, unknown>)[field] ?? null);
    const after = JSON.stringify(update[field] ?? null);
    if (before !== after) locked.add(field);
  }

  return { update, locked_fields: [...locked] };
}
