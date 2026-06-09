"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export interface GeoCity {
  name: string;
  state: string | null;
  lat: number | null;
  lng: number | null;
  url: string;
}

function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3959; // miles
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Suggests the visitor's closest city, using approximate IP geolocation (no
 * permission prompt). Renders nothing if it can't tell or there are no cities
 * with coordinates.
 */
export function NearestCity({ cities }: { cities: GeoCity[] }) {
  const [nearest, setNearest] = useState<GeoCity | null>(null);

  useEffect(() => {
    const withCoords = cities.filter((c) => c.lat != null && c.lng != null);
    if (!withCoords.length) return;
    let cancelled = false;

    fetch("https://ipwho.is/")
      .then((r) => r.json())
      .then((d: { latitude?: number; longitude?: number }) => {
        if (cancelled || typeof d.latitude !== "number" || typeof d.longitude !== "number")
          return;
        let best: GeoCity | null = null;
        let bestDist = Infinity;
        for (const c of withCoords) {
          const dist = distanceMiles(d.latitude, d.longitude, c.lat!, c.lng!);
          if (dist < bestDist) {
            bestDist = dist;
            best = c;
          }
        }
        if (best) setNearest(best);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cities]);

  if (!nearest) return null;

  return (
    <a
      href={nearest.url}
      className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-coral/40 bg-coral/[0.06] px-4 py-3 transition-colors hover:bg-coral/[0.12]"
    >
      <span className="flex items-center gap-2 text-ink">
        <MapPin size={18} className="text-coral shrink-0" />
        <span>
          Closest to you:{" "}
          <strong className="font-semibold">
            {nearest.name}
            {nearest.state ? `, ${nearest.state}` : ""}
          </strong>
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-coral">View guide →</span>
    </a>
  );
}
