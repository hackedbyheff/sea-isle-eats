import { BANNER_SPONSOR } from "@/lib/ads";
import { Badge } from "./Badge";

/**
 * Banner ad slot on the directory. Renders the active sponsor from lib/ads.ts,
 * or a placeholder when none is set. Placement is real either way.
 */
export function AdBanner() {
  const sponsor = BANNER_SPONSOR;

  if (!sponsor) {
    return (
      <div className="rounded-xl border border-dashed border-teal/50 bg-teal/[0.08] px-5 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-teal font-bold">
            Sponsored · ad slot
          </div>
          <div className="text-sm text-ink/70">
            Banner ad space — sold to a local business or service.
          </div>
        </div>
        <Badge tone="teal">Your ad here</Badge>
      </div>
    );
  }

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="block rounded-xl border border-teal/40 bg-teal/[0.08] px-5 py-3.5 transition-colors hover:bg-teal/[0.14]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-teal font-bold">
            Sponsored · {sponsor.category}
          </div>
          <div className="mt-0.5 font-display text-lg leading-tight">
            {sponsor.name}
          </div>
          <div className="text-sm text-ink/70">{sponsor.tagline}</div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-coral text-white px-4 py-2 text-sm font-semibold">
          {sponsor.cta} →
        </span>
      </div>
    </a>
  );
}
