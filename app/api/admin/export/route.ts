import { NextResponse } from "next/server";
import type { Restaurant } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCityBySlug } from "@/lib/cities";
import { SHEET_COLUMNS, dbRowToSheetRow } from "@/lib/sheet-sync";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export — returns all listings as flat sheet rows for the
 * Google Sheet to pull. Gated by the IMPORT_SECRET shared secret (the Apps
 * Script sends it as x-sync-secret).
 */
export async function GET(request: Request) {
  const secret = process.env.IMPORT_SECRET;
  if (!secret || request.headers.get("x-sync-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    // Optional ?city=<slug> scopes the sheet to one market.
    const slug = new URL(request.url).searchParams.get("city");
    const city = slug ? await getCityBySlug(slug) : null;
    if (slug && !city) {
      return NextResponse.json({ error: `Unknown city: ${slug}` }, { status: 400 });
    }

    let q = supabase.from("restaurants").select("*");
    if (city) q = q.eq("city_id", city.id);
    const { data, error } = await q.order("name", { ascending: true });
    if (error) throw error;

    // Map neighborhood_id → name so the sheet shows a friendly value.
    let nbq = supabase.from("neighborhoods").select("id, name");
    if (city) nbq = nbq.eq("city_id", city.id);
    const { data: nbs } = await nbq;
    const nbName = new Map<string, string>(
      (nbs ?? []).map((n: { id: string; name: string }) => [n.id, n.name]),
    );

    const rows = (data as Restaurant[]).map((r) => ({
      ...dbRowToSheetRow(r),
      neighborhood: r.neighborhood_id ? (nbName.get(r.neighborhood_id) ?? "") : "",
    }));
    return NextResponse.json({ columns: SHEET_COLUMNS, rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed." },
      { status: 500 },
    );
  }
}
