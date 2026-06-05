"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { submitClaim, type FormState } from "@/app/r/[id]/actions";

const initial: FormState = { ok: false };

export function ClaimListingForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState(submitClaim, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-white border border-ink/10 p-5">
        <div className="flex items-center gap-2 text-teal font-semibold">
          <Check size={18} /> Request received.
        </div>
        <p className="mt-1 text-sm text-ink/60">
          {state.demo
            ? "(Demo mode: nothing was saved — connect Supabase to capture claims.)"
            : "We review claims by hand and may reach out to verify ownership."}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white border border-ink/10 p-5 space-y-3"
    >
      <h3 className="font-display text-xl font-semibold">Claim this listing</h3>
      <p className="text-sm text-ink/60">
        Own or manage this place? Let us know. Review is manual.
      </p>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Your name
        </span>
        <input name="claimant_name" className="inp" placeholder="Full name" />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Email <span className="text-coral">*</span>
        </span>
        <input name="claimant_email" type="email" required className="inp" placeholder="you@example.com" />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
          Message
        </span>
        <textarea name="message" rows={3} className="inp resize-none" placeholder="Anything we should know?" />
      </label>

      {state.error && <p className="text-sm text-coral">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-coral text-white py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Sending…" : "Request to claim"}
      </button>
    </form>
  );
}
