-- Bowl n Sticks - migration 005: analytics
-- Supabase SQL Editor · Name: "005 - analytics"
-- Description: Adds analytics_event plus record_event() for writing one and
-- analytics_summary() for reading the dashboard. Customers write only through
-- the function; the table itself is unreachable to them. Mirrored into schema.sql.
--
-- We store NO ip address, NO user agent and NO cookie or device id. A row says
-- what happened, at which table, and when. Nothing identifies a person.

create table if not exists analytics_event (
  -- bigint identity, not uuid: this table outgrows every other one by orders of
  -- magnitude. A uuid key is 16 bytes and arrives in random order, which bloats
  -- the index; a bigint is 8 bytes and always appends.
  id bigint generated always as identity primary key,
  cafe_id uuid not null references cafe (id) on delete cascade,
  type text not null check (type in ('menu_open', 'section_view', 'search')),
  table_code text, -- 'T1'; null when opened without scanning a QR
  section_id uuid references menu_section (id) on delete set null,
  item_id uuid references menu_item (id) on delete set null,
  query text, -- for search events, once search exists
  created_at timestamptz not null default now()
);

-- Every dashboard query is "this cafe, this window", so both indexes lead with
-- cafe_id and sort by time descending.
create index if not exists analytics_event_cafe_time_idx on analytics_event (cafe_id, created_at desc);

create index if not exists analytics_event_type_time_idx on analytics_event (cafe_id, type, created_at desc);

alter table analytics_event enable row level security;

-- Note what is NOT here: no policy for anon. Customers cannot read, insert,
-- update or delete this table directly at all. Their only way in is
-- record_event() below.
drop policy if exists "admin read analytics" on analytics_event;

create policy "admin read analytics" on analytics_event for
select
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────
-- record_event: the single write path for customers.
--
-- security definer is deliberate here, and it is the exception rather than the
-- rule. The alternative is a blanket insert policy on the table for anon, which
-- would let anyone holding the publishable key write arbitrary rows: forged
-- cafe_ids, invented event types, megabyte-long query strings.
--
-- This runs as the owner but is a narrow, validated door: it rejects unknown
-- event types, resolves cafe_id itself so the caller cannot choose one, and
-- truncates the free-text fields. It can do nothing except insert one
-- well-formed row.
-- ─────────────────────────────────────────────────────────────
create or replace function record_event (
  p_cafe_slug text,
  p_type text,
  p_table_code text default null,
  p_section_id uuid default null,
  p_query text default null
) returns void language plpgsql security definer
set
  search_path = public as $$
declare
  v_cafe uuid;
begin
  if p_type not in ('menu_open', 'section_view', 'search') then
    raise exception 'unknown event type';
  end if;

  select id into v_cafe from cafe where slug = p_cafe_slug and active;
  if v_cafe is null then
    return; -- unknown cafe: drop it rather than erroring at a diner
  end if;

  insert into analytics_event (cafe_id, type, table_code, section_id, query)
  values (
    v_cafe,
    p_type,
    nullif(left(p_table_code, 12), ''),
    p_section_id,
    nullif(left(p_query, 120), '')
  );
end;
$$;

revoke all on function record_event (text, text, text, uuid, text)
from
  public;

grant
execute on function record_event (text, text, text, uuid, text) to anon,
authenticated;

-- ─────────────────────────────────────────────────────────────
-- analytics_summary: everything the dashboard needs, in one round trip.
-- security invoker, so the admin read policy above still applies.
--
-- Hours and days are converted to Asia/Kolkata first. created_at is stored in
-- UTC, so grouping on it raw would report peak hours five and a half hours off.
-- ─────────────────────────────────────────────────────────────
create or replace function analytics_summary (p_cafe_slug text, p_days int default 30) returns json language sql security invoker stable
set
  search_path = public as $$
  with scoped as (
    select e.*, (e.created_at at time zone 'Asia/Kolkata') as local_at
    from analytics_event e
    join cafe c on c.id = e.cafe_id
    where c.slug = p_cafe_slug
      and e.created_at >= now() - make_interval(days => p_days)
  )
  select json_build_object(
    'days', p_days,
    'menu_opens', (select count(*) from scoped where type = 'menu_open'),
    'section_views', (select count(*) from scoped where type = 'section_view'),
    'by_table', coalesce((
      select json_agg(t) from (
        select coalesce(table_code, 'No table') as table_code, count(*) as views
        from scoped where type = 'menu_open'
        group by 1 order by views desc
      ) t
    ), '[]'::json),
    'top_sections', coalesce((
      select json_agg(t) from (
        select ms.name, count(*) as views
        from scoped s join menu_section ms on ms.id = s.section_id
        where s.type = 'section_view'
        group by ms.name order by views desc limit 8
      ) t
    ), '[]'::json),
    'by_hour', coalesce((
      select json_agg(t order by t.hour) from (
        select extract(hour from local_at)::int as hour, count(*) as views
        from scoped where type = 'menu_open'
        group by 1
      ) t
    ), '[]'::json),
    'by_day', coalesce((
      select json_agg(t order by t.dow) from (
        select extract(isodow from local_at)::int as dow, count(*) as views
        from scoped where type = 'menu_open'
        group by 1
      ) t
    ), '[]'::json)
  );
$$;

revoke all on function analytics_summary (text, int)
from
  public,
  anon;

grant
execute on function analytics_summary (text, int) to authenticated;
