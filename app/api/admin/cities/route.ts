import { NextResponse } from "next/server";
import { getActiveCities } from "@/lib/cities";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/cities — active cities (slug + name) so the sheet can match a
 * tab name to a city. Gated by IMPORT_SECRET (x-sync-secret).
 */
export async function GET(request: Request) {
  const secret = process.env.IMPORT_SECRET;
  if (!secret || request.headers.get("x-sync-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const cities = await getActiveCities();
    return NextResponse.json({
      cities: cities.map((c) => ({ slug: c.slug, name: c.name })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 500 },
    );
  }
}
