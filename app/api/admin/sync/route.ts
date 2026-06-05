import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runGoogleSync } from "@/lib/google-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // sync can take a while across many places

/** POST /api/admin/sync — guarded to authenticated admins. */
export async function POST() {
  // Auth gate: must have a Supabase session.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: "Supabase isn't configured." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY isn't set." },
      { status: 400 },
    );
  }

  try {
    // Writes use the service-role client (bypasses RLS) — server-side only.
    const admin = createAdminClient();
    const result = await runGoogleSync(admin, apiKey);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed." },
      { status: 500 },
    );
  }
}
