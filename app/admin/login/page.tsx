"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setError("Couldn't send the link. Check the email and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-page text-ink flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-[10px] uppercase tracking-[0.25em] text-coral font-semibold">
          VA workspace
        </div>
        <h1 className="font-display text-3xl font-semibold mt-1">Admin sign-in</h1>

        {!configured && (
          <p className="mt-4 rounded-lg border border-coral/40 bg-coral/[0.06] px-4 py-2 text-xs text-ink/70">
            Supabase isn&apos;t connected yet. Sign-in is disabled — the admin
            workspace runs in demo mode at{" "}
            <a href="/admin" className="underline">
              /admin
            </a>
            .
          </p>
        )}

        {sent ? (
          <div className="mt-6 rounded-2xl bg-white border border-ink/10 p-5">
            <div className="flex items-center gap-2 text-teal font-semibold">
              <Check size={18} /> Check your email
            </div>
            <p className="mt-1 text-sm text-ink/60">
              We sent a magic link to <strong>{email}</strong>. Open it on this
              device to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="inp"
                placeholder="you@example.com"
              />
            </label>
            {error && <p className="text-sm text-coral">{error}</p>}
            <button
              type="submit"
              disabled={pending || !configured}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <Mail size={15} /> {pending ? "Sending…" : "Email me a magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
