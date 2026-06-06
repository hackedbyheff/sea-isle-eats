/**
 * Ad / sponsor slots. Ads are sold to non-restaurant local businesses
 * (rentals, realtors, shops, services). Everything here is data — edit this
 * file to change sponsors. No code changes needed elsewhere.
 */

/** Banner sponsor (directory + restaurant detail pages). null → placeholder. */
export interface Sponsor {
  name: string;
  category: string;
  tagline: string;
  cta: string;
  url: string;
}

export const BANNER_SPONSOR: Sponsor | null = {
  name: "Verde Colab",
  category: "Coworking",
  tagline:
    "Professional workspace at the shore — day passes, desks & private offices on Landis Ave.",
  cta: "Visit Verde Colab",
  url: "https://us.verdecolab.com/sea-isle-city-coworking/",
};

/** A local business listing (the /local directory + in-grid sponsored cards). */
export interface LocalBusiness {
  id: string;
  name: string;
  category: string; // "Coworking", "Vacation Rentals", "Real Estate", …
  tagline: string;
  url: string;
  phone?: string;
  address?: string;
  /** featured = eligible for in-grid placement on the directory + top of /local. */
  featured?: boolean;
}

export const LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    id: "verde-colab",
    name: "Verde Colab",
    category: "Coworking",
    tagline:
      "Professional coworking at the shore — day passes, dedicated desks, private offices, and meeting rooms. Flexible by the day & season.",
    url: "https://us.verdecolab.com/sea-isle-city-coworking/",
    address: "3514 Landis Ave, Unit 102, Sea Isle City, NJ 08243",
    featured: true,
  },
];

/** Featured local businesses eligible to appear as in-grid sponsored cards. */
export const GRID_SPONSORS: LocalBusiness[] = LOCAL_BUSINESSES.filter(
  (b) => b.featured,
);

/** Insert an in-grid sponsored card after every N restaurant cards. */
export const GRID_AD_INTERVAL = 8;

/** Never show more than this many in-grid sponsored cards (avoids repetition). */
export const GRID_AD_MAX = 2;
