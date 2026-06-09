import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Store, Utensils, Heart } from "lucide-react";
import { BRAND_NAME } from "@/lib/config";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { absolute: `Why we built it — ${BRAND_NAME}` },
  description:
    "Click your city. Click your spot. Eat. Click Click Eat connects you to local restaurants and sends you to order direct — no middleman fees, no commission skimmed from the kitchen.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-page text-ink">
      <header className="grain border-b-2 border-ink">
        <div className="mx-auto max-w-3xl px-5 pt-8 pb-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-coral"
          >
            <ArrowLeft size={16} /> {BRAND_NAME}
          </Link>
          <div className="mt-4 text-coral font-semibold tracking-[0.18em] uppercase text-xs">
            Find local · Order direct
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl leading-[1.02] font-semibold">
            Click your city. Click your spot. <span className="italic text-coral">Eat.</span>
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-8">
        <section>
          <h2 className="font-display text-2xl font-semibold">Why we built this</h2>
          <p className="mt-3 text-ink/80 leading-relaxed">
            Somewhere along the way, ordering dinner got complicated. A handful of apps
            wedged themselves between you and the restaurants you love — stacking fees
            on your order and taking a cut of every sale from the kitchen, often a hefty
            one. The place down the street ends up paying just to be found, and you end
            up paying extra to find it.
          </p>
          <p className="mt-3 text-ink/80 leading-relaxed">
            We thought the path from &ldquo;I&apos;m hungry&rdquo; to &ldquo;I&apos;m
            eating&rdquo; should be shorter — and the money should go to the people
            actually cooking your food. So we made it three clicks.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">How it works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", icon: MapPin, t: "Click your city", d: "Start where you are." },
              { n: "2", icon: Store, t: "Click the restaurant", d: "Browse local spots — not a wall of sponsored chains." },
              { n: "3", icon: Utensils, t: "Eat", d: "Order direct from the restaurant itself." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white border border-ink/10 p-5">
                <s.icon className="text-teal" size={20} />
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  Step {s.n}
                </div>
                <h3 className="font-display text-xl font-semibold leading-tight">{s.t}</h3>
                <p className="mt-1 text-sm text-ink/70">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-ink/80 leading-relaxed">
            That&apos;s it. We point you to the door and step aside — your order, your
            money, and your loyalty go straight to the restaurant, not a middleman.
          </p>
        </section>

        <section className="rounded-2xl bg-white border border-ink/10 p-6">
          <div className="flex items-center gap-2 text-coral font-semibold">
            <Heart size={18} fill="currentColor" /> What &ldquo;order direct&rdquo; means
          </div>
          <p className="mt-3 text-ink/80 leading-relaxed">
            When you find a spot on {BRAND_NAME}, we hand you off to their ordering page,
            their menu, their checkout. No surprise service charges layered on top. No
            commission skimmed off the restaurant&apos;s already-thin margin. Just you and
            the kitchen, the way it used to be.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Who it&apos;s for</h2>
          <ul className="mt-3 space-y-2 text-ink/80 leading-relaxed">
            <li>
              <strong>Locals</strong> who&apos;d rather their twenty bucks stay in the
              neighborhood than disappear into an app&apos;s fee structure.
            </li>
            <li>
              <strong>Restaurants</strong> tired of paying to be discovered and losing a
              slice of every order they earn.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-coral/30 bg-coral/[0.06] p-6">
          <h2 className="font-display text-2xl font-semibold">The honest mission</h2>
          <p className="mt-3 text-ink/80 leading-relaxed">
            We don&apos;t want to own the transaction. We want to make the connection —
            and then get out of the way.{" "}
            <strong className="text-ink">Find local, order direct.</strong>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
