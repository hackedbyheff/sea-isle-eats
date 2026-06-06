import Link from "next/link";
import { MapPin } from "lucide-react";
import { getPublishedRestaurants } from "@/lib/data";
import { SITE_LOCATION } from "@/lib/config";
import { Directory } from "@/components/Directory";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const { restaurants, usingSample } = await getPublishedRestaurants();

  return (
    <div className="min-h-screen w-full bg-page text-ink">
      {/* Header */}
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-5 pt-10 pb-7">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-coral font-semibold tracking-[0.2em] uppercase text-xs">
              <MapPin size={14} /> {SITE_LOCATION}
            </div>
            <Link
              href="/local"
              className="text-xs font-semibold uppercase tracking-wide text-ink/50 hover:text-coral"
            >
              Sponsors →
            </Link>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] font-semibold">
            Sea Isle <span className="italic text-coral">Eats</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink/70 text-lg font-light">
            Every kitchen on the island — hours, who takes cards, and who you can
            order from online. One page.
          </p>
        </div>
      </header>

      {/* Directory: search + filters + ad slot + grid (interactive) */}
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
