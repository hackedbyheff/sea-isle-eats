/**
 * Ad / sponsors. Edit this one file to place sponsors:
 *   - national: true        → shows in every city
 *   - cities: ['nashville'] → shows only in those city slugs
 * A sponsor with neither shows nowhere (handy for drafts).
 *
 * Ads are sold to non-restaurant local businesses (rentals, realtors, shops,
 * services). `banner` = eligible for the rotating banner; `featured` = eligible
 * for the in-grid sponsored card + the Sponsors page.
 */

export interface Sponsor {
  id: string;
  name: string;
  category: string;
  tagline: string;
  url: string;
  cta?: string;
  phone?: string;
  address?: string;
  featured?: boolean;
  banner?: boolean;
  /** Placement: national (all cities) and/or specific city slugs. */
  national?: boolean;
  cities?: string[];
}

export const SPONSORS: Sponsor[] = [
  {
    id: "verde-colab",
    name: "Verde Colab",
    category: "Coworking",
    tagline:
      "Coworking at the shore — day passes, dedicated desks & private offices on Landis Ave.",
    url: "https://us.verdecolab.com/sea-isle-city-coworking/",
    cta: "Visit Verde Colab",
    address: "3514 Landis Ave, Unit 102, Sea Isle City, NJ 08243",
    featured: true,
    banner: true,
    cities: ["sea-isle-city"],
  },
  {
    id: "burke-and-co",
    name: "Burke & Co.",
    category: "Real Estate · Rentals",
    tagline:
      "A better real estate experience at the Shore — home sales & vacation rentals.",
    url: "https://johnburkeandco.com/",
    cta: "Browse listings",
    featured: true,
    banner: true,
    cities: ["sea-isle-city"],
  },
  {
    id: "land-and-sea-furniture",
    name: "Land and Sea Furniture",
    category: "Home & Furniture",
    tagline:
      "Quality indoor & outdoor furniture for your shore house — teak, poly, wicker & handcrafted pieces.",
    url: "https://landandseafurniture.com/",
    cta: "Shop furniture",
    featured: true,
    banner: true,
    cities: ["sea-isle-city"],
  },
];

/** Insert an in-grid sponsored card after every N restaurant cards. */
export const GRID_AD_INTERVAL = 8;
/** Never show more than this many in-grid sponsored cards. */
export const GRID_AD_MAX = 2;

/** Sponsors that should appear in a given city (national + that city's locals). */
export function sponsorsForCity(citySlug?: string | null): Sponsor[] {
  return SPONSORS.filter(
    (s) => s.national || (citySlug ? s.cities?.includes(citySlug) : false),
  );
}

export function bannerSponsorsForCity(citySlug?: string | null): Sponsor[] {
  return sponsorsForCity(citySlug).filter((s) => s.banner);
}

export function gridSponsorsForCity(citySlug?: string | null): Sponsor[] {
  return sponsorsForCity(citySlug).filter((s) => s.featured);
}

/**
 * Pick a banner sponsor for a city. With a `seed` (e.g. a restaurant id) the
 * choice is deterministic + evenly distributed; without one it's random.
 */
export function pickBannerSponsor(
  citySlug?: string | null,
  seed?: string | number,
): Sponsor | null {
  const list = bannerSponsorsForCity(citySlug);
  if (!list.length) return null;
  if (seed === undefined || seed === null) {
    return list[Math.floor(Math.random() * list.length)];
  }
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
