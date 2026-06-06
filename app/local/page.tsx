import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, ArrowLeft } from "lucide-react";
import { LOCAL_BUSINESSES } from "@/lib/ads";
import { ADS_CONTACT_EMAIL, SITE_LOCATION } from "@/lib/config";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "The local businesses that support Sea Isle Eats — coworking, rentals, realtors, shops & services worth knowing in Sea Isle City.",
  alternates: { canonical: "/local" },
};

export default function LocalPage() {
  return (
    <div className="min-h-screen w-full bg-page text-ink">
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-5 pt-8 pb-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-coral"
          >
            <ArrowLeft size={16} /> Sea Isle Eats
          </Link>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl leading-[0.95] font-semibold">
            Our <span className="italic text-coral">Sponsors</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink/70 text-lg font-light">
            The local businesses that support Sea Isle Eats — the coworking, rentals,
            shops, and services that help keep this guide free for {SITE_LOCATION}.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {LOCAL_BUSINESSES.map((b) => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="block rounded-2xl bg-white border border-ink/10 p-5 transition-shadow hover:shadow-lg"
            >
              <div className="text-[10px] uppercase tracking-widest text-teal font-bold">
                {b.category}
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">
                {b.name}
              </h2>
              <p className="mt-2 text-ink/75 text-[15px] font-light">{b.tagline}</p>
              <div className="mt-3 space-y-1 text-sm text-ink/60">
                {b.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 shrink-0" /> {b.address}
                  </div>
                )}
                {b.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} /> {b.phone}
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-ink/10 pt-3 text-sm font-semibold text-coral">
                Visit {b.name} →
              </div>
            </a>
          ))}

          {/* List-your-business CTA (sells inventory) */}
          <a
            href={`mailto:${ADS_CONTACT_EMAIL}?subject=Advertising on Sea Isle Eats`}
            className="flex flex-col justify-center rounded-2xl border border-dashed border-teal/50 bg-teal/[0.06] p-5 text-center transition-colors hover:bg-teal/[0.12]"
          >
            <div className="text-[10px] uppercase tracking-widest text-teal font-bold">
              Advertise
            </div>
            <div className="mt-1 font-display text-xl font-semibold">
              List your business here
            </div>
            <p className="mt-1 text-sm text-ink/60">
              Reach everyone planning a trip to {SITE_LOCATION}. Get in touch →
            </p>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
