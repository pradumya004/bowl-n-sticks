-- Bowl n Sticks - migration 004: storage bucket
-- Supabase SQL Editor · Name: "004 - storage bucket"
-- Description: Creates the menu-media bucket for dish and section photos, with
-- a size cap and an image-only mime allowlist, plus RLS on storage.objects so
-- the public can read and only logged-in admins can write.
--
-- Storage is not a separate system: a file is a row in storage.objects, so the
-- same row-level security used on menu_item applies here.

-- public = true: customers are never logged in, so their browser must be able
-- to fetch photos anonymously. Public affects READS only; writes still go
-- through the policies below.
insert into
  storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
values
  (
    'menu-media',
    'menu-media',
    true,
    5242880, -- 5 MB. A phone photo is ~3 MB; anything larger is a mistake.
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────
-- Policies. Scoped to bucket_id so they cannot touch any other
-- bucket added later.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "public read menu media" on storage.objects;

create policy "public read menu media" on storage.objects for
select
  to anon,
  authenticated using (bucket_id = 'menu-media');

drop policy if exists "admin upload menu media" on storage.objects;

create policy "admin upload menu media" on storage.objects for insert to authenticated
with
  check (bucket_id = 'menu-media');

drop policy if exists "admin update menu media" on storage.objects;

create policy "admin update menu media" on storage.objects
for update
  to authenticated using (bucket_id = 'menu-media')
with
  check (bucket_id = 'menu-media');

drop policy if exists "admin delete menu media" on storage.objects;

create policy "admin delete menu media" on storage.objects for delete to authenticated using (bucket_id = 'menu-media');
