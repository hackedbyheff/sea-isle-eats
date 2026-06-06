/**
 * Ad / sponsor slots. Ads are sold to non-restaurant local businesses
 * (rentals, realtors, shops, services). Everything here is data — edit this
 * file to add, remove, or reorder sponsors. No code changes needed elsewhere.
 */

export interface Sponsor {
  id: string;
  name: string;
  category: string; // shown as the "Sponsored · {category}" label
  tagline: string;
  url: string;
  /** Banner CTA label. Defaults to "Visit {name}". */
  cta?: string;
  phone?: string;
  address?: string;
  /** featured = eligible for in-grid placement on the directory + /local. */
  featured?: boolean;
  /** banner = include in the rotating banner (directory + restaurant pages). */
  banner?: boolean;
}

/** The single source of truth for all sponsors. */
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
  },
  {
    id: "burke-and-co",
    name: "Burke & Co.",
    category: "Real Estate · Rentals",
    tagline:
      "A better real estate experience at the Shore — Sea Isle City home sales & vacation rentals.",
    url: "https://johnburkeandco.com/",
    cta: "Browse listings",
    featured: true,
    banner: true,
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
  },
];

/** Banner rotation pool (directory + restaurant detail pages). */
export const BANNER_SPONSORS: Sponsor[] = SPONSORS.filter((s) => s.banner);

/** Featured sponsors eligible to appear as in-grid sponsored cards. */
export const GRID_SPONSORS: Sponsor[] = SPONSORS.filter((s) => s.featured);

/** Everything shows on the /local directory. */
export const LOCAL_BUSINESSES: Sponsor[] = SPONSORS;

/** Insert an in-grid sponsored card after every N restaurant cards. */
export const GRID_AD_INTERVAL = 8;

/** Never show more than this many in-grid sponsored cards. */
export const GRID_AD_MAX = 2;

/**
 * Pick a banner sponsor. With a `seed` (e.g. a restaurant id) the choice is
 * deterministic and evenly distributed — each restaurant page consistently
 * shows one sponsor, and the three split the pages ~evenly. Without a seed it's
 * random.
 */
/** Look up a specific sponsor by id (e.g. to pin the home banner). */
export function getSponsor(id: string): Sponsor | null {
  return SPONSORS.find((s) => s.id === id) ?? null;
}

export function pickBannerSponsor(seed?: string | number): Sponsor | null {
  const list = BANNER_SPONSORS;
  if (!list.length) return null;
  if (seed === undefined || seed === null) {
    return list[Math.floor(Math.random() * list.length)];
  }
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
