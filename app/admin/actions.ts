"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Restaurant } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/admin-data";
import { SAMPLE_RESTAURANTS } from "@/lib/sample-data";
import { coerceFieldValue } from "@/lib/sync-fields";

export interface SaveResult {
  ok: boolean;
  error?: string;
  restaurant?: Restaurant;
  demo?: boolean;
}

export interface ApplyResult {
  ok: boolean;
  error?: string;
  restaurant?: Restaurant;
  suggestionId?: string;
  demo?: boolean;
}

/** Editable columns persisted from the listing editor. */
const EDITABLE_COLUMNS = [
  "name",
  "cuisine",
  "price_level",
  "rating",
  "phone",
  "address",
  "hours",
  "accepts_cash",
  "accepts_cards",
  "online_ordering",
  "menu_url",
  "order_url",
  "website_url",
  "facebook_url",
  "instagram_url",
  "description",
  "notes",
  "status",
  "published",
  "featured",
  "owner_verified",
  "locked_fields",
] as const;

function pick(input: Partial<Restaurant>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of EDITABLE_COLUMNS) {
    if (col in input) out[col] = (input as Record<string, unknown>)[col];
  }
  return out;
}

export async function signOut(): Promise<void> {
  if (!isDemoMode()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/** Save the full listing draft. locked_fields is computed client-side. */
export async function saveListing(input: Restaurant): Promise<SaveResult> {
  const update = pick(input);
  if (input.status === "verified") {
    update.last_verified_at = new Date().toISOString();
  }

  if (isDemoMode()) {
    return {
      ok: true,
      demo: true,
      restaurant: {
        ...input,
        last_verified_at:
          input.status === "verified"
            ? new Date().toISOString()
            : input.last_verified_at,
        updated_at: new Date().toISOString(),
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurants")
      .update(update)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/r/${input.id}`);
    return { ok: true, restaurant: data as Restaurant };
  } catch {
    return { ok: false, error: "Couldn't save. Please try again." };
  }
}

/** Apply a field suggestion to the live record, locking that field. */
export async function applySuggestion(
  suggestionId: string,
  restaurantId: string,
  field: string,
  suggestedValue: string,
): Promise<ApplyResult> {
  let value: unknown;
  try {
    value = coerceFieldValue(field, suggestedValue);
  } catch {
    return { ok: false, error: `Couldn't parse value for ${field}.` };
  }

  if (isDemoMode()) {
    const base = SAMPLE_RESTAURANTS.find((r) => r.id === restaurantId);
    if (!base) return { ok: false, error: "Restaurant not found." };
    const locked = Array.from(new Set([...base.locked_fields, field]));
    return {
      ok: true,
      demo: true,
      suggestionId,
      restaurant: { ...base, [field]: value, locked_fields: locked } as Restaurant,
    };
  }

  try {
    const supabase = await createClient();
    const { data: current, error: readErr } = await supabase
      .from("restaurants")
      .select("locked_fields")
      .eq("id", restaurantId)
      .single();
    if (readErr) throw readErr;

    const locked = Array.from(
      new Set([...((current?.locked_fields as string[]) ?? []), field]),
    );

    const { data, error } = await supabase
      .from("restaurants")
      .update({ [field]: value, locked_fields: locked })
      .eq("id", restaurantId)
      .select("*")
      .single();
    if (error) throw error;

    const { error: sErr } = await supabase
      .from("suggestions")
      .update({ status: "applied" })
      .eq("id", suggestionId);
    if (sErr) throw sErr;

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/r/${restaurantId}`);
    return { ok: true, suggestionId, restaurant: data as Restaurant };
  } catch {
    return { ok: false, error: "Couldn't apply the suggestion." };
  }
}

export async function setSuggestionStatus(
  id: string,
  status: "applied" | "rejected",
): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode()) return { ok: true };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("suggestions")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update suggestion." };
  }
}

export async function setClaimStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode()) return { ok: true };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("listing_claims")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update claim." };
  }
}
