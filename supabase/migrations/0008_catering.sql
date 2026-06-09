-- Catering: a service flag (tag) + a first-party catering link (button).
-- Human-filled — Google doesn't provide these.
alter table restaurants add column if not exists catering boolean;
alter table restaurants add column if not exists catering_url text;
