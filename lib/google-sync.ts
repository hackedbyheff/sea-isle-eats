import type { SupabaseClient } from "@supabase/supabase-js";
import type { Hours, HoursRange } from "./types";
import { getPlaceDetails, searchAllPlaceIds, type PlaceDetails } from "./google-places";

export const SEARCH_QUERY = "restaurants in Sea Isle City NJ";

// Coverage scope: strict 08243 (Sea Isle City). Google's text search returns
// neighboring towns too, so we drop anything that isn't in the zip / city.
export const SCOPE_ZIP = "08243";
export const SCOPE_CITY = "Sea Isle City";

function inScope(address: unknown): boolean {
  if (typeof address !== "string") return false;
  return address.includes(SCOPE_ZIP) || address.includes(SCOPE_CITY);
}

export interface SyncResult {
  created: number;
  updated: number;
  /** Existing rows where at least one field was skipped because it was locked. */
  skippedLocked: number;
  /** Total individual field-writes prevented by locks. */
  lockedFieldsSkipped: number;
  /** Places dropped because they're outside the 08243 coverage scope. */
  skippedOutOfArea: number;
  errors: string[];
}

const pad = (n: number) => String(n).padStart(2, "0");

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const GENERIC_TYPES = new Set([
  "restaurant",
  "food",
  "point_of_interest",
  "establishment",
  "store",
  "premise",
]);

function humanize(s: string): string {
  return s
    .replace(/_restaurant$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function deriveCuisine(types?: string[]): string | null {
  if (!types) return null;
  const t = types.find((x) => !GENERIC_TYPES.has(x));
  return t ? humanize(t) || null : null;
}

/** regularOpeningHours.periods → our per-day `hours` jsonb. */
export function convertHours(details: PlaceDetails): Hours | null {
  const periods = details.regularOpeningHours?.periods;
  if (!periods || periods.length === 0) return null;

  const byDay: Record<number, HoursRange[]> = {};
  for (const p of periods) {
    if (!p.open || p.open.day == null) continue;
    const day = p.open.day;
    const openT = `${pad(p.open.hour ?? 0)}:${pad(p.open.minute ?? 0)}`;
    const closeT = p.close
      ? `${pad(p.close.hour ?? 0)}:${pad(p.close.minute ?? 0)}`
      : "23:59"; // open with no close ≈ all day
    (byDay[day] ??= []).push([openT, closeT]);
  }

  const hours: Hours = Object.entries(byDay)
    .map(([day, ranges]) => ({
      day: Number(day),
      ranges: ranges.sort((a, b) => a[0].localeCompare(b[0])),
    }))
    .sort((a, b) => a.day - b.day);

  return hours.length ? hours : null;
}

/**
 * Map a Place Details payload to our column set. Only includes keys we actually
 * got data for. Intentionally never sets menu_url / order_url / online_ordering
 * — Google doesn't supply those and they're left to humans.
 */
export function mapPlaceToColumns(details: PlaceDetails): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  const name = details.displayName?.text;
  if (name) out.name = name;
  if (details.formattedAddress) out.address = details.formattedAddress;
  if (details.location?.latitude != null) out.lat = details.location.latitude;
  if (details.location?.longitude != null) out.lng = details.location.longitude;
  if (details.nationalPhoneNumber) out.phone = details.nationalPhoneNumber;
  if (details.rating != null) out.rating = details.rating;

  if (details.priceLevel && PRICE_MAP[details.priceLevel] != null) {
    out.price_level = PRICE_MAP[details.priceLevel];
  }

  const hours = convertHours(details);
  if (hours) out.hours = hours;

  const pay = details.paymentOptions;
  if (pay) {
    if (pay.acceptsCreditCards != null) out.accepts_cards = pay.acceptsCreditCards;
    if (pay.acceptsCashOnly != null) out.accepts_cash = pay.acceptsCashOnly;
  }

  if (details.editorialSummary?.text) out.description = details.editorialSummary.text;

  const cuisine = deriveCuisine(details.types);
  if (cuisine) out.cuisine = cuisine;

  return out;
}

/**
 * Re-runnable sync. Text-searches, fetches details, and upserts on
 * google_place_id. Respects locked_fields: never overwrites a column whose name
 * is in that row's locked_fields. Uses a service-role client (bypasses RLS).
 */
export async function runGoogleSync(
  supabase: SupabaseClient,
  apiKey: string,
): Promise<SyncResult> {
  const result: SyncResult = {
    created: 0,
    updated: 0,
    skippedLocked: 0,
    lockedFieldsSkipped: 0,
    skippedOutOfArea: 0,
    errors: [],
  };

  const ids = await searchAllPlaceIds(apiKey, SEARCH_QUERY);
  if (ids.length === 0) return result;

  // Existing rows keyed by place id (for locked_fields + create/update split).
  const { data: existingRows, error: readErr } = await supabase
    .from("restaurants")
    .select("id, google_place_id, locked_fields")
    .in("google_place_id", ids);
  if (readErr) throw readErr;

  const existing = new Map<
    string,
    { id: string; locked_fields: string[] }
  >();
  for (const row of existingRows ?? []) {
    if (row.google_place_id) {
      existing.set(row.google_place_id, {
        id: row.id,
        locked_fields: row.locked_fields ?? [],
      });
    }
  }

  for (const placeId of ids) {
    try {
      const details = await getPlaceDetails(apiKey, placeId);
      const mapped = mapPlaceToColumns(details);
      if (!mapped.name) {
        result.errors.push(`Skipped ${placeId}: no name`);
        continue;
      }

      // Strict 08243 scope — drop neighboring-town results.
      if (!inScope(mapped.address)) {
        result.skippedOutOfArea++;
        continue;
      }

      const found = existing.get(placeId);

      if (!found) {
        // New listing — unverified + unpublished, awaiting a human pass.
        const { error } = await supabase.from("restaurants").insert({
          google_place_id: placeId,
          ...mapped,
          status: "unverified",
          published: false,
        });
        if (error) throw error;
        result.created++;
        continue;
      }

      // Existing — drop any locked columns from the update.
      const locked = new Set(found.locked_fields);
      const update: Record<string, unknown> = {};
      let skippedHere = 0;
      for (const [k, v] of Object.entries(mapped)) {
        if (locked.has(k)) {
          skippedHere++;
        } else {
          update[k] = v;
        }
      }
      if (skippedHere > 0) {
        result.skippedLocked++;
        result.lockedFieldsSkipped += skippedHere;
      }

      if (Object.keys(update).length > 0) {
        const { error } = await supabase
          .from("restaurants")
          .update(update)
          .eq("id", found.id);
        if (error) throw error;
        result.updated++;
      }
    } catch (e) {
      result.errors.push(
        `${placeId}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  return result;
}
