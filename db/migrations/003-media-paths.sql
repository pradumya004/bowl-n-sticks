-- Bowl n Sticks - migration 003: media paths
-- Supabase SQL Editor · Name: "003 - media paths"
-- Description: Renames menu_item.image_url/video_url to image_path/video_path
-- and adds menu_section.image_path. We store the object's path inside the
-- bucket, not a full URL. Mirrored into schema.sql.
--
-- Why a path and not a URL: a full URL hard-codes the Supabase project ref.
-- This project moved accounts once already (bxwfcyhl... -> weamsyku...), which
-- would have broken every stored URL. The project URL is an env var; the code
-- joins the two when it renders.

alter table menu_item
rename column image_url to image_path;

alter table menu_item
rename column video_url to video_path;

-- Sections can carry a banner image too (menu_section had no media column).
alter table menu_section
add column if not exists image_path text;
