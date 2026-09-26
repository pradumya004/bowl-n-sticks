-- Bowl n Sticks - migration 001: section slug
-- Supabase SQL Editor · Name: "001 - add section slug"
-- Description: Adds a generated slug column to menu_section so admin URLs read
-- /admin/sections/<slug> instead of a UUID, plus a per-cafe unique index.
--
-- The id stays the primary key; the slug is only a lookup key.
-- Mirrored into schema.sql so a fresh rebuild matches a migrated database.

alter table menu_section
  add column if not exists slug text
  generated always as (
    trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
  ) stored;

-- Unique per cafe, not globally: a second branch also wants a "ramen-dishes".
create unique index if not exists menu_section_cafe_slug_idx
  on menu_section (cafe_id, slug);
