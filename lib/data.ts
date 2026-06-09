import "server-only";
import type { City, Restaurant } from "./types";
import { SAMPLE_RESTAURANTS } from "./sample-data";
import { createClient } from "./supabase/server";

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Sample rows the public site would see: published only, featured first. */
function samplePublished(): Restaurant[] {
  return SAMPLE_RESTAURANTS.filter((r) => r.published).sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name),
  );
}

/**
 * Fetch published restaurants for the public directory.
 *
 * Falls back to SAMPLE_RESTAURANTS when Supabase isn't configured yet or there
 * are no published rows, so the UI is fully verifiable before go-live. Once you
 * add env keys and publish real rows, those take over automatically.
 */
export async function getPublishedRestaurants(city?: City): Promise<{
  restaurants: Restaurant[];
  usingSample: boolean;
}> {
  if (!supabaseConfigured()) {
    return { restaurants: samplePublished(), usingSample: true };
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("restaurants").select("*").eq("published", true);
    if (city) query = query.eq("city_id", city.id); // scope to this market
    const { data, error } = await query
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;
    // Configured DB is the source of truth — an empty city shows an empty list,
    // not sample data. (Sample fallback is only for the not-configured case.)
    return { restaurants: (data as Restaurant[]) ?? [], usingSample: false };
  } catch {
    return { restaurants: samplePublished(), usingSample: true };
  }
}

/**
 * Fetch a single published restaurant for the public detail page.
 * Returns null if not found (caller should render notFound()).
 */
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  if (!supabaseConfigured()) {
    return SAMPLE_RESTAURANTS.find((r) => r.id === id && r.published) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    return (data as Restaurant | null) ?? null;
  } catch {
    return SAMPLE_RESTAURANTS.find((r) => r.id === id && r.published) ?? null;
  }
}
