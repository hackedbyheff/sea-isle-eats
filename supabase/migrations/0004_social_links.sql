-- Social / web presence links (human-filled, like menu_url / order_url).
alter table restaurants add column if not exists website_url text;
alter table restaurants add column if not exists facebook_url text;
alter table restaurants add column if not exists instagram_url text;
