"use client";

import { Plus, X } from "lucide-react";
import type { Hours, HoursRange } from "@/lib/types";
import { dayShort } from "@/lib/hours";

/**
 * Edits the per-day `hours` jsonb. Each day can have zero ranges (closed) or
 * multiple ranges (lunch/dinner gaps). Emits only days that have ranges.
 */
export function HoursEditor({
  value,
  onChange,
}: {
  value: Hours | null;
  onChange: (next: Hours) => void;
}) {
  const byDay: HoursRange[][] = Array.from({ length: 7 }, (_, day) => {
    const entry = value?.find((h) => h.day === day);
    return entry ? entry.ranges.map((r) => [...r] as HoursRange) : [];
  });

  const emit = (next: HoursRange[][]) => {
    onChange(
      next
        .map((ranges, day) => ({ day, ranges }))
        .filter((e) => e.ranges.length > 0),
    );
  };

  const setRange = (day: number, idx: number, pos: 0 | 1, val: string) => {
    const next = byDay.map((r) => r.map((x) => [...x] as HoursRange));
    next[day][idx][pos] = val;
    emit(next);
  };
  const addRange = (day: number) => {
    const next = byDay.map((r) => r.map((x) => [...x] as HoursRange));
    next[day].push(["11:00", "22:00"]);
    emit(next);
  };
  const removeRange = (day: number, idx: number) => {
    const next = byDay.map((r) => r.map((x) => [...x] as HoursRange));
    next[day].splice(idx, 1);
    emit(next);
  };

  return (
    <div className="space-y-2">
      {byDay.map((ranges, day) => (
        <div key={day} className="flex items-start gap-3">
          <span className="w-10 pt-2 text-xs font-semibold text-ink/60">
            {dayShort(day)}
          </span>
          <div className="flex-1 space-y-1.5">
            {ranges.length === 0 && (
              <span className="text-xs text-ink/40 leading-8">Closed</span>
            )}
            {ranges.map((range, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={range[0]}
                  onChange={(e) => setRange(day, idx, 0, e.target.value)}
                  className="inp !py-1 !w-28"
                />
                <span className="text-ink/40">–</span>
                <input
                  type="time"
                  value={range[1]}
                  onChange={(e) => setRange(day, idx, 1, e.target.value)}
                  className="inp !py-1 !w-28"
                />
                <button
                  type="button"
                  onClick={() => removeRange(day, idx)}
                  className="text-ink/40 hover:text-coral"
                  aria-label="Remove range"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addRange(day)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal hover:underline"
            >
              <Plus size={12} /> Add hours
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
