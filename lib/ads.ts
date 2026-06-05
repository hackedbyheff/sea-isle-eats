/**
 * Ad / sponsor slots. Ads are sold to non-restaurant local businesses
 * (rentals, realtors, shops, services). Edit this file to change who's
 * featured. Set BANNER_SPONSOR to null to fall back to the "Your ad here"
 * placeholder.
 */

export interface Sponsor {
  name: string;
  category: string; // shown in the "Sponsored · {category}" label
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
