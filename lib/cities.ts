import "server-only";
import { headers } from "next/headers";
import type { City, Neighborhood } from "./types";
import { createClient } from "./supabase/server";
import { CITY_CUSTOM_DOMAIN, CITY_DOMAINS, PLATFORM_DOMAIN } from "./config";

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Demo-mode stand-in so the app works before Supabase has a cities row. */
const SAMPLE_CITY: City = {
  id: "sample-sea-isle",
  slug: "sea-isle-city",
  name: "Sea Isle City",
  state: "NJ",
  search_query: "restaurants in Sea Isle City NJ",
  zips: ["08243"],
  timezone: "America/New_York",
  lat: 39.1537,
  lng: -74.6929,
  active: true,
  created_at: "2026-01-01T00:00:00.000Z",
};

/**
 * Resolve which city a request is for, from its host:
 *  - a mapped custom domain (siceats.com → sea-isle-city)
 *  - a subdomain of the platform ({slug}.clickclickeat.com → slug)
 *  - otherwise null (bare platform domain / localhost / previews → city picker)
 * `override` (e.g. ?city=) wins, for local dev where subdomains aren't available.
 */
export function resolveCitySlug(
  host: string | null | undefined,
  override?: string | null,
): string | null {
  if (override) return override;
  if (!host) return null;
  const h = host.toLowerCase().split(":")[0];
  if (CITY_DOMAINS[h]) return CITY_DOMAINS[h];
  if (h.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const sub = h.slice(0, h.length - PLATFORM_DOMAIN.length - 1);
    if (sub && sub !== "www") return sub;
  }
  return null;
}

/**
 * Public URL for a city:
 *  - custom domain if one is mapped (e.g. siceats.com)
 *  - else the platform apex with a ?city= param (works today, no wildcard DNS)
 *
 * Once the wildcard *.clickclickeat.com is set up in Netlify, switch the else
 * branch back to `https://${city.slug}.${PLATFORM_DOMAIN}` for clean subdomains.
 */
export function cityUrl(city: City): string {
  const custom = CITY_CUSTOM_DOMAIN[city.slug];
  if (custom) return `https://${custom}`;
  return `https://${PLATFORM_DOMAIN}/?city=${city.slug}`;
}

export async function getActiveCities(): Promise<City[]> {
  if (!supabaseConfigured()) return [SAMPLE_CITY];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as City[]) ?? [];
  } catch {
    return [SAMPLE_CITY];
  }
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  if (!supabaseConfigured()) {
    return slug === SAMPLE_CITY.slug ? SAMPLE_CITY : null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as City | null) ?? null;
  } catch {
    return slug === SAMPLE_CITY.slug ? SAMPLE_CITY : null;
  }
}

/** Active neighborhoods for a city (empty for cities that don't use them). */
export async function getNeighborhoods(cityId: string): Promise<Neighborhood[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("city_id", cityId)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as Neighborhood[]) ?? [];
  } catch {
    return [];
  }
}

/** Resolve the current request's city (host + optional ?city override). */
export async function getCurrentCity(override?: string | null): Promise<City | null> {
  const h = await headers();
  const slug = resolveCitySlug(h.get("host"), override);
  if (!slug) return null;
  return getCityBySlug(slug);
}
