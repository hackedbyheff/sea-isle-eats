/**
 * Backfills rating + rating_count (review count) for every listing with a
 * google_place_id, using a minimal Place Details field mask (cheap). Respects
 * locked_fields (won't overwrite a human-locked rating). Run once after adding
 * the rating_count column; future syncs keep it fresh.
 *
 * Run: npx tsx scripts/backfill-ratings.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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
if (!url || !serviceKey || !apiKey) { console.error("Missing env."); process.exit(1); }
const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

async function lite(placeId: string) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "id,rating,userRatingCount" },
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return (await r.json()) as { rating?: number; userRatingCount?: number };
}

(async () => {
  const all: { id: string; google_place_id: string; locked_fields: string[] }[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await sb
      .from("restaurants")
      .select("id, google_place_id, locked_fields")
      .not("google_place_id", "is", null)
      .range(from, from + 999);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || !data.length) break;
    all.push(...(data as typeof all));
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Backfilling ${all.length} listings…`);

  let updated = 0, errors = 0;
  for (const r of all) {
    try {
      const d = await lite(r.google_place_id);
      const upd: Record<string, unknown> = { rating_count: d.userRatingCount ?? null };
      if (d.rating != null && !(r.locked_fields ?? []).includes("rating")) upd.rating = d.rating;
      const { error } = await sb.from("restaurants").update(upd).eq("id", r.id);
      if (error) throw error;
      updated++;
      if (updated % 50 === 0) console.log(`  ${updated}/${all.length}`);
    } catch {
      errors++;
    }
  }
  console.log(`Done. updated=${updated} errors=${errors}`);
})();
