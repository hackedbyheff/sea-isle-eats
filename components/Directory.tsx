"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Neighborhood, Restaurant } from "@/lib/types";
import { getEasternNow, isLateNightOn, isOpenNow, type NowInET } from "@/lib/hours";
import { parseCuisines } from "@/lib/format";
import { GRID_AD_INTERVAL, GRID_AD_MAX, gridSponsorsForCity } from "@/lib/ads";
import { FilterChip } from "./FilterChip";
import { RestaurantCard } from "./RestaurantCard";
import { SponsorCard } from "./SponsorCard";
import { AdBanner } from "./AdBanner";

export function Directory({
  restaurants,
  citySlug,
  bannerSeed,
  neighborhoods = [],
}: {
  restaurants: Restaurant[];
  citySlug?: string | null;
  bannerSeed?: number;
  neighborhoods?: Neighborhood[];
}) {
  const gridSponsors = gridSponsorsForCity(citySlug);
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [openNow, setOpenNow] = useState(false);
  const [cardsOnly, setCardsOnly] = useState(false);
  const [cashOnly, setCashOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [lateNight, setLateNight] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [byobOnly, setByobOnly] = useState(false);
  const [beachOnly, setBeachOnly] = useState(false);
  const [neighborhood, setNeighborhood] = useState("all");

  // The "Beach delivery" filter only appears in cities where some spot offers it.
  const showBeach = restaurants.some((r) => r.beach_delivery === true);

  // "now" is anchored to America/New_York. Computed after mount to avoid a
  // server/client hydration mismatch on the open/closed state.
  const [now, setNow] = useState<NowInET | null>(null);
  useEffect(() => {
    setNow(getEasternNow());
    const id = setInterval(() => setNow(getEasternNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => parseCuisines(r.cuisine).forEach((c) => set.add(c)));
    return ["All", ...Array.from(set).sort()];
  }, [restaurants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = restaurants.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !(r.cuisine ?? "").toLowerCase().includes(q))
        return false;
      if (cuisine !== "All" && !parseCuisines(r.cuisine).includes(cuisine)) return false;
      if (cardsOnly && r.accepts_cards !== true) return false;
      if (cashOnly && r.accepts_cards !== false) return false;
      if (onlineOnly && !r.online_ordering) return false;
      if (deliveryOnly && r.delivery !== true) return false;
      if (byobOnly && r.byob !== true) return false;
      if (beachOnly && r.beach_delivery !== true) return false;
      if (neighborhood !== "all" && r.neighborhood_id !== neighborhood) return false;
      if (openNow && !(now && isOpenNow(r.hours, now))) return false;
      if (lateNight && !(now && isLateNightOn(r.hours, now.day))) return false;
      return true;
    });

    // Weighted "local favorites" score (Bayesian): blends star rating with how
    // many reviews back it up, so a 4.6 with 800 reviews beats a 5.0 with 4.
    const rated = base.filter((r) => r.rating != null);
    const C = rated.length
      ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length
      : 4.2;
    const M = 30; // review weight: below this, the score leans toward the mean
    const score = (r: Restaurant) => {
      const v = r.rating_count ?? 0;
      const R = r.rating ?? C;
      return (v / (v + M)) * R + (M / (v + M)) * C;
    };
    const isOpen = (r: Restaurant) => (now ? isOpenNow(r.hours, now) : false);

    // Rank by score within tiers (featured → open → closed).
    const ranked = [...base].sort((a, b) => {
      const feat = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (feat) return feat;
      if (now) {
        const open = (isOpen(b) ? 1 : 0) - (isOpen(a) ? 1 : 0);
        if (open) return open;
      }
      const s = score(b) - score(a);
      if (s) return s;
      return a.name.localeCompare(b.name);
    });

    // Cuisine variety: within a tier, avoid long runs of the same cuisine by
    // greedily picking the highest-ranked spot whose cuisine differs from the
    // previous one.
    const primary = (r: Restaurant) => (parseCuisines(r.cuisine)[0] ?? "").toLowerCase();
    const diversify = (items: Restaurant[]) => {
      const rem = [...items];
      const out: Restaurant[] = [];
      let last: string | null = null;
      while (rem.length) {
        let i = rem.findIndex((r) => primary(r) !== last);
        if (i < 0) i = 0;
        const [picked] = rem.splice(i, 1);
        out.push(picked);
        last = primary(picked);
      }
      return out;
    };

    const feat = ranked.filter((r) => r.featured);
    const rest = ranked.filter((r) => !r.featured);
    if (now) {
      return [
        ...diversify(feat),
        ...diversify(rest.filter(isOpen)),
        ...diversify(rest.filter((r) => !isOpen(r))),
      ];
    }
    return [...diversify(feat), ...diversify(rest)];
  }, [restaurants, query, cuisine, cardsOnly, cashOnly, onlineOnly, deliveryOnly, byobOnly, beachOnly, neighborhood, openNow, lateNight, now]);

  return (
    <>
      {/* Search */}
      <div className="mt-6 flex items-center gap-2 rounded-full bg-white border border-ink/15 px-4 py-3 max-w-md shadow-sm">
        <Search size={18} className="text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tacos, sushi, breakfast…"
          aria-label="Search restaurants"
          className="w-full bg-transparent outline-none text-ink placeholder-ink/35"
        />
        {query && (
          <X
            size={16}
            className="cursor-pointer text-ink/40"
            onClick={() => setQuery("")}
          />
        )}
      </div>

      {/* Filters: neighborhood (if any) · cuisine · attributes — labeled sections */}
      <div className="py-5 space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
            Cuisine
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <FilterChip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        </div>

        <hr className="border-ink/10" />

        {neighborhoods.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
              Neighborhood
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={neighborhood === "all"} onClick={() => setNeighborhood("all")}>
                All Neighborhoods
              </FilterChip>
              {neighborhoods.map((n) => (
                <FilterChip
                  key={n.id}
                  active={neighborhood === n.id}
                  onClick={() => setNeighborhood(n.id)}
                >
                  {n.name}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
            Good to Know
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={openNow} onClick={() => setOpenNow(!openNow)}>
              Open Now
            </FilterChip>
            <FilterChip active={cardsOnly} onClick={() => setCardsOnly(!cardsOnly)}>
              Takes Cards
            </FilterChip>
            <FilterChip active={cashOnly} onClick={() => setCashOnly(!cashOnly)}>
              Cash Only
            </FilterChip>
            <FilterChip active={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)}>
              Online Ordering
            </FilterChip>
            <FilterChip active={lateNight} onClick={() => setLateNight(!lateNight)}>
              Late Night
            </FilterChip>
            <FilterChip active={deliveryOnly} onClick={() => setDeliveryOnly(!deliveryOnly)}>
              Delivery
            </FilterChip>
            <FilterChip active={byobOnly} onClick={() => setByobOnly(!byobOnly)}>
              BYOB
            </FilterChip>
            {showBeach && (
              <FilterChip active={beachOnly} onClick={() => setBeachOnly(!beachOnly)}>
                Beach Delivery
              </FilterChip>
            )}
          </div>
        </div>
      </div>

      {/* Banner ad slot — sponsors for this city (rotates) */}
      <AdBanner citySlug={citySlug} seed={bannerSeed} />

      {/* Listings */}
      <div className="text-sm text-ink/50 mt-6 mb-3">
        {filtered.length} place{filtered.length !== 1 ? "s" : ""}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(() => {
          const out: React.ReactNode[] = [];
          let adIdx = 0;
          filtered.forEach((r, i) => {
            out.push(<RestaurantCard key={r.id} restaurant={r} now={now} />);
            const atInterval = (i + 1) % GRID_AD_INTERVAL === 0;
            if (
              gridSponsors.length &&
              atInterval &&
              adIdx < GRID_AD_MAX &&
              i + 1 < filtered.length
            ) {
              const biz = gridSponsors[adIdx % gridSponsors.length];
              adIdx++;
              out.push(<SponsorCard key={`ad-${i}`} business={biz} />);
            }
          });
          return out;
        })()}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-ink/40 font-display text-xl italic">
          Nothing matches those filters.
        </div>
      )}
    </>
  );
}
