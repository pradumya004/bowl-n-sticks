-- Bowl n Sticks - DB schema
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
  sort_order int not null default 0, -- controls display order (low first)
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index: speeds up "get a cafe's sections in display order"
create index if not exists menu_section_cafe_order_idx on menu_section (cafe_id, sort_order);

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
  image_url text,
  video_url text,
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
