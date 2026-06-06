"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { getEasternNow, isLateNightOn, isOpenNow, type NowInET } from "@/lib/hours";
import { parseCuisines } from "@/lib/format";
import { GRID_AD_INTERVAL, GRID_AD_MAX, GRID_SPONSORS } from "@/lib/ads";
import { FilterChip } from "./FilterChip";
import { RestaurantCard } from "./RestaurantCard";
import { SponsorCard } from "./SponsorCard";
import { AdBanner } from "./AdBanner";

export function Directory({ restaurants }: { restaurants: Restaurant[] }) {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [openNow, setOpenNow] = useState(false);
  const [cardsOnly, setCardsOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [lateNight, setLateNight] = useState(false);

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
    return restaurants
      .filter((r) => {
        if (q && !r.name.toLowerCase().includes(q) && !(r.cuisine ?? "").toLowerCase().includes(q))
          return false;
        if (cuisine !== "All" && !parseCuisines(r.cuisine).includes(cuisine)) return false;
        if (cardsOnly && r.accepts_cards !== true) return false;
        if (onlineOnly && !r.online_ordering) return false;
        if (openNow && !(now && isOpenNow(r.hours, now))) return false;
        if (lateNight && !(now && isLateNightOn(r.hours, now.day))) return false;
        return true;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [restaurants, query, cuisine, cardsOnly, onlineOnly, openNow, lateNight, now]);

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

      {/* Filters */}
      <div className="py-5 flex flex-wrap gap-2 items-center">
        {cuisines.map((c) => (
          <FilterChip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>
            {c}
          </FilterChip>
        ))}
        <span className="mx-1 h-5 w-px bg-ink/20" />
        <FilterChip active={openNow} onClick={() => setOpenNow(!openNow)}>
          Open Now
        </FilterChip>
        <FilterChip active={cardsOnly} onClick={() => setCardsOnly(!cardsOnly)}>
          Takes Cards
        </FilterChip>
        <FilterChip active={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)}>
          Online Ordering
        </FilterChip>
        <FilterChip active={lateNight} onClick={() => setLateNight(!lateNight)}>
          Late Night
        </FilterChip>
      </div>

      {/* Banner ad slot */}
      <AdBanner />

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
              GRID_SPONSORS.length &&
              atInterval &&
              adIdx < GRID_AD_MAX &&
              i + 1 < filtered.length
            ) {
              const biz = GRID_SPONSORS[adIdx % GRID_SPONSORS.length];
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
