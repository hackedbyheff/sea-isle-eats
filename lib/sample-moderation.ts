import type { ClaimWithRestaurant, SuggestionWithRestaurant } from "./types";

/** Sample moderation-queue rows for demo mode (no Supabase connected). */

export const SAMPLE_SUGGESTIONS: SuggestionWithRestaurant[] = [
  {
    id: "sug-1",
    restaurant_id: "sample-3",
    restaurant_name: "Nonna's Slice Shop",
    field: "accepts_cards",
    suggested_value: "true",
    note: "They added a card reader this season.",
    submitter_email: "local@example.com",
    status: "pending",
    created_at: "2026-06-03T14:00:00.000Z",
  },
  {
    id: "sug-2",
    restaurant_id: "sample-1",
    restaurant_name: "The Dunes Grille",
    field: null,
    suggested_value: null,
    note: "Back deck is closed for repairs through June.",
    submitter_email: null,
    status: "pending",
    created_at: "2026-06-04T18:30:00.000Z",
  },
];

export const SAMPLE_CLAIMS: ClaimWithRestaurant[] = [
  {
    id: "claim-1",
    restaurant_id: "sample-2",
    restaurant_name: "Marina Raw Bar",
    claimant_name: "Dana Owner",
    claimant_email: "dana@marinarawbar.example",
    message: "I own the Marina Raw Bar and would like to keep our hours current.",
    status: "pending",
    created_at: "2026-06-02T09:15:00.000Z",
  },
];
