"use server";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/storage";
import { refreshMenu, dbFailure, logFailure } from "./shared";

// The FILE never passes through here. The browser uploads it straight to
// Storage and then calls this with just the resulting path.
//
// Why: a Server Action request body is capped at 1 MB by Next, and at 4.5 MB by
// Vercel regardless of what Next is configured to allow. A phone photo is
// bigger than both, so routing the bytes through the app server cannot work -
// and would be wasteful even if it did.
//
// Safe because the browser client carries the admin's session, so the upload is
// `authenticated` and the same storage RLS policies apply. The bucket enforces
// the 5 MB cap and the mime allowlist itself.

// Shapes we are willing to accept. The browser picks the filename, so this is
// checked here too rather than trusted.
const PATH_RE = /^(items|sections)\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

// Best-effort: the row already points at the new photo, so a failed cleanup
// leaves an orphan file, not a broken menu.
async function removeQuietly(supabase, path) {
  if (!path) {
    return;
  }
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) logFailure("storage cleanup", error);
}

async function setImage(table, formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const path = formData.get("path")?.toString();
  if (!id || !path) {
    return "Missing id or path.";
  }
  if (!PATH_RE.test(path)) {
    return "That upload didn't look right. Try again.";
  }

  const { data: row, error: readError } = await supabase
    .from(table)
    .select("image_path")
    .eq("id", id)
    .maybeSingle();
  if (readError) return dbFailure(`${table} photo read`, readError);
  if (!row) {
    await removeQuietly(supabase, path);
    return "That row no longer exists. Refresh the page.";
  }

  const { data: saved, error: saveError } = await supabase
    .from(table)
    .update({ image_path: path })
    .eq("id", id)
    .select("id");
  if (saveError || !saved?.length) {
    // The file is already in Storage but nothing points at it, so take it back.
    await removeQuietly(supabase, path);
    return saveError
      ? dbFailure(`${table} photo save`, saveError)
      : "That row no longer exists. Refresh the page.";
  }

  // Only now is the old file safe to drop.
  await removeQuietly(supabase, row.image_path);
  refreshMenu();
}

async function clearImage(table, formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) {
    return "Missing id.";
  }

  const { data: row, error: readError } = await supabase
    .from(table)
    .select("image_path")
    .eq("id", id)
    .maybeSingle();
  if (readError) return dbFailure(`${table} photo read`, readError);
  if (!row) {
    return "That row no longer exists. Refresh the page.";
  }

  const { data: saved, error } = await supabase
    .from(table)
    .update({ image_path: null })
    .eq("id", id)
    .select("id");
  if (error) return dbFailure(`${table} photo clear`, error);
  if (!saved?.length) {
    return "That row no longer exists. Refresh the page.";
  }

  await removeQuietly(supabase, row.image_path);
  refreshMenu();
}

export async function setItemImage(formData) {
  return setImage("menu_item", formData);
}

export async function removeItemImage(formData) {
  return clearImage("menu_item", formData);
}

export async function setSectionImage(formData) {
  return setImage("menu_section", formData);
}

export async function removeSectionImage(formData) {
  return clearImage("menu_section", formData);
}
