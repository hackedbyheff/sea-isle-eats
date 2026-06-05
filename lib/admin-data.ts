import "server-only";
import type {
  ClaimWithRestaurant,
  Restaurant,
  SuggestionWithRestaurant,
} from "./types";
import { SAMPLE_RESTAURANTS } from "./sample-data";
import { SAMPLE_CLAIMS, SAMPLE_SUGGESTIONS } from "./sample-moderation";
import { createClient } from "./supabase/server";

export function isDemoMode(): boolean {
  return !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** All restaurants (published + not) for the admin queue. */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  if (isDemoMode()) return SAMPLE_RESTAURANTS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Restaurant[];
}

/** Pending suggestions + claims, each carrying the restaurant name. */
export async function getModerationQueue(): Promise<{
  suggestions: SuggestionWithRestaurant[];
  claims: ClaimWithRestaurant[];
}> {
  if (isDemoMode()) {
    return { suggestions: SAMPLE_SUGGESTIONS, claims: SAMPLE_CLAIMS };
  }
  const supabase = await createClient();

  const [sugRes, claimRes] = await Promise.all([
    supabase
      .from("suggestions")
      .select("*, restaurants(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("listing_claims")
      .select("*, restaurants(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  if (sugRes.error) throw sugRes.error;
  if (claimRes.error) throw claimRes.error;

  const flatten = <T extends { restaurants?: { name?: string } | null }>(rows: T[]) =>
    rows.map((r) => ({
      ...r,
      restaurant_name: r.restaurants?.name ?? "(unknown)",
    }));

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestions: flatten(sugRes.data as any[]) as SuggestionWithRestaurant[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    claims: flatten(claimRes.data as any[]) as ClaimWithRestaurant[],
  };
}
