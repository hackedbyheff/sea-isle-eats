"use client";

import { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import type { ClaimWithRestaurant, SuggestionWithRestaurant } from "@/lib/types";

const FIELD_LABEL: Record<string, string> = {
  name: "Name",
  cuisine: "Cuisine",
  phone: "Phone",
  address: "Address",
  hours: "Hours",
  price_level: "Price",
  accepts_cards: "Takes cards",
  accepts_cash: "Takes cash",
  online_ordering: "Online ordering",
  menu_url: "Menu link",
  order_url: "Ordering link",
  description: "Description",
};

export function Moderation({
  suggestions,
  claims,
  onApplySuggestion,
  onRejectSuggestion,
  onApproveClaim,
  onRejectClaim,
}: {
  suggestions: SuggestionWithRestaurant[];
  claims: ClaimWithRestaurant[];
  onApplySuggestion: (s: SuggestionWithRestaurant) => Promise<void>;
  onRejectSuggestion: (id: string) => Promise<void>;
  onApproveClaim: (id: string) => Promise<void>;
  onRejectClaim: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-3">
          Suggested changes ({suggestions.length})
        </h2>
        {suggestions.length === 0 ? (
          <Empty>No pending suggestions.</Empty>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl bg-white border border-ink/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg leading-tight">
                      {s.restaurant_name}
                    </div>
                    <div className="mt-1 text-sm text-ink/70">
                      {s.field ? (
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium">
                            {FIELD_LABEL[s.field] ?? s.field}
                          </span>
                          {s.suggested_value && (
                            <>
                              <ArrowRight size={13} className="text-ink/40" />
                              <span className="font-semibold text-ink">
                                {s.suggested_value}
                              </span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="italic text-ink/50">General note</span>
                      )}
                    </div>
                    {s.note && <p className="mt-1 text-sm text-ink/60">{s.note}</p>}
                    {s.submitter_email && (
                      <p className="mt-1 text-xs text-ink/40">{s.submitter_email}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {s.field && s.suggested_value && (
                      <button
                        disabled={busy === s.id}
                        onClick={() => run(s.id, () => onApplySuggestion(s))}
                        className="inline-flex items-center gap-1 rounded-full bg-status-verified text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        <Check size={13} /> Apply
                      </button>
                    )}
                    <button
                      disabled={busy === s.id}
                      onClick={() => run(s.id, () => onRejectSuggestion(s.id))}
                      className="inline-flex items-center gap-1 rounded-full border border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-3">
          Listing claims ({claims.length})
        </h2>
        {claims.length === 0 ? (
          <Empty>No pending claims.</Empty>
        ) : (
          <div className="space-y-2">
            {claims.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-white border border-ink/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg leading-tight">
                      {c.restaurant_name}
                    </div>
                    <div className="mt-1 text-sm text-ink/70">
                      {c.claimant_name && (
                        <span className="font-medium">{c.claimant_name} · </span>
                      )}
                      <a href={`mailto:${c.claimant_email}`} className="hover:text-coral">
                        {c.claimant_email}
                      </a>
                    </div>
                    {c.message && <p className="mt-1 text-sm text-ink/60">{c.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      disabled={busy === c.id}
                      onClick={() => run(c.id, () => onApproveClaim(c.id))}
                      className="inline-flex items-center gap-1 rounded-full bg-status-verified text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      disabled={busy === c.id}
                      onClick={() => run(c.id, () => onRejectClaim(c.id))}
                      className="inline-flex items-center gap-1 rounded-full border border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/40">
      {children}
    </div>
  );
}
