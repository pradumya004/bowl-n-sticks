-- Bowl n Sticks - migration 007: cafe contact details
-- Supabase SQL Editor · Name: "007 - cafe contact"
-- Description: Adds address, maps_url and phone to cafe, so the live menu's
-- footer can show where the place is and how to reach it, and the owner can
-- edit all of it from the admin panel. Mirrored into schema.sql.

alter table cafe
add column if not exists address text;

alter table cafe
add column if not exists maps_url text;

alter table cafe
add column if not exists phone text;
