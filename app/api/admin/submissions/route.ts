import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCityBySlug } from "@/lib/cities";

export const dynamic = "force-dynamic";

/** Columns the Submissions sheet tab uses (also the header row). */
const COLUMNS = [
  "type",
  "created",
  "restaurant",
  "field",
  "suggested_value",
  "message",
  "name",
  "email",
  "id",
] as const;

type Row = Record<string, string>;

/**
 * GET /api/admin/submissions — pending "suggest a change" + "claim listing"
 * submissions, flattened for the Google Sheet. Gated by IMPORT_SECRET
 * (x-sync-secret). Read-only inbox; items stay until handled in /admin.
 */
export async function GET(request: Request) {
  const secret = process.env.IMPORT_SECRET;
  if (!secret || request.headers.get("x-sync-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    // Optional ?city=<slug> scopes submissions to one market.
    const slug = new URL(request.url).searchParams.get("city");
    const city = slug ? await getCityBySlug(slug) : null;
    if (slug && !city) {
      return NextResponse.json({ error: `Unknown city: ${slug}` }, { status: 400 });
    }
    // Inner-join restaurants so we can filter by city; embed name + city_id.
    const rel = city ? "restaurants!inner(name, city_id)" : "restaurants(name)";

    const sugQ = supabase.from("suggestions").select(`*, ${rel}`).eq("status", "pending");
    const claimQ = supabase.from("listing_claims").select(`*, ${rel}`).eq("status", "pending");
    if (city) {
      sugQ.eq("restaurants.city_id", city.id);
      claimQ.eq("restaurants.city_id", city.id);
    }
    const [sug, claim] = await Promise.all([
      sugQ.order("created_at", { ascending: false }),
      claimQ.order("created_at", { ascending: false }),
    ]);
    if (sug.error) throw sug.error;
    if (claim.error) throw claim.error;

    const when = (s: string | null) => (s ? s.slice(0, 16).replace("T", " ") : "");
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const rows: Row[] = [
      ...(sug.data as any[]).map((s) => ({
        type: "suggestion",
        created: when(s.created_at),
        restaurant: s.restaurants?.name ?? "(unknown)",
        field: s.field ?? "",
        suggested_value: s.suggested_value ?? "",
        message: s.note ?? "",
        name: "",
        email: s.submitter_email ?? "",
        id: s.id,
      })),
      ...(claim.data as any[]).map((c) => ({
        type: "claim",
        created: when(c.created_at),
        restaurant: c.restaurants?.name ?? "(unknown)",
        field: "",
        suggested_value: "",
        message: c.message ?? "",
        name: c.claimant_name ?? "",
        email: c.claimant_email ?? "",
        id: c.id,
      })),
    ];
    /* eslint-enable @typescript-eslint/no-explicit-any */

    rows.sort((a, b) => (a.created < b.created ? 1 : -1));

    return NextResponse.json({ columns: COLUMNS, rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 500 },
    );
  }
}
