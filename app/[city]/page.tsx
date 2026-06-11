import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityUrl, getCityBySlug } from "@/lib/cities";
import { BRAND_NAME } from "@/lib/config";
import { CityView } from "@/components/CityView";

/**
 * Path-based city pages: clickclickeat.com/{slug} (e.g. /philadelphia).
 * Used by cities without their own custom domain. Static routes (/about,
 * /local, /r, etc.) take precedence; unknown slugs 404.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "Not found" };
  const place = [city.name, city.state].filter(Boolean).join(", ");
  const base = cityUrl(city);
  return {
    title: { absolute: `${city.name} — ${BRAND_NAME}` },
    description: `Every kitchen in ${place} — who's open, who takes cards, and who you can order from direct.`,
    alternates: { canonical: base },
    openGraph: { title: `${city.name} — ${BRAND_NAME}`, url: base },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();
  return <CityView city={city} />;
}
