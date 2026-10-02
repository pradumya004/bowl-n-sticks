-- Bowl n Sticks - DB schema
-- Supabase SQL Editor · Name: "01 - init schema"
-- Description: Creates the diet_type enum, the menu tables, the updated_at
-- triggers, and the public read-only RLS policies. Run FIRST on a new project.
-- ─────────────────────────────────────────────────────────────
-- Enum: a dish's diet type - veg/egg/non-veg.
-- Postgres does not have a "CREATE TYPE IF NOT EXISTS", so we wrap it up
-- in a one-off code block (do $$ ... $$) that creates it if it is missing.
-- pg_type = Postgres's built-in catalog of all data types.
-- typname = The column in that catalog holding each type's name.
-- ─────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'diet_type') then
    create type diet_type as enum ('veg', 'egg', 'nonveg');
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- cafe - one row per cafe (if, in future, it needs to be franchised)
-- The brand name/logo is stored here, not in code.
-- ─────────────────────────────────────────────────────────────
create table if not exists cafe (
  id uuid primary key default gen_random_uuid (), -- auto-generated unique id
  slug text unique not null, -- url-safe id, e.g. 'bowl-n-sticks'
  name text not null,
  tagline text,
  logo_url text,
  address text, -- shown in the menu footer
  maps_url text, -- Google Maps link for the address
  phone text,
  timings text,
  socials jsonb not null default '{}'::jsonb, -- flexible bag: { instagram, zomato, swiggy }
  rules text[] not null default '{}', -- the "basic rules" list, one string per rule
  active boolean not null default true,
  created_at timestamptz not null default now(), -- timestamp WITH timezone
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- menu_section - all the sections that are to be present in the menu
-- ─────────────────────────────────────────────────────────────
create table if not exists menu_section (
  id uuid primary key default gen_random_uuid (),
  cafe_id uuid not null references cafe (id) on delete cascade, -- delete a cafe -> its sections go too
  name text not null,
  blurb text, -- the small description under a section title
  -- URL key for the admin panel, derived from name. Generated: never written to
  -- directly, recomputed by Postgres whenever the section is renamed.
  slug text generated always as (
    trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
  ) stored,
  image_path text, -- optional section banner, path inside the storage bucket
  sort_order int not null default 0, -- controls display order (low first)
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index: speeds up "get a cafe's sections in display order"
create index if not exists menu_section_cafe_order_idx on menu_section (cafe_id, sort_order);

-- Index: slug is the admin URL key. Unique per cafe, not globally, so two
-- branches can each have their own "ramen-dishes".
create unique index if not exists menu_section_cafe_slug_idx on menu_section (cafe_id, slug);

-- ─────────────────────────────────────────────────────────────
-- menu_item - a dish
-- ─────────────────────────────────────────────────────────────
create table if not exists menu_item (
  id uuid primary key default gen_random_uuid (),
  menu_section_id uuid not null references menu_section (id) on delete cascade,
  name text not null,
  description text,
  price numeric(8, 2) check (
    price is null
    or price >= 0
  ), -- null if item only has options
  diet_type diet_type not null default 'veg', -- veg / egg / non-veg marker
  is_spicy boolean not null default false,
  protein_g int check (
    protein_g is null
    or protein_g >= 0
  ), -- e.g. "26g protein"; null otherwise
  image_path text, -- path inside the storage bucket, NOT a full URL
  video_path text,
  badges text[] not null default '{}', -- labels: "Highest selling", "must try", "ALL NEW"
  is_featured boolean not null default false, -- push this one visually (fan favorite)
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index: speeds up "get a section's items in display order".
create index if not exists menu_item_section_order_idx on menu_item (menu_section_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- menu_item_option - sub-choices under an item (combo upgrades/sizes)
-- is_delta = true  -> price is a delta, shown as "+₹<price>" on top of the item's price
-- is_delta = false -> price is the absolute amount for that choice
-- ─────────────────────────────────────────────────────────────
create table if not exists menu_item_option (
  id uuid primary key default gen_random_uuid (),
  menu_item_id uuid not null references menu_item (id) on delete cascade,
  label text not null, -- e.g. "Make it Cheese Pizza"
  price numeric(8, 2) not null default 0 check (price >= 0),
  is_delta boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index: speeds up "get an item's options in display order".
create index if not exists menu_item_option_item_order_idx on menu_item_option (menu_item_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- dining_table - T1..Tn, used by the QR codes + analytics.
-- Named dining_table because "table" is a reserved SQL word.
-- ─────────────────────────────────────────────────────────────
create table if not exists dining_table (
  id uuid primary key default gen_random_uuid (),
  cafe_id uuid not null references cafe (id) on delete cascade,
  code text not null, -- 'T1', 'T2', etc.
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cafe_id, code) -- no two tables share a code within a cafe
);

-- ─────────────────────────────────────────────────────────────
-- Auto-maintain updated_at. A trigger is a function the database runs
-- automatically on an event - here, "before every UPDATE" it stamps
-- updated_at with the current time, so the app never has to remember to.
-- ─────────────────────────────────────────────────────────────
create or replace function set_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cafe_set_updated_at on cafe;

drop trigger if exists menu_section_set_updated_at on menu_section;

drop trigger if exists menu_item_set_updated_at on menu_item;

drop trigger if exists menu_item_option_set_updated_at on menu_item_option;

drop trigger if exists dining_table_set_updated_at on dining_table;

create trigger cafe_set_updated_at before
update on cafe for each row
execute function set_updated_at ();

create trigger menu_section_set_updated_at before
update on menu_section for each row
execute function set_updated_at ();

create trigger menu_item_set_updated_at before
update on menu_item for each row
execute function set_updated_at ();

create trigger menu_item_option_set_updated_at before
update on menu_item_option for each row
execute function set_updated_at ();

create trigger dining_table_set_updated_at before
update on dining_table for each row
execute function set_updated_at ();

-- ─────────────────────────────────────────────────────────────
-- Reordering: rewrite sort_order for a whole list in ONE atomic call, so a
-- drag can never leave a half-applied order. unnest(ids) with ordinality turns
-- the array into (id, position) rows; each row's sort_order becomes its
-- position in the array. Returns how many rows moved.
-- security invoker = runs as the caller, so RLS still applies.
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

-- Postgres grants EXECUTE to PUBLIC by default and Supabase exposes functions
-- over HTTP; take it back and give it only to logged-in users.
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

-- ─────────────────────────────────────────────────────────────
-- Row-Level Security (RLS): with RLS on, every read/write is denied
-- unless a policy allows it. We allow the anonymous public key to READ
-- active rows only, and grant NO write access - so the menu can't be
-- changed with the public key. Admin (logged-in) read/write policies are
-- added deliberately. Seeding in the SQL Editor runs as the
-- table owner, which bypasses RLS.
-- ─────────────────────────────────────────────────────────────
alter table cafe enable row level security;

alter table menu_section enable row level security;

alter table menu_item enable row level security;

alter table menu_item_option enable row level security;

alter table dining_table enable row level security;

drop policy if exists "public read cafe" on cafe;

drop policy if exists "public read menu_section" on menu_section;

drop policy if exists "public read menu_item" on menu_item;

drop policy if exists "public read menu_item_option" on menu_item_option;

drop policy if exists "public read dining_table" on dining_table;

create policy "public read cafe" on cafe for
select
  to anon using (active);

create policy "public read menu_section" on menu_section for
select
  to anon using (active);

create policy "public read menu_item" on menu_item for
select
  to anon using (active);

create policy "public read menu_item_option" on menu_item_option for
select
  to anon using (true);

create policy "public read dining_table" on dining_table for
select
  to anon using (active);

-- ─────────────────────────────────────────────────────────────
-- Analytics (migrations 005 + 006)
-- ─────────────────────────────────────────────────────────────
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
  ),
  days as (
    select generate_series(
      (now() at time zone 'Asia/Kolkata')::date - (p_days - 1),
      (now() at time zone 'Asia/Kolkata')::date,
      interval '1 day'
    )::date as d
  )
  select json_build_object(
    'days', p_days,
    'menu_opens', (select count(*) from scoped where type = 'menu_open'),
    'section_views', (select count(*) from scoped where type = 'section_view'),
    'by_date', coalesce((
      select json_agg(t order by t.d) from (
        select days.d,
               count(s.id) filter (where s.type = 'menu_open') as views
        from days
        left join scoped s on s.local_at::date = days.d
        group by days.d
      ) t
    ), '[]'::json),
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
