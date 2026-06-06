/**
 * Shared domain types. These mirror the Postgres schema in
 * supabase/migrations/0001_init.sql. Keep them in sync by hand (or generate
 * with `supabase gen types typescript` later).
 */

export type ListingStatus = "unverified" | "needs_call" | "verified";

/** One open range on a given day, 24h clock, "HH:MM" in America/New_York. */
export type HoursRange = [string, string];

/** Per-day hours. `day`: 0=Sun … 6=Sat. Absent day = closed. */
export interface DayHours {
  day: number;
  ranges: HoursRange[];
}

export type Hours = DayHours[];

export interface Restaurant {
  id: string;
  google_place_id: string | null;
  name: string;
  cuisine: string | null;
  price_level: number | null; // 1=$ 2=$$ 3=$$$ 4=$$$$
  rating: number | null;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  hours: Hours | null;
  accepts_cash: boolean;
  accepts_cards: boolean | null;
  online_ordering: boolean;
  menu_url: string | null;
  order_url: string | null;
  description: string | null;
  notes: string | null; // internal call-log / admin notes (not public)
  status: ListingStatus;
  published: boolean;
  /** True once an owner/manager has claimed the listing and confirmed its info. */
  owner_verified: boolean;
  /** Field names a human edited; the Google sync must skip these columns. */
  locked_fields: string[];
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
  /** Optional: marks sponsored/featured listings (sort first). */
  featured?: boolean;
}

/** Public-submitted correction. */
export interface Suggestion {
  id: string;
  restaurant_id: string;
  field: string | null;
  suggested_value: string | null;
  note: string | null;
  submitter_email: string | null;
  status: "pending" | "applied" | "rejected";
  created_at: string;
}

/** Owner "claim this listing" request. Review is manual. */
export interface ListingClaim {
  id: string;
  restaurant_id: string;
  claimant_name: string | null;
  claimant_email: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** Moderation-queue rows carry the related restaurant's name for display. */
export type SuggestionWithRestaurant = Suggestion & { restaurant_name: string };
export type ClaimWithRestaurant = ListingClaim & { restaurant_name: string };
