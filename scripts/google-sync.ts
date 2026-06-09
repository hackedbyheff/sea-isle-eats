/**
 * Standalone Google Places sync — useful for the initial bulk seed and for
 * scheduled/seasonal refreshes (no browser, no serverless time limit).
 *
 * Run all active cities:  npx tsx scripts/google-sync.ts
 * Run one city:           npx tsx scripts/google-sync.ts sea-isle-city
 *
 * Reads .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * GOOGLE_PLACES_API_KEY). Uses the service-role key, so it bypasses RLS — run
 * it locally or in a trusted environment only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { City } from "../lib/types";
import { runGoogleSync, searchQueryFor } from "../lib/google-sync";

// Minimal .env.local loader (no extra dependency).
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // no .env.local — rely on the ambient environment
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!url || !serviceKey || !apiKey) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_PLACES_API_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slug = process.argv[2]; // optional city slug

(async () => {
  // Pick target cities: one (by slug) or all active.
  let q = supabase.from("cities").select("*").eq("active", true);
  if (slug) q = supabase.from("cities").select("*").eq("slug", slug);
  const { data, error } = await q.order("name");
  if (error) {
    console.error("Couldn't load cities:", error.message);
    process.exit(1);
  }
  const cities = (data as City[]) ?? [];
  if (!cities.length) {
    console.error(slug ? `No city with slug "${slug}".` : "No active cities.");
    process.exit(1);
  }

  for (const city of cities) {
    console.log(`\n=== ${city.name} — "${searchQueryFor(city)}" ===`);
    const result = await runGoogleSync(supabase, apiKey, city);
    console.log(`  created:        ${result.created}`);
    console.log(`  updated:        ${result.updated}`);
    console.log(`  skipped-locked: ${result.skippedLocked} rows (${result.lockedFieldsSkipped} fields)`);
    console.log(`  out-of-area:    ${result.skippedOutOfArea}`);
    if (result.errors.length) {
      console.log(`  errors (${result.errors.length}):`);
      result.errors.forEach((e) => console.log(`    - ${e}`));
    }
  }
})();
