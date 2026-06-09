-- Multi-city scoping for Click Click Eat.
-- cities → neighborhoods (optional) → restaurants.

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,        -- e.g. 'sea-isle-city' (used in subdomain/path)
  name text not null,               -- 'Sea Isle City'
  state text,                       -- 'NJ'
  search_query text,                -- Google text search, e.g. 'restaurants in Sea Isle City NJ'
  zips text[] default '{}',         -- locality filter for the sync, e.g. {'08243'}
  timezone text default 'America/New_York',
  lat double precision,
  lng double precision,
  active boolean default true,
  created_at timestamptz default now()
);

-- Optional sub-areas within a city (big cities only). Sea Isle uses none.
create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  slug text not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now(),
  unique (city_id, slug)
);

-- Scope restaurants to a city and (optionally) a neighborhood.
alter table restaurants add column if not exists city_id uuid references cities(id);
alter table restaurants add column if not exists neighborhood_id uuid references neighborhoods(id);

create index if not exists restaurants_city_idx on restaurants (city_id);
create index if not exists neighborhoods_city_idx on neighborhoods (city_id);

-- Seed the first city (Sea Isle City) and backfill every existing restaurant to it.
insert into cities (slug, name, state, search_query, zips, timezone, lat, lng)
values ('sea-isle-city', 'Sea Isle City', 'NJ',
        'restaurants in Sea Isle City NJ', array['08243'],
        'America/New_York', 39.1537, -74.6929)
on conflict (slug) do nothing;

update restaurants
set city_id = (select id from cities where slug = 'sea-isle-city')
where city_id is null;

-- RLS: cities + neighborhoods are public-readable; only admins write.
alter table cities enable row level security;
alter table neighborhoods enable row level security;

create policy "cities public read" on cities
  for select to anon, authenticated using (true);
create policy "cities admin all" on cities
  for all to authenticated using (true) with check (true);

create policy "neighborhoods public read" on neighborhoods
  for select to anon, authenticated using (true);
create policy "neighborhoods admin all" on neighborhoods
  for all to authenticated using (true) with check (true);
