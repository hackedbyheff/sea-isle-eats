# Go Live — Netlify + Supabase + Google Sheet (VA)

Your stack: **Supabase** (database, already holds 51 listings), **Netlify**
(hosting), **Google Sheet** in Drive (VA updates). Domain: **siceats.com** (GoDaddy).

---

## Part 1 — Put the code on GitHub

Git is already initialized with a first commit. Create an empty repo at
github.com (e.g. `sea-isle-eats`), then from the project folder:

```
git remote add origin https://github.com/<you>/sea-isle-eats.git
git branch -M main
git push -u origin main
```

(Also update `GITHUB_REPO_URL` in `lib/config.ts` to this repo so the footer links right.)

## Part 2 — Deploy on Netlify

1. netlify.com → **Add new site → Import an existing project** → GitHub → pick the repo.
2. Build settings auto-detect from `netlify.toml` (build command `next build`). Leave defaults.
3. **Site configuration → Environment variables** — add all five:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY      # server-only
   GOOGLE_PLACES_API_KEY          # server-only
   IMPORT_SECRET                  # server-only (gates the sheet sync)
   ```
   Use the same values as your local `.env.local`.
4. **Deploy site.** You'll get a temporary `*.netlify.app` URL — confirm it loads.

## Part 3 — Domain (GoDaddy → Netlify)

1. Netlify → **Domain management → Add a domain** → `siceats.com` (and `www`).
2. Netlify shows the exact DNS records. Using GoDaddy's DNS (don't change nameservers):
   - Apex `siceats.com`: **A** record → `75.2.60.5`
   - `www`: **CNAME** → `<your-site>.netlify.app`
   Use whatever Netlify displays. SSL issues automatically once DNS resolves.
3. In GoDaddy → **DNS**, add those records (remove parked-domain records that conflict).

## Part 4 — Point Supabase auth at the live domain

Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://siceats.com`
- **Redirect URLs:** add `https://siceats.com/auth/callback`

(Needed for admin magic-link sign-in to work in production.)

---

## Part 5 — Google Sheet for the VA

The sync uses two secret-gated routes already deployed with the site
(`/api/admin/export`, `/api/admin/import`). No service account, no public
publishing — the sheet stays private in your Drive.

1. Create a new **Google Sheet** in your Drive (name it e.g. "Sea Isle Eats — Listings").
2. **Extensions → Apps Script.** Delete the starter code, paste the contents of
   `sheet/sea-isle-eats-sync.gs` from this repo, and Save.
3. **Project Settings (gear) → Script properties → Add:**
   - `SITE_URL` = `https://siceats.com`
   - `SYNC_SECRET` = the same value as `IMPORT_SECRET` (copy it from your `.env.local` / Netlify)
4. Reload the sheet tab. A **"Sea Isle Eats"** menu appears.
5. **Sea Isle Eats → Pull latest from site** (authorize the script the first time).
   The sheet fills with all 51 listings.

### How the VA works it
- Edit cells: cuisine, price (1–4), phone, address, payment (TRUE/FALSE),
  menu/order links, description, notes, **status** (`unverified` / `needs_call`
  / `verified`), **published** (TRUE/FALSE).
- **Hours:** per-day columns, 24h, e.g. `11:00-22:00`. Multiple ranges:
  `11:00-14:00, 16:00-22:00`. Leave a day **blank for closed**.
- **Don't edit** the `id` or `google_place_id` columns (they're the keys).
- When done, **Sea Isle Eats → Push changes to site.** Edits save to Supabase,
  and any Google-managed field the VA changed **auto-locks** so the Places sync
  won't overwrite it.
- The 11 flagged listings are marked `needs_call` with a reason in `notes`.

Workflow tip: the VA clicks **Pull latest** at the start of a session and
**Push changes** when done.

---

## Refreshing from Google (seasonal)

- Re-run the Places sync anytime: sign into `/admin` → **Run Google sync**, or
  run `npx tsx scripts/google-sync.ts` locally. It only adds/updates 08243
  restaurants and never overwrites locked (human-edited) fields.

## Security
- Rotate the **service-role** and **Google Places** keys (and regenerate
  `IMPORT_SECRET`) if they've been shared anywhere. Set the new values in
  Netlify env vars (and `SYNC_SECRET` in Apps Script for IMPORT_SECRET).
