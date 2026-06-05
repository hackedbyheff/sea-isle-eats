import type { Restaurant } from "./types";
import { SITE_URL } from "./config";
import { priceLabel } from "./format";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Build schema.org Restaurant JSON-LD for a listing. Rendered in a
 * <script type="application/ld+json"> on the detail page for SEO.
 */
export function restaurantJsonLd(r: Restaurant): Record<string, unknown> {
  const openingHours =
    r.hours?.flatMap((entry) =>
      entry.ranges.map((range) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[entry.day],
        opens: range[0],
        closes: range[1],
      })),
    ) ?? [];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    url: `${SITE_URL}/r/${r.id}`,
  };

  if (r.cuisine) jsonLd.servesCuisine = r.cuisine;
  if (r.phone) jsonLd.telephone = r.phone;
  if (r.price_level) jsonLd.priceRange = priceLabel(r.price_level);
  if (r.menu_url) jsonLd.hasMenu = r.menu_url;
  if (r.description) jsonLd.description = r.description;
  if (openingHours.length) jsonLd.openingHoursSpecification = openingHours;

  if (r.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: r.address,
      addressLocality: "Sea Isle City",
      addressRegion: "NJ",
      addressCountry: "US",
    };
  }

  if (r.lat != null && r.lng != null) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: r.lat,
      longitude: r.lng,
    };
  }

  return jsonLd;
}
