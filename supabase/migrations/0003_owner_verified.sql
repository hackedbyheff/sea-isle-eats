-- Adds an "owner-verified" flag: set true when a restaurant owner/manager has
-- claimed the listing and confirmed its info. Surfaced as a public badge.
alter table restaurants add column if not exists owner_verified boolean default false;
