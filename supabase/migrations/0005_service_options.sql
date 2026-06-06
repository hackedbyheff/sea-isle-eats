-- Service options. Google Places (New) supplies these, so the sync can fill
-- them; humans can override (and the edit locks them). null = unknown.
alter table restaurants add column if not exists dine_in boolean;
alter table restaurants add column if not exists takeout boolean;
alter table restaurants add column if not exists delivery boolean;
