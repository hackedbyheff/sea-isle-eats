import type { Metadata } from "next";
import { cityUrl, getActiveCities, getCurrentCity } from "@/lib/cities";
import { BRAND_NAME, PLATFORM_DOMAIN } from "@/lib/config";
import { CityView } from "@/components/CityView";
import { CityPicker } from "@/components/CityPicker";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const city = await getCurrentCity(typeof sp.city === "string" ? sp.city : null);
  if (!city) {
    return { alternates: { canonical: `https://${PLATFORM_DOMAIN}` } };
  }
  const place = [city.name, city.state].filter(Boolean).join(", ");
  const base = cityUrl(city);
  return {
    title: { absolute: `${city.name} — ${BRAND_NAME}` },
    description: `Every kitchen in ${place} — who's open, who takes cards, and who you can order from direct.`,
    alternates: { canonical: base },
    openGraph: { title: `${city.name} — ${BRAND_NAME}`, url: base },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const city = await getCurrentCity(typeof sp.city === "string" ? sp.city : null);

  // No city resolved (bare clickclickeat.com / unknown host) → city picker.
  if (!city) {
    const cities = await getActiveCities();
    return <CityPicker cities={cities} />;
  }

  return <CityView city={city} />;
}
