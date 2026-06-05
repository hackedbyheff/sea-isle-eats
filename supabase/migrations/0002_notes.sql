-- Add an internal notes / call-log field used by the admin workspace.
-- Not shown on the public site; not managed by the Google sync.
alter table restaurants add column if not exists notes text;
