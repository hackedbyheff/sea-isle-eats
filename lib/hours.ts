import type { Hours, HoursRange } from "./types";

/**
 * Hours logic. All computation is anchored to America/New_York regardless of
 * where the visitor's browser is, since the restaurants are all in NJ.
 *
 * `hours` shape: [{ day: 0..6 (0=Sun), ranges: [["HH:MM","HH:MM"], ...] }]
 * A range whose end <= start is treated as crossing midnight (e.g. a bar open
 * 22:00–02:00).
 */

/** The Late Night threshold. Single source of truth — change here only. */
export const LATE_NIGHT_START = "22:00"; // 10pm

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** "HH:MM" → minutes since midnight. */
export function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export interface NowInET {
  day: number; // 0=Sun … 6=Sat
  minutes: number; // minutes since midnight, ET
}

/** Current day-of-week + minutes-since-midnight in America/New_York. */
export function getEasternNow(date: Date = new Date()): NowInET {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = WEEKDAY_INDEX[get("weekday")] ?? 0;
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0; // some environments emit "24" at midnight
  const minute = parseInt(get("minute"), 10);
  return { day, minutes: hour * 60 + minute };
}

/** Does a single range (anchored to rangeDay) contain the given (day, minutes)? */
function rangeContains(range: HoursRange, rangeDay: number, day: number, minutes: number): boolean {
  const start = hmToMinutes(range[0]);
  const end = hmToMinutes(range[1]);
  if (end > start) {
    return rangeDay === day && minutes >= start && minutes < end;
  }
  // crosses midnight: open rangeDay [start, 24:00) and (rangeDay+1) [0, end)
  if (rangeDay === day && minutes >= start) return true;
  if ((rangeDay + 1) % 7 === day && minutes < end) return true;
  return false;
}

/** Is the restaurant open at the given ET moment? */
export function isOpenNow(hours: Hours | null | undefined, now: NowInET): boolean {
  if (!hours) return false;
  for (const entry of hours) {
    for (const range of entry.ranges) {
      if (rangeContains(range, entry.day, now.day, now.minutes)) return true;
    }
  }
  return false;
}

/**
 * Late Night: open at or after the LATE_NIGHT_START threshold on the given day.
 * A range qualifies if it crosses midnight, or its end is past the threshold.
 */
export function isLateNightOn(hours: Hours | null | undefined, day: number): boolean {
  if (!hours) return false;
  const threshold = hmToMinutes(LATE_NIGHT_START);
  const entry = hours.find((h) => h.day === day);
  if (!entry) return false;
  return entry.ranges.some((r) => {
    const start = hmToMinutes(r[0]);
    const end = hmToMinutes(r[1]);
    return end <= start || end > threshold;
  });
}

/** "11:00" → "11am", "13:30" → "1:30pm", "00:00" → "12am". */
export function formatTime(hm: string): string {
  const total = hmToMinutes(hm);
  let h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const am = h < 12;
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}${m ? `:${String(m).padStart(2, "0")}` : ""}${am ? "am" : "pm"}`;
}

/** One range → "11am–10pm". */
export function formatRange(range: HoursRange): string {
  return `${formatTime(range[0])}–${formatTime(range[1])}`;
}

/** Today's ranges as "11:30am–2pm, 4pm–10pm", or "Closed" if none. */
export function todayHoursLabel(hours: Hours | null | undefined, day: number): string {
  if (!hours) return "Hours unknown";
  const entry = hours.find((h) => h.day === day);
  if (!entry || entry.ranges.length === 0) return "Closed";
  return entry.ranges.map(formatRange).join(", ");
}

export function dayLabel(day: number): string {
  return DAY_LABELS[day] ?? "";
}

export function dayShort(day: number): string {
  return DAY_SHORT[day] ?? "";
}
