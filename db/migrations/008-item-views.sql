-- Bowl n Sticks - migration 008: item views
-- Supabase SQL Editor · Name: "008 - item views"
-- Description: Allows 'item_view' events, adds record_item_views() to write a
-- whole screenful in one call, and adds top_dishes to analytics_summary.
-- Mirrored into schema.sql.
--
-- Why a batch function: a diner scrolling the menu sees dozens of dishes. One
-- HTTP call per dish would be absurd on a phone on cafe wifi. The browser
-- collects what was actually looked at and sends the list once.

alter table analytics_event
drop constraint if exists analytics_event_type_check;

alter table analytics_event add constraint analytics_event_type_check check (
  type in ('menu_open', 'section_view', 'item_view', 'search')
);

create index if not exists analytics_event_item_idx on analytics_event (item_id)
where
  item_id is not null;

-- Same narrow-door pattern as record_event: security definer, but it can only
-- insert item_view rows for one cafe, and the array is capped so a hostile
-- caller cannot write a million rows in one request.
create or replace function record_item_views (p_cafe_slug text, p_item_ids uuid[]) returns void language plpgsql security definer
set
  search_path = public as $$
declare
  v_cafe uuid;
begin
  if p_item_ids is null or array_length(p_item_ids, 1) is null then
    return;
  end if;
  if array_length(p_item_ids, 1) > 60 then
    raise exception 'too many items in one call';
  end if;

  select id into v_cafe from cafe where slug = p_cafe_slug and active;
  if v_cafe is null then
    return;
  end if;

  -- The join to menu_item means an id that is not a real dish is dropped
  -- rather than stored, so the table cannot be filled with junk uuids.
  insert into analytics_event (cafe_id, type, item_id)
  select v_cafe, 'item_view', mi.id
  from unnest(p_item_ids) as given (id)
  join menu_item mi on mi.id = given.id;
end;
$$;

revoke all on function record_item_views (text, uuid[])
from
  public;

grant
execute on function record_item_views (text, uuid[]) to anon,
authenticated;
