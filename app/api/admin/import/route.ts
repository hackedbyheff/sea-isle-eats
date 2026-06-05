import { NextResponse } from "next/server";
import type { Restaurant } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildUpdateFromSheetRow } from "@/lib/sheet-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/import — applies edited rows from the Google Sheet.
 * Body: { rows: [{ id, name, ... }] }. Gated by IMPORT_SECRET (x-sync-secret).
 *
 * Matches rows by id, updates the listing, and locks any Google-managed field
 * the VA changed so the Places sync won't overwrite it. Uses the service-role
 * client (server-side only).
 */
export async function POST(request: Request) {
  const secret = process.env.IMPORT_SECRET;
  if (!secret || request.headers.get("x-sync-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rows?: Record<string, string>[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const rows = body.rows ?? [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const ids = rows.map((r) => r.id).filter(Boolean);
    const { data: existing, error: readErr } = await supabase
      .from("restaurants")
      .select("*")
      .in("id", ids);
    if (readErr) throw readErr;

    const byId = new Map<string, Restaurant>();
    for (const r of (existing as Restaurant[]) ?? []) byId.set(r.id, r);

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const current = row.id ? byId.get(row.id) : undefined;
      if (!current) {
        skipped++;
        continue; // unknown id — sheet should only contain pulled rows
      }
      const built = buildUpdateFromSheetRow(row, current);
      if (!built) {
        skipped++;
        continue;
      }
      const { error } = await supabase
        .from("restaurants")
        .update({ ...built.update, locked_fields: built.locked_fields })
        .eq("id", row.id);
      if (error) {
        errors.push(`${row.name || row.id}: ${error.message}`);
      } else {
        updated++;
      }
    }

    return NextResponse.json({ updated, skipped, errors });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed." },
      { status: 500 },
    );
  }
}
