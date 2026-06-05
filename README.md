# Sea Isle Eats

Open-source restaurant directory for **Sea Isle City, NJ**. It's a *guide*, not an
ordering platform: visitors find who's open, who takes cards, and where to see a
menu or order — and we link out to each restaurant's own Facebook / Instagram /
website for menus and ordering.

We never take orders or payments, and we never host restaurant images.

## Principles

- **Not an ordering platform.** No cart, no checkout, no payments. Online ordering is a link out only.
- **No image hosting.** We don't store or render Google Places photos or scraped images. Menus link out.
- **Verify before publishing.** Listings have a `published` flag; the public site shows only published rows.
- **Google data is a seed, not gospel.** Any field a human edits in admin becomes "locked" and is never overwritten by the next Google sync.

## Stack

- Next.js (App Router) + TypeScript, server-rendered for SEO
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Google Places API (New) for seeding
- Deploy: Vercel

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in your Supabase + Google keys.
3. Apply the database schema: open `supabase/migrations/0001_init.sql` in the
   Supabase SQL editor and run it (or `supabase db push` if you use the CLI).
4. `npm run dev` → http://localhost:3000

## Environment variables

See `.env.local.example`. The service-role key is **server-side only** and bypasses RLS.

## Project layout

```
app/                 # App Router pages
lib/
  supabase/
    client.ts        # browser client (anon, RLS-enforced)
    server.ts        # server client (reads admin session from cookies)
    admin.ts         # service-role client (bypasses RLS) — server only
  types.ts           # domain types mirroring the schema
supabase/
  migrations/        # SQL schema + RLS
```

## Google Places sync

Seeds and refreshes listings from Google Places API (New). Idempotent (upserts
on `google_place_id`) and **lock-aware** — it never overwrites a column listed
in a row's `locked_fields`, and never touches `menu_url` / `order_url` /
`online_ordering` (Google doesn't supply those; humans fill them).

Two ways to run it:

- **Admin button** — "Run Google sync" in `/admin` → `POST /api/admin/sync`
  (auth-gated). Reports created / updated / skipped-locked. Best for refreshes.
- **CLI** — `npx tsx scripts/google-sync.ts` (reads `.env.local`, uses the
  service-role key). Best for the **initial bulk seed** and scheduled refreshes,
  since it has no serverless time limit.

New rows land as `status: unverified`, `published: false` — awaiting a human pass.

## Build status

- [x] **Step 1** — Scaffold (Next + Tailwind + Supabase clients), schema migration, RLS
- [x] **Step 2** — Public directory + filters (seed/sample rows)
- [x] **Step 3** — Restaurant detail page + JSON-LD + suggestion/claim forms
- [x] **Step 4** — Admin workspace (auth, queue, editor, locked_fields, moderation)
- [x] **Step 5** — Google Places sync + admin trigger
- [x] **Step 6** — SEO pass, footer disclaimer, ad slots, Vercel deploy notes (see [DEPLOY.md](DEPLOY.md))
