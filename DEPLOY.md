# Deploying Sea Isle Eats

Target: **Vercel**, custom domain **siceats.com** (reserved at GoDaddy).

## 1. Supabase (database + auth)

1. In your Supabase project, run the migrations in order via the SQL editor:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_notes.sql`
2. **Auth → URL Configuration:**
   - **Site URL:** `https://siceats.com`
   - **Redirect URLs:** add `https://siceats.com/auth/callback` and
     `http://localhost:3000/auth/callback` (for local dev).
3. (Optional, recommended) Restrict who can sign in. Today any authenticated
   user is treated as admin. Until you add an allowlist, only send the magic
   link to people you trust. Consider turning off public sign-ups in
   **Auth → Providers → Email** once your admin account exists.

## 2. Google Places API (New)

1. In Google Cloud, enable **Places API (New)**.
2. Create an API key. Restrict it to **Places API (New)** (API restriction).
   The key is used **server-side only**, so you don't need referrer
   restrictions. (Vercel egress IPs aren't static, so prefer API restriction
   over IP restriction.)

## 3. Vercel

1. Import the repo into Vercel (Framework preset: **Next.js**).
2. **Settings → Environment Variables** (Production + Preview):
   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   SUPABASE_SERVICE_ROLE_KEY=…        # server-only, never exposed
   GOOGLE_PLACES_API_KEY=…            # server-only
   ```
3. Deploy. Without these set, the site still builds and runs in **demo mode**
   (sample data, admin open, forms/sync disabled).

## 4. Domain — GoDaddy → Vercel

1. In Vercel: **Settings → Domains → Add** `siceats.com` (and `www.siceats.com`).
2. Vercel shows the exact DNS records to create. Use **what Vercel displays** —
   the values below are the current Vercel defaults and may change:
   - Apex `siceats.com`: **A** record → `76.76.21.21`
   - `www`: **CNAME** → `cname.vercel-dns.com`
3. In GoDaddy → **DNS Management**, add those records (remove conflicting
   parked-domain A/CNAME records GoDaddy created).
4. Pick a canonical host. Recommended: redirect `www.siceats.com` → apex
   `siceats.com` (set in Vercel's domain settings). `SITE_URL` in
   `lib/config.ts` is already the apex.
5. DNS can take up to a few hours to propagate; Vercel issues the SSL cert
   automatically once records resolve.

## 5. Seed the data

Once env vars are live, seed restaurants from Google:

- **Initial bulk seed (recommended):** locally with `.env.local` filled in,
  run `npx tsx scripts/google-sync.ts`. No serverless time limit.
- **Refreshes:** sign in at `/admin` and click **Run Google sync**.

New rows arrive `unverified` + unpublished. Work the queue in `/admin`: verify,
fill `menu_url` / `order_url`, set status, then toggle **Published**.

## 6. Verify after deploy

- `https://siceats.com` — directory renders live published rows
- `https://siceats.com/robots.txt` and `/sitemap.xml` resolve
- `https://siceats.com/admin` → redirects to `/admin/login` when signed out
- Magic-link sign-in works and lands back in the workspace

## Scheduled refresh (optional, later)

To auto-refresh each season, either run `scripts/google-sync.ts` from a cron
host, or add a `CRON_SECRET`-guarded branch to `app/api/admin/sync/route.ts`
and trigger it with a Vercel Cron job.
