import { MapPin } from "lucide-react";
import type { City } from "@/lib/types";
import { cityUrl } from "@/lib/cities";
import { Footer } from "./Footer";

/**
 * Landing page shown at the bare platform domain (clickclickeat.com) or any
 * host that doesn't resolve to a city. Lets visitors pick a market.
 */
export function CityPicker({ cities }: { cities: City[] }) {
  return (
    <div className="min-h-screen w-full bg-page text-ink">
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-3xl px-5 pt-12 pb-9">
          <div className="text-coral font-semibold tracking-[0.2em] uppercase text-xs mb-2">
            Find local · Order direct
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] font-semibold">
            Click Click <span className="italic text-coral">Eat</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink/70 text-lg font-light">
            Local dining guides — who&apos;s open, who takes cards, and where to
            order direct from the restaurant. Pick your town.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-3">
          Pick your city
        </h2>
        {cities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-ink/40">
            More cities coming soon.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cities.map((c) => (
              <a
                key={c.id}
                href={cityUrl(c)}
                className="flex items-center gap-2 rounded-2xl bg-white border border-ink/10 p-5 transition-shadow hover:shadow-lg"
              >
                <MapPin size={18} className="text-coral shrink-0" />
                <span>
                  <span className="font-display text-2xl font-semibold leading-tight">
                    {c.name}
                  </span>
                  {c.state && (
                    <span className="ml-2 text-ink/50 text-sm">{c.state}</span>
                  )}
                </span>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
