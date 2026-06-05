"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { Hours } from "@/lib/types";
import {
  dayLabel,
  formatRange,
  getEasternNow,
  isOpenNow,
  type NowInET,
} from "@/lib/hours";

export function RestaurantHours({ hours }: { hours: Hours | null }) {
  // Anchored to America/New_York, computed after mount (no hydration mismatch).
  const [now, setNow] = useState<NowInET | null>(null);
  useEffect(() => {
    setNow(getEasternNow());
    const id = setInterval(() => setNow(getEasternNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  const open = now ? isOpenNow(hours, now) : null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Clock size={16} className={open ? "text-teal" : "text-ink/40"} />
        <span
          className={`font-semibold ${open ? "text-teal" : "text-ink/50"}`}
        >
          {open === null ? "Hours" : open ? "Open now" : "Closed now"}
        </span>
      </div>

      <table className="mt-3 w-full text-sm">
        <tbody>
          {Array.from({ length: 7 }, (_, day) => {
            const entry = hours?.find((h) => h.day === day);
            const isToday = now?.day === day;
            const ranges =
              entry && entry.ranges.length
                ? entry.ranges.map(formatRange).join(", ")
                : "Closed";
            return (
              <tr
                key={day}
                className={`border-b border-ink/10 last:border-0 ${
                  isToday ? "font-semibold text-ink" : "text-ink/70"
                }`}
              >
                <td className="py-1.5 pr-4 w-28">{dayLabel(day)}</td>
                <td className="py-1.5">{ranges}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
