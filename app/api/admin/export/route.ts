import { NextResponse } from "next/server";
import type { Restaurant } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;

    const rows = (data as Restaurant[]).map(dbRowToSheetRow);
    return NextResponse.json({ columns: SHEET_COLUMNS, rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed." },
      { status: 500 },
    );
  }
}
