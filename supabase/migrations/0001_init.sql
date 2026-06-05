-- Sea Isle Eats — initial schema + Row Level Security
-- Apply via the Supabase SQL editor, or: supabase db push
--
-- Auth model: a single admin signs in via Supabase Auth (magic link). Any
-- authenticated user is treated as an admin (the only accounts that exist are
-- the VA/admin). The public (anon role) can read published listings and submit
-- to the suggestion/claim queues, nothing more.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type listing_status as enum ('unverified', 'needs_call', 'verified');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null,
  cuisine text,
  price_level smallint,            -- 1=$ 2=$$ 3=$$$ 4=$$$$
  rating numeric(2,1),
  phone text,
  address text,
  lat double precision,
  lng double precision,
  hours jsonb,                     -- [{ "day": 1, "ranges": [["11:00","22:00"]] }]
  accepts_cash boolean default true,
  accepts_cards boolean,
  online_ordering boolean default false,
  menu_url text,                   -- link to FB/Insta/website menu
  order_url text,                  -- link to their online ordering
  description text,                -- from Google editorialSummary, editable
  status listing_status default 'unverified',
  published boolean default false,
  featured boolean default false,  -- sponsored/featured: sorts first on the public site
  locked_fields text[] default '{}',   -- fields a human edited; sync skips these
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- public-submitted correction
create table suggestions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  field text,
  suggested_value text,
  note text,
  submitter_email text,
  status text default 'pending',   -- pending | applied | rejected
  created_at timestamptz default now()
);

-- owner "claim this listing" request (review is manual; does NOT auto-grant edit rights)
create table listing_claims (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  claimant_name text,
  claimant_email text not null,
  message text,
  status text default 'pending',   -- pending | approved | rejected
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index restaurants_published_idx on restaurants (published);
create index restaurants_status_idx on restaurants (status);
create index suggestions_status_idx on suggestions (status);
create index listing_claims_status_idx on listing_claims (status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger restaurants_set_updated_at
  before update on restaurants
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table restaurants enable row level security;
alter table suggestions enable row level security;
alter table listing_claims enable row level security;

-- restaurants: public reads only published rows; authenticated admins do anything.
create policy "restaurants public read published"
  on restaurants for select
  to anon, authenticated
  using (published = true);

create policy "restaurants admin all"
  on restaurants for all
  to authenticated
  using (true)
  with check (true);

-- suggestions: anyone may insert (the public form); only admins may read/update.
create policy "suggestions public insert"
  on suggestions for insert
  to anon, authenticated
  with check (true);

create policy "suggestions admin read"
  on suggestions for select
  to authenticated
  using (true);

create policy "suggestions admin update"
  on suggestions for update
  to authenticated
  using (true)
  with check (true);

-- listing_claims: anyone may insert; only admins may read/update.
create policy "listing_claims public insert"
  on listing_claims for insert
  to anon, authenticated
  with check (true);

create policy "listing_claims admin read"
  on listing_claims for select
  to authenticated
  using (true);

create policy "listing_claims admin update"
  on listing_claims for update
  to authenticated
  using (true)
  with check (true);

-- NOTE: The "restaurants admin all" policy uses `using (true)` for the
-- authenticated role because the only accounts are admins. If you ever open
-- sign-up to the public, tighten this to check an explicit allowlist / role
-- (e.g. an `admins` table or a custom JWT claim) before launch.
