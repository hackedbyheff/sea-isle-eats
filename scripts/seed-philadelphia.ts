/**
 * One-off seeder for Philadelphia: creates the city + neighborhoods, runs
 * per-neighborhood Google searches, scopes to Philly's zips, and assigns each
 * restaurant's neighborhood by its zip.
 *
 * Run: npx tsx scripts/seed-philadelphia.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getPlaceDetails, searchAllPlaceIds } from "../lib/google-places";
import { mapPlaceToColumns } from "../lib/google-sync";

// env
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
if (!url || !serviceKey || !apiKey) {
  console.error("Missing env (URL / SERVICE_ROLE / GOOGLE_PLACES_API_KEY).");
  process.exit(1);
}
const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

const NEIGHBORHOODS = [
  { slug: "center-city", name: "Center City & Old City", zips: ["19102", "19103", "19106", "19107"], searches: ["restaurants in Center City Philadelphia PA", "restaurants in Old City Philadelphia PA", "restaurants in Rittenhouse Square Philadelphia PA"] },
  { slug: "university-city", name: "University City", zips: ["19104"], searches: ["restaurants in University City Philadelphia PA"] },
  { slug: "north-philadelphia", name: "North Philadelphia", zips: ["19121", "19122", "19132", "19133", "19140"], searches: ["restaurants in North Philadelphia PA", "restaurants in Northern Liberties Philadelphia PA"] },
  { slug: "south-philadelphia", name: "South Philadelphia", zips: ["19145", "19146", "19147", "19148"], searches: ["restaurants in South Philadelphia PA", "restaurants in East Passyunk Philadelphia PA"] },
  { slug: "northeast-philadelphia", name: "Northeast Philadelphia", zips: ["19111", "19114", "19115", "19116", "19149", "19152"], searches: ["restaurants in Northeast Philadelphia PA"] },
  { slug: "northwest-philadelphia", name: "Northwest Philadelphia", zips: ["19127", "19128", "19129", "19144"], searches: ["restaurants in Manayunk Philadelphia PA", "restaurants in Germantown Philadelphia PA", "restaurants in Roxborough Philadelphia PA"] },
];
const ALL_ZIPS = NEIGHBORHOODS.flatMap((n) => n.zips);
const ZIP_TO_NB_SLUG: Record<string, string> = {};
NEIGHBORHOODS.forEach((n) => n.zips.forEach((z) => (ZIP_TO_NB_SLUG[z] = n.slug)));

(async () => {
  // 1) City (upsert by slug)
  await sb.from("cities").upsert(
    {
      slug: "philadelphia",
      name: "Philadelphia",
      state: "PA",
      search_query: "restaurants in Philadelphia PA",
      zips: ALL_ZIPS,
      timezone: "America/New_York",
      lat: 39.9526,
      lng: -75.1652,
      active: true,
    },
    { onConflict: "slug" },
  );
  const city = (await sb.from("cities").select("id").eq("slug", "philadelphia").single()).data!;
  console.log("Philadelphia city:", city.id);

  // 2) Neighborhoods (upsert by city_id+slug) → slug→id map
  const nbId: Record<string, string> = {};
  for (const n of NEIGHBORHOODS) {
    await sb.from("neighborhoods").upsert(
      { city_id: city.id, slug: n.slug, name: n.name, active: true },
      { onConflict: "city_id,slug" },
    );
    const row = (await sb.from("neighborhoods").select("id").eq("city_id", city.id).eq("slug", n.slug).single()).data!;
    nbId[n.slug] = row.id;
  }
  console.log("Neighborhoods:", Object.keys(nbId).join(", "));

  // 3) Collect place ids from all searches (deduped)
  const queries = [...new Set(NEIGHBORHOODS.flatMap((n) => n.searches).concat("best restaurants in Philadelphia PA"))];
  const ids = new Set<string>();
  for (const q of queries) {
    try {
      const found = await searchAllPlaceIds(apiKey, q);
      found.forEach((id) => ids.add(id));
      console.log(`  search "${q}" → ${found.length} (total unique ${ids.size})`);
    } catch (e) {
      console.log(`  search "${q}" failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  // existing rows for these place ids
  const idArr = [...ids];
  const existing = new Map<string, { id: string; locked_fields: string[] }>();
  for (let i = 0; i < idArr.length; i += 200) {
    const chunk = idArr.slice(i, i + 200);
    const { data } = await sb.from("restaurants").select("id, google_place_id, locked_fields").in("google_place_id", chunk);
    (data ?? []).forEach((r) => r.google_place_id && existing.set(r.google_place_id, { id: r.id, locked_fields: r.locked_fields ?? [] }));
  }

  let created = 0, updated = 0, skippedOut = 0, errors = 0;
  const zipRe = /\b(\d{5})(?:-\d{4})?\b/;
  for (const placeId of idArr) {
    try {
      const details = await getPlaceDetails(apiKey, placeId);
      const mapped = mapPlaceToColumns(details);
      if (!mapped.name) { errors++; continue; }
      const addr = String(mapped.address ?? "");
      const zip = addr.match(zipRe)?.[1];
      const nbSlug = zip ? ZIP_TO_NB_SLUG[zip] : undefined;
      if (!nbSlug) { skippedOut++; continue; } // not in our Philly zips → drop
      const neighborhood_id = nbId[nbSlug];

      const found = existing.get(placeId);
      if (!found) {
        const { error } = await sb.from("restaurants").insert({
          google_place_id: placeId, ...mapped,
          city_id: city.id, neighborhood_id, status: "unverified", published: false,
        });
        if (error) throw error;
        created++;
      } else {
        const locked = new Set(found.locked_fields);
        const update: Record<string, unknown> = { city_id: city.id, neighborhood_id };
        for (const [k, v] of Object.entries(mapped)) if (!locked.has(k)) update[k] = v;
        const { error } = await sb.from("restaurants").update(update).eq("id", found.id);
        if (error) throw error;
        updated++;
      }
    } catch {
      errors++;
    }
  }

  console.log(`\nDone. created=${created} updated=${updated} skipped(out-of-zips)=${skippedOut} errors=${errors}`);
})();
