/**
 * Broad food-category seeder for a city — catches anything food-related
 * (ice cream, coffee, bakeries, delis, markets with food, etc.), not just
 * "restaurants". Runs many category searches, scopes to the city's zips,
 * dedupes, and upserts. Respects locked_fields (won't clobber human edits).
 * New rows are inserted PUBLISHED + unverified so they show but are flagged.
 *
 * Run: npx tsx scripts/seed-broad.ts sea-isle-city
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { City, Neighborhood } from "../lib/types";
import { getPlaceDetails, searchAllPlaceIds } from "../lib/google-places";
import { mapPlaceToColumns } from "../lib/google-sync";

try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apiKey = process.env.GOOGLE_PLACES_API_KEY!;
const slug = process.argv[2];
if (!url || !serviceKey || !apiKey) { console.error("Missing env."); process.exit(1); }
if (!slug) { console.error("Usage: npx tsx scripts/seed-broad.ts <city-slug>"); process.exit(1); }

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

// Keep only places Google classifies as food/drink (filters out City Hall,
// clothing stores, liquor stores, the beach, etc. that broad terms surface).
const FOOD_TYPES = new Set([
  "restaurant", "cafe", "coffee_shop", "bakery", "bar", "pub", "meal_takeaway",
  "meal_delivery", "ice_cream_shop", "dessert_shop", "donut_shop", "bagel_shop",
  "sandwich_shop", "fast_food_restaurant", "food", "food_court", "deli",
  "delicatessen", "juice_shop", "confectionery", "candy_store", "chocolate_shop",
  "brewery", "brewpub", "wine_bar", "grocery_store", "supermarket", "market",
  "food_store", "seafood_market", "bagel_shop", "diner", "breakfast_restaurant",
]);
function isFoodPlace(types?: string[]): boolean {
  if (!types) return false;
  return types.some((t) => t.endsWith("_restaurant") || FOOD_TYPES.has(t));
}

// Food-related categories — broad on purpose.
const CATEGORIES = [
  "restaurants", "ice cream", "water ice", "coffee", "cafe", "bakery", "donuts",
  "deli", "pizza", "breakfast", "bar", "seafood", "sandwiches", "hoagies",
  "market", "juice bar", "dessert", "takeout food",
];

(async () => {
  const city = (await sb.from("cities").select("*").eq("slug", slug).single()).data as City | null;
  if (!city) { console.error(`No city "${slug}".`); process.exit(1); }
  const zips: string[] = city.zips ?? [];

  // Neighborhood zip→id map (empty for cities without neighborhoods).
  const nbs = ((await sb.from("neighborhoods").select("*").eq("city_id", city.id)).data ?? []) as Neighborhood[];
  const zipToNb: Record<string, string> = {};
  // (neighborhoods don't carry zips in the table; this stays empty unless a
  //  city-specific seeder set it — broad seeder leaves neighborhood as-is.)

  const inScope = (addr: unknown) =>
    typeof addr === "string" && (zips.some((z) => addr.includes(z)) || addr.includes(city.name));

  const ids = new Set<string>();
  for (const cat of CATEGORIES) {
    try {
      const found = await searchAllPlaceIds(apiKey, `${cat} in ${city.name}${city.state ? `, ${city.state}` : ""}`);
      found.forEach((id) => ids.add(id));
      console.log(`  "${cat}" → ${found.length} (unique ${ids.size})`);
    } catch (e) {
      console.log(`  "${cat}" failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  const idArr = [...ids];
  const existing = new Map<string, { id: string; locked_fields: string[] }>();
  for (let i = 0; i < idArr.length; i += 200) {
    const { data } = await sb.from("restaurants").select("id, google_place_id, locked_fields").in("google_place_id", idArr.slice(i, i + 200));
    (data ?? []).forEach((r) => r.google_place_id && existing.set(r.google_place_id, { id: r.id, locked_fields: r.locked_fields ?? [] }));
  }

  let created = 0, updated = 0, skippedOut = 0, skippedNonFood = 0, errors = 0;
  const newNames: string[] = [];
  const zipRe = /\b(\d{5})(?:-\d{4})?\b/;
  for (const placeId of idArr) {
    try {
      const details = await getPlaceDetails(apiKey, placeId);
      if (!isFoodPlace(details.types)) { skippedNonFood++; continue; }
      const mapped = mapPlaceToColumns(details);
      if (!mapped.name || !inScope(mapped.address)) { if (mapped.name) skippedOut++; continue; }
      const zip = String(mapped.address ?? "").match(zipRe)?.[1];
      const neighborhood_id = zip ? zipToNb[zip] : undefined;
      const found = existing.get(placeId);
      if (!found) {
        const { error } = await sb.from("restaurants").insert({
          google_place_id: placeId, ...mapped,
          city_id: city.id, ...(neighborhood_id ? { neighborhood_id } : {}),
          status: "unverified", published: true,
        });
        if (error) throw error;
        created++; newNames.push(String(mapped.name));
      } else {
        const locked = new Set(found.locked_fields);
        const update: Record<string, unknown> = { city_id: city.id };
        for (const [k, v] of Object.entries(mapped)) if (!locked.has(k)) update[k] = v;
        const { error } = await sb.from("restaurants").update(update).eq("id", found.id);
        if (error) throw error;
        updated++;
      }
    } catch { errors++; }
  }

  console.log(`\nDone (${city.name}). created=${created} updated=${updated} skipped(out-of-zips)=${skippedOut} skipped(non-food)=${skippedNonFood} errors=${errors}`);
  if (newNames.length) { console.log("New (published, unverified):"); newNames.sort().forEach((n) => console.log("  + " + n)); }
})();
