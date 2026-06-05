import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key only). Safe to use in Client Components.
 * Subject to Row Level Security: anon can only read published restaurants and
 * insert into suggestions / listing_claims.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
