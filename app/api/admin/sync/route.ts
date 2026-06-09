import { NextResponse } from "next/server";
import type { City } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runGoogleSync, type SyncResult } from "@/lib/google-sync";
import { getActiveCities, getCityBySlug, getCurrentCity } from "@/lib/cities";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/sync — guarded to authenticated admins. Syncs the current
 * host's city (or ?city=<slug>); if neither resolves, syncs all active cities.
 */
export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Supabase isn't configured." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY isn't set." }, { status: 400 });
  }

  // Which city/cities to sync?
  const slug = new URL(request.url).searchParams.get("city");
  let cities: City[];
  if (slug) {
    const c = await getCityBySlug(slug);
    cities = c ? [c] : [];
  } else {
    const current = await getCurrentCity();
    cities = current ? [current] : await getActiveCities();
  }
  if (!cities.length) {
    return NextResponse.json({ error: "No matching city." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    // Aggregate totals across the synced cities (keeps the button's report shape).
    const totals: SyncResult = {
      created: 0,
      updated: 0,
      skippedLocked: 0,
      lockedFieldsSkipped: 0,
      skippedOutOfArea: 0,
      errors: [],
    };
    for (const city of cities) {
      const r = await runGoogleSync(admin, apiKey, city);
      totals.created += r.created;
      totals.updated += r.updated;
      totals.skippedLocked += r.skippedLocked;
      totals.lockedFieldsSkipped += r.lockedFieldsSkipped;
      totals.skippedOutOfArea += r.skippedOutOfArea;
      totals.errors.push(...r.errors);
    }
    return NextResponse.json({ ...totals, cities: cities.map((c) => c.slug) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed." },
      { status: 500 },
    );
  }
}
