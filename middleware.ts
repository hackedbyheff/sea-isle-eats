import { NextResponse, type NextRequest } from "next/server";
import { CITY_CUSTOM_DOMAIN, PLATFORM_DOMAIN } from "@/lib/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

  // Canonical host: if a city has its own domain (e.g. siceats.com), its
  // {slug}.clickclickeat.com subdomain 301-redirects there. Cities without a
  // custom domain just live on their subdomain.
  if (host.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const slug = host.slice(0, host.length - PLATFORM_DOMAIN.length - 1);
    const custom = CITY_CUSTOM_DOMAIN[slug];
    if (custom && slug !== "www") {
      const dest = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        `https://${custom}`,
      );
      return NextResponse.redirect(dest, 301);
    }
  }

  // Admin auth (session refresh + login gate) only on /admin.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
