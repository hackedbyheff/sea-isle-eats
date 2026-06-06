import type { Sponsor } from "@/lib/ads";

/**
 * Native sponsored card slotted into the directory grid. Visually a sibling of
 * RestaurantCard but tinted teal and clearly labeled "Sponsored".
 */
export function SponsorCard({ business }: { business: Sponsor }) {
  return (
    <a
      href={business.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="relative block rounded-2xl bg-teal/[0.07] p-5 border border-teal/40 transition-shadow hover:shadow-lg"
    >
      <div className="absolute -top-2.5 left-5">
        <span className="inline-flex items-center rounded-full bg-teal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          Sponsored
        </span>
      </div>

      <div className="mt-1 text-[10px] uppercase tracking-widest text-teal font-bold">
        {business.category}
      </div>
      <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
        {business.name}
      </h3>
      <p className="mt-2 text-ink/75 text-[15px] font-light">{business.tagline}</p>

      <div className="mt-4 border-t border-teal/20 pt-3">
        <span className="text-sm font-semibold text-teal">
          Visit {business.name} →
        </span>
      </div>
    </a>
  );
}
