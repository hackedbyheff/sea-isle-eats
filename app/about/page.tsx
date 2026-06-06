import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, Phone, Store } from "lucide-react";
import { SITE_LOCATION, SITE_NAME, GITHUB_REPO_URL } from "@/lib/config";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Why order direct",
  description:
    "Sea Isle Eats links straight to each restaurant's own menu and ordering. Here's why ordering direct or calling in is better for local kitchens than third-party delivery apps.",
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
            <ArrowLeft size={16} /> Sea Isle Eats
          </Link>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.02] font-semibold">
            Why we link <span className="italic text-coral">direct</span>
          </h1>
          <p className="mt-3 text-ink/70 text-lg font-light">
            {SITE_NAME} is a community guide to {SITE_LOCATION} — not an ordering
            platform. Here&apos;s what that means and why it matters.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-8">
        <section className="rounded-2xl bg-white border border-ink/10 p-6">
          <div className="flex items-center gap-2 text-coral font-semibold">
            <Heart size={18} fill="currentColor" /> Ordering direct keeps more with the kitchen
          </div>
          <p className="mt-3 text-ink/80 leading-relaxed">
            Third-party delivery apps like <strong>DoorDash</strong>,{" "}
            <strong>Uber Eats</strong>, and <strong>Grubhub</strong> can charge a
            restaurant <strong>as much as 30%</strong> of every order in commissions
            and fees. On thin restaurant margins, that&apos;s often the difference
            between a profitable order and a break-even one.
          </p>
          <p className="mt-3 text-ink/80 leading-relaxed">
            When you <strong>call the restaurant</strong> or order from{" "}
            <strong>their own website</strong>, far more of your money stays with the
            local business and the people who work there. Same food, same town —
            more of it goes where it should.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white border border-ink/10 p-5">
            <Phone className="text-teal" size={20} />
            <h2 className="mt-2 font-display text-xl font-semibold">Call it in</h2>
            <p className="mt-1 text-sm text-ink/70">
              The simplest way to order — zero fees to anyone. Every listing has the
              restaurant&apos;s real phone number.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-ink/10 p-5">
            <Store className="text-teal" size={20} />
            <h2 className="mt-2 font-display text-xl font-semibold">Order on their site</h2>
            <p className="mt-1 text-sm text-ink/70">
              When a place has its own online ordering, we link straight to it — never
              through a middleman that takes a cut.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-ink/10 p-6">
          <h2 className="font-display text-xl font-semibold">How this guide works</h2>
          <p className="mt-3 text-ink/80 leading-relaxed">
            We build listings from public information and verify the details — hours,
            payment, who takes online orders — with a human pass before publishing. We
            don&apos;t take orders or payments, and we don&apos;t host restaurants&apos;
            photos; we point you to their own menus and channels. See something wrong?
            Every listing has a <em>Suggest a change</em> form, and restaurant owners
            can claim their listing.
          </p>
          <p className="mt-3 text-ink/80 leading-relaxed">
            {SITE_NAME} is open source.{" "}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-coral hover:underline"
            >
              View the project on GitHub →
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
