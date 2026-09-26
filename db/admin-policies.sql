-- Bowl n Sticks - admin write access (Phase 4)
-- Supabase SQL Editor · Name: "03 - admin write policies"
-- Description: Grants authenticated (logged-in) users full read + write RLS on
-- every menu table. Public anon stays read-only-active.
--
-- Run in the Supabase SQL Editor after schema + seed.
--
-- Gives any LOGGED-IN (authenticated) user full read + write on every menu
-- table. Signups are disabled, so an authenticated user is always an owner
-- account you created by hand. The public/anon read-only-active policies from
-- schema.sql are left untouched.
--
-- "for all" covers select + insert + update + delete.
-- using (true)      -> may read/update/delete any row.
-- with check (true) -> may insert/update to any values.

drop policy if exists "admin all cafe" on cafe;
create policy "admin all cafe" on cafe
  for all to authenticated using (true) with check (true);

drop policy if exists "admin all menu_section" on menu_section;
create policy "admin all menu_section" on menu_section
  for all to authenticated using (true) with check (true);

drop policy if exists "admin all menu_item" on menu_item;
create policy "admin all menu_item" on menu_item
  for all to authenticated using (true) with check (true);

drop policy if exists "admin all menu_item_option" on menu_item_option;
create policy "admin all menu_item_option" on menu_item_option
  for all to authenticated using (true) with check (true);

drop policy if exists "admin all dining_table" on dining_table;
create policy "admin all dining_table" on dining_table
  for all to authenticated using (true) with check (true);
