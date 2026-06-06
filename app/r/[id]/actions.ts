"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/email";
import { SITE_URL } from "@/lib/config";

export interface FormState {
  ok: boolean;
  error?: string;
  /** True when Supabase isn't connected — submission was a no-op demo. */
  demo?: boolean;
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public "suggest a change" submission → suggestions queue (RLS: anon insert). */
export async function submitSuggestion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const restaurant_id = str(formData, "restaurant_id");
  if (!restaurant_id) return { ok: false, error: "Missing restaurant." };

  const field = str(formData, "field");
  const suggested_value = str(formData, "suggested_value");
  const note = str(formData, "note");
  const submitter_email = str(formData, "submitter_email");

  if (!suggested_value && !note) {
    return { ok: false, error: "Add a suggested value or a note." };
  }
  if (submitter_email && !EMAIL_RE.test(submitter_email)) {
    return { ok: false, error: "That email doesn't look right." };
  }

  // Demo mode (no Supabase yet): accept without persisting so the UX is testable.
  if (!supabaseConfigured()) return { ok: true, demo: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("suggestions").insert({
      restaurant_id,
      field,
      suggested_value,
      note,
      submitter_email,
    });
    if (error) throw error;

    await sendNotification(
      "Sea Isle Eats — new suggestion",
      [
        `Field: ${field ?? "(general note)"}`,
        suggested_value ? `Suggested: ${suggested_value}` : null,
        note ? `Note: ${note}` : null,
        submitter_email ? `From: ${submitter_email}` : null,
        `Listing: ${SITE_URL}/r/${restaurant_id}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** Public "claim this listing" request → listing_claims queue (review is manual). */
export async function submitClaim(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const restaurant_id = str(formData, "restaurant_id");
  if (!restaurant_id) return { ok: false, error: "Missing restaurant." };

  const claimant_name = str(formData, "claimant_name");
  const claimant_email = str(formData, "claimant_email");
  const message = str(formData, "message");

  if (!claimant_email || !EMAIL_RE.test(claimant_email)) {
    return { ok: false, error: "A valid email is required." };
  }

  if (!supabaseConfigured()) return { ok: true, demo: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("listing_claims").insert({
      restaurant_id,
      claimant_name,
      claimant_email,
      message,
    });
    if (error) throw error;

    await sendNotification(
      "Sea Isle Eats — new listing claim",
      [
        claimant_name ? `Name: ${claimant_name}` : null,
        `Email: ${claimant_email}`,
        message ? `Message: ${message}` : null,
        `Listing: ${SITE_URL}/r/${restaurant_id}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
