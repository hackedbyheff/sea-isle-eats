/** Site-wide constants. */

/** The parent product brand (shown as the wordmark on every city page). */
export const BRAND_NAME = "Click Click Eat";

/** Platform domain — cities live at {slug}.clickclickeat.com. */
export const PLATFORM_DOMAIN = "clickclickeat.com";

/** Custom domains mapped to a city slug (request host → city slug). */
export const CITY_DOMAINS: Record<string, string> = {
  "siceats.com": "sea-isle-city",
  "www.siceats.com": "sea-isle-city",
};

/** Reverse map: city slug → its canonical custom domain (for links). */
export const CITY_CUSTOM_DOMAIN: Record<string, string> = {
  "sea-isle-city": "siceats.com",
};

export const SITE_NAME = "Sea Isle Eats";
export const SITE_LOCATION = "Sea Isle City, NJ";

/** Canonical production URL (platform). */
export const SITE_URL = "https://siceats.com";

/** TODO: point this at the real repo before launch. */
export const GITHUB_REPO_URL = "https://github.com/hackedbyheff/sea-isle-eats";

/** Where advertising inquiries go (used on the /local "list your business" CTA). */
export const ADS_CONTACT_EMAIL = "chris@dlivrd.io";

/** The community guide disclaimer shown in the footer on every page. */
export const DISCLAIMER =
  "Click Click Eat is a community guide, not an ordering platform. We link to restaurants' own menus and ordering; we don't take orders or payments.";
