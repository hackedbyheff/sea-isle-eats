import Link from "next/link";
import { MapPin } from "lucide-react";
import { getPublishedRestaurants } from "@/lib/data";
import { getActiveCities, getCurrentCity } from "@/lib/cities";
import { BRAND_NAME } from "@/lib/config";
import { Directory } from "@/components/Directory";
import { CityPicker } from "@/components/CityPicker";
import { Footer } from "@/components/Footer";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const override = typeof sp.city === "string" ? sp.city : null;
  const city = await getCurrentCity(override);

  // No city resolved (bare clickclickeat.com / unknown host) → city picker.
  if (!city) {
    const cities = await getActiveCities();
    return <CityPicker cities={cities} />;
  }

  const { restaurants, usingSample } = await getPublishedRestaurants(city);
  const place = [city.name, city.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen w-full bg-page text-ink">
      {/* Header — Click Click Eat wordmark, city featured */}
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-5 pt-8 pb-7">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Link
              href="/"
              className="font-display text-lg font-semibold text-coral leading-none"
            >
              {BRAND_NAME}
            </Link>
            <Link
              href="/local"
              className="text-xs font-semibold uppercase tracking-wide text-ink/50 hover:text-coral"
            >
              Sponsors →
            </Link>
          </div>
          <div className="flex items-center gap-2 text-coral font-semibold tracking-[0.2em] uppercase text-xs mb-1">
            <MapPin size={14} /> {place}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] font-semibold">
            {city.name}
          </h1>
          <p className="mt-3 max-w-xl text-ink/70 text-lg font-light">
            Every kitchen in {city.name} — who&apos;s open, who takes cards, and
            who you can order from direct.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-6">
        {usingSample && (
          <div className="mt-5 rounded-lg border border-coral/40 bg-coral/[0.06] px-4 py-2 text-xs text-ink/70">
            Showing <strong>sample data</strong> — connect Supabase and publish
            listings to see live data here.
          </div>
        )}
        <Directory restaurants={restaurants} bannerSponsorId="verde-colab" />
      </main>

      <Footer />
    </div>
  );
}
