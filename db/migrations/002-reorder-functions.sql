-- Bowl n Sticks - migration 002: reorder functions
-- Supabase SQL Editor · Name: "002 - reorder functions"
-- Description: Adds reorder_menu_sections(ids) and reorder_menu_items(ids),
-- which rewrite sort_order for a whole list in one atomic call so a drag never
-- leaves a half-applied order. Mirrored into schema.sql.
--
-- Each returns the number of rows it moved, so the caller can tell a real
-- reorder from one that silently matched nothing (see the RLS note below).

-- ─────────────────────────────────────────────────────────────
-- unnest(ids) with ordinality turns the array into rows of
-- (id, position), so each row's sort_order becomes its position
-- in the array the admin panel sent.
--
-- security invoker (the default, stated for clarity): the function runs as the
-- CALLER, so row-level security still applies. security definer would run it as
-- the owner and bypass RLS entirely, which would let anyone reshuffle the menu.
-- ─────────────────────────────────────────────────────────────
create or replace function reorder_menu_sections (ids uuid[]) returns integer language plpgsql security invoker
set
  search_path = public as $$
declare
  moved integer;
begin
  update menu_section ms
  set sort_order = pos.ord
  from unnest(ids) with ordinality as pos (id, ord)
  where ms.id = pos.id;

  get diagnostics moved = row_count;
  return moved;
end;
$$;

create or replace function reorder_menu_items (ids uuid[]) returns integer language plpgsql security invoker
set
  search_path = public as $$
declare
  moved integer;
begin
  update menu_item mi
  set sort_order = pos.ord
  from unnest(ids) with ordinality as pos (id, ord)
  where mi.id = pos.id;

  get diagnostics moved = row_count;
  return moved;
end;
$$;

-- Postgres grants EXECUTE on new functions to PUBLIC by default, and Supabase
-- exposes them over HTTP. Take that back and hand it only to logged-in users.
-- RLS would already stop an anonymous caller from changing rows, but it would
-- fail silently (0 rows, no error) - better to refuse the call outright.
revoke all on function reorder_menu_sections (uuid[])
from
  public,
  anon;

revoke all on function reorder_menu_items (uuid[])
from
  public,
  anon;

grant
execute on function reorder_menu_sections (uuid[]) to authenticated;

grant
execute on function reorder_menu_items (uuid[]) to authenticated;
