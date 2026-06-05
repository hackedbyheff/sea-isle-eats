"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { submitSuggestion, type FormState } from "@/app/r/[id]/actions";

const initial: FormState = { ok: false };

/** Editable fields a visitor can flag. Value = column name. */
const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "General note" },
  { value: "name", label: "Name" },
  { value: "cuisine", label: "Cuisine" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "hours", label: "Hours" },
  { value: "price_level", label: "Price" },
  { value: "accepts_cards", label: "Takes cards" },
  { value: "accepts_cash", label: "Takes cash" },
  { value: "online_ordering", label: "Online ordering" },
  { value: "menu_url", label: "Menu link" },
  { value: "order_url", label: "Ordering link" },
  { value: "description", label: "Description" },
];

export function SuggestChangeForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState(submitSuggestion, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-white border border-ink/10 p-5">
        <div className="flex items-center gap-2 text-teal font-semibold">
          <Check size={18} /> Thanks — we&apos;ll review it.
        </div>
        <p className="mt-1 text-sm text-ink/60">
          {state.demo
            ? "(Demo mode: nothing was saved — connect Supabase to capture suggestions.)"
            : "A human verifies every change before it goes live."}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white border border-ink/10 p-5 space-y-3"
    >
      <h3 className="font-display text-xl font-semibold">Suggest a change</h3>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          What&apos;s off?
        </span>
        <select name="field" className="inp">
          {FIELD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Correct value (optional)
        </span>
        <input name="suggested_value" className="inp" placeholder="e.g. Closes at 11pm" />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Note
        </span>
        <textarea name="note" rows={3} className="inp resize-none" placeholder="Tell us more…" />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Your email (optional)
        </span>
        <input name="submitter_email" type="email" className="inp" placeholder="you@example.com" />
      </label>

      {state.error && <p className="text-sm text-coral">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink text-cream py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}
