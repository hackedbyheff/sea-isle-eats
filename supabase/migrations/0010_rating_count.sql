-- Review count (Google userRatingCount), to power a weighted "local favorites"
-- ranking instead of raw star score.
alter table restaurants add column if not exists rating_count integer;
