"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, RefreshCw, LogOut } from "lucide-react";
import type {
  ClaimWithRestaurant,
  ListingStatus,
  Restaurant,
  SuggestionWithRestaurant,
} from "@/lib/types";
import {
  signOut,
  saveListing,
  applySuggestion,
  setSuggestionStatus,
  setClaimStatus,
} from "@/app/admin/actions";
import { STATUS, STATUS_ORDER } from "./status";
import { ListingEditor } from "./ListingEditor";
import { Moderation } from "./Moderation";

type Tab = "all" | ListingStatus;
type View = "listings" | "moderation";

export function AdminWorkspace({
  initialRestaurants,
  initialSuggestions,
  initialClaims,
  demo,
}: {
  initialRestaurants: Restaurant[];
  initialSuggestions: SuggestionWithRestaurant[];
  initialClaims: ClaimWithRestaurant[];
  demo: boolean;
}) {
  const router = useRouter();
  const [listings, setListings] = useState(initialRestaurants);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [claims, setClaims] = useState(initialClaims);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<View>("listings");
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  // Re-sync local state when the server sends fresh data (e.g. after a sync).
  useEffect(() => setListings(initialRestaurants), [initialRestaurants]);
  useEffect(() => setSuggestions(initialSuggestions), [initialSuggestions]);
  useEffect(() => setClaims(initialClaims), [initialClaims]);

  const runSync = async () => {
    if (demo) {
      setSyncNote("Connect Supabase and set GOOGLE_PLACES_API_KEY to run the sync.");
      return;
    }
    setSyncing(true);
    setSyncNote(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncNote(data.error ?? "Sync failed.");
      } else {
        setSyncNote(
          `Sync complete — ${data.created} created, ${data.updated} updated, ${data.skippedLocked} skipped (locked), ${data.skippedOutOfArea} out-of-area${
            data.errors?.length ? `, ${data.errors.length} error(s)` : ""
          }.`,
        );
        router.refresh();
      }
    } catch {
      setSyncNote("Sync failed — network error.");
    } finally {
      setSyncing(false);
    }
  };

  const pendingCount = suggestions.length + claims.length;

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: 0, unverified: 0, needs_call: 0, verified: 0 };
    listings.forEach((l) => {
      c.all++;
      c[l.status]++;
    });
    return c;
  }, [listings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((l) => (tab === "all" ? true : l.status === tab))
      .filter((l) => l.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.name.localeCompare(b.name),
      );
  }, [listings, tab, query]);

  const saveEdit = async (draft: Restaurant) => {
    setSaving(true);
    const res = await saveListing(draft);
    setSaving(false);
    if (res.ok && res.restaurant) {
      setListings((ls) => ls.map((l) => (l.id === res.restaurant!.id ? res.restaurant! : l)));
      setEditing(null);
    }
  };

  const handleApply = async (s: SuggestionWithRestaurant) => {
    const res = await applySuggestion(s.id, s.restaurant_id, s.field!, s.suggested_value!);
    if (res.ok) {
      if (res.restaurant) {
        setListings((ls) => ls.map((l) => (l.id === res.restaurant!.id ? res.restaurant! : l)));
      }
      setSuggestions((xs) => xs.filter((x) => x.id !== s.id));
    }
  };
  const handleRejectSuggestion = async (id: string) => {
    const res = await setSuggestionStatus(id, "rejected");
    if (res.ok) setSuggestions((xs) => xs.filter((x) => x.id !== id));
  };
  const handleApproveClaim = async (id: string) => {
    const res = await setClaimStatus(id, "approved");
    if (res.ok) setClaims((xs) => xs.filter((x) => x.id !== id));
  };
  const handleRejectClaim = async (id: string) => {
    const res = await setClaimStatus(id, "rejected");
    if (res.ok) setClaims((xs) => xs.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-page text-ink">
      {/* Header */}
      <header className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-4xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-coral font-semibold">
              VA workspace{demo ? " · demo mode" : ""}
            </div>
            <h1 className="font-display text-2xl">Sea Isle Eats · Listings</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />{" "}
              {syncing ? "Syncing…" : "Run Google sync"}
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-cream/30 px-3 py-2 text-sm font-medium hover:bg-cream/10"
              >
                <LogOut size={15} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pt-5">
        {syncNote && (
          <div className="mb-3 rounded-lg border border-coral/40 bg-coral/[0.06] px-4 py-2 text-xs text-ink/70">
            {syncNote}
          </div>
        )}

        {/* View switch */}
        <div className="flex items-center gap-2">
          {(["listings", "moderation"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${
                view === v
                  ? "bg-ink text-cream border-ink"
                  : "border-ink/20 hover:border-ink/50"
              }`}
            >
              {v === "listings" ? "Listings" : "Moderation"}
              {v === "moderation" && pendingCount > 0 && (
                <span className="ml-1 text-coral font-semibold">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-5 py-5">
        {view === "listings" ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "needs_call", "unverified", "verified"] as Tab[]).map((t) => {
                const lbl = t === "all" ? "All" : STATUS[t].label;
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${
                      active
                        ? "bg-ink text-cream border-ink"
                        : "border-ink/20 hover:border-ink/50"
                    }`}
                  >
                    {lbl}{" "}
                    <span className={active ? "text-cream/60" : "text-ink/40"}>
                      {counts[t]}
                    </span>
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-2 rounded-full bg-white border border-ink/15 px-3 py-1.5">
                <Search size={15} className="text-ink/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="bg-transparent outline-none text-sm w-28 sm:w-40"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {visible.map((l) => {
                const S = STATUS[l.status];
                const Icon = S.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => setEditing({ ...l })}
                    className="w-full text-left rounded-xl bg-white border border-ink/10 p-4 hover:shadow-md hover:border-ink/25 transition-all flex items-center gap-4"
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0"
                      style={{ background: S.bg, color: S.tone }}
                    >
                      <Icon size={13} /> {S.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg leading-tight truncate">
                        {l.name || "(untitled)"}
                      </div>
                      <div className="text-xs text-ink/50 flex items-center gap-2 flex-wrap mt-0.5">
                        {l.cuisine && <span>{l.cuisine}</span>}
                        {l.accepts_cards === false && (
                          <>
                            <span>·</span>
                            <span className="text-coral font-medium">cash only</span>
                          </>
                        )}
                        {l.online_ordering && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 text-status-verified">
                              <ShoppingBag size={11} /> online
                            </span>
                          </>
                        )}
                        {l.locked_fields.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-ink/40">
                              {l.locked_fields.length} locked
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {!l.published && (
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-ink/40 border border-ink/20 rounded-full px-2 py-0.5 shrink-0">
                        Draft
                      </span>
                    )}
                    <div className="text-[11px] text-ink/35 shrink-0 hidden sm:block">
                      upd {l.updated_at?.slice(0, 10)}
                    </div>
                  </button>
                );
              })}
              {visible.length === 0 && (
                <div className="text-center py-12 text-ink/40 font-display italic text-lg">
                  Nothing here.
                </div>
              )}
            </div>
          </>
        ) : (
          <Moderation
            suggestions={suggestions}
            claims={claims}
            onApplySuggestion={handleApply}
            onRejectSuggestion={handleRejectSuggestion}
            onApproveClaim={handleApproveClaim}
            onRejectClaim={handleRejectClaim}
          />
        )}
      </main>

      {editing && (
        <ListingEditor
          listing={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
