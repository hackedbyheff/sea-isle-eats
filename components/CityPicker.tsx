import Link from "next/link";
import { MapPin, Store, Utensils } from "lucide-react";
import type { City } from "@/lib/types";
import { cityUrl } from "@/lib/cities";
import { Footer } from "./Footer";
import { NearestCity } from "./NearestCity";

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
            Click your city. Click your spot. Eat. Local dining guides that send
            you straight to the restaurant — find local, order direct.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <NearestCity
          cities={cities.map((c) => ({
            name: c.name,
            state: c.state,
            lat: c.lat,
            lng: c.lng,
            url: cityUrl(c),
          }))}
        />
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

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-3">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", icon: MapPin, t: "Click your city", d: "Start where you are." },
              { n: "2", icon: Store, t: "Click the restaurant", d: "Local spots, not sponsored chains." },
              { n: "3", icon: Utensils, t: "Eat", d: "Order direct from the restaurant." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white border border-ink/10 p-5">
                <s.icon className="text-teal" size={20} />
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight">
                  {s.t}
                </h3>
                <p className="mt-1 text-sm text-ink/70">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink/60">
            No middleman fees, no commission skimmed from the kitchen — we point you
            to the door and step aside.{" "}
            <Link href="/about" className="font-semibold text-coral hover:underline">
              Why we built this →
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
