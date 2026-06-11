import Link from "next/link";
import { MapPin } from "lucide-react";
import type { City } from "@/lib/types";
import { getPublishedRestaurants } from "@/lib/data";
import { getNeighborhoods } from "@/lib/cities";
import { BRAND_NAME, PLATFORM_DOMAIN } from "@/lib/config";
import { Directory } from "./Directory";
import { Footer } from "./Footer";

/** A city's full directory page (header + filters + grid). Shared by the home
 *  page (host-resolved city) and the /[city] path route. */
export async function CityView({ city }: { city: City }) {
  const { restaurants, usingSample } = await getPublishedRestaurants(city);
  const neighborhoods = await getNeighborhoods(city.id);
  const place = [city.name, city.state].filter(Boolean).join(", ");
  const bannerSeed = Math.floor(Math.random() * 100000);

  return (
    <div className="min-h-screen w-full bg-page text-ink">
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-5 pt-8 pb-7">
          <div className="flex items-center justify-between gap-2 mb-2">
            <a
              href={`https://${PLATFORM_DOMAIN}`}
              className="text-xs font-semibold uppercase tracking-wide text-ink/50 hover:text-coral"
            >
              ← All cities
            </a>
            <Link
              href="/local"
              className="text-xs font-semibold uppercase tracking-wide text-ink/50 hover:text-coral"
            >
              Sponsors →
            </Link>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] font-semibold text-coral">
            {BRAND_NAME}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-coral font-semibold tracking-[0.18em] uppercase text-sm sm:text-base">
            <MapPin size={17} /> {place}
          </div>
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
        <Directory
          restaurants={restaurants}
          citySlug={city.slug}
          bannerSeed={bannerSeed}
          neighborhoods={neighborhoods}
        />
      </main>

      <Footer />
    </div>
  );
}
