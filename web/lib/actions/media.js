"use server";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/storage";
import { refreshMenu, dbFailure, logFailure } from "./shared";

// Mirrors the bucket's own limits. The bucket rejects anything outside these
// too; checking here just produces a message a person can read.
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function fileProblem(file) {
  if (!file || typeof file.size !== "number" || file.size === 0) {
    return "Choose a photo first.";
  }
  if (!TYPES[file.type]) {
    return "That file type isn't supported. Use JPG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_BYTES) {
    return `That photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`;
  }
  return null;
}

// A fresh random name on every upload, never the row id alone. Reusing a path
// would serve the OLD photo from the CDN cache for hours after a replace.
function newPath(folder, ext) {
  return `${folder}/${crypto.randomUUID()}.${ext}`;
}

// Removing the old file is best-effort: the row already points at the new photo,
// so a failed cleanup leaves an orphan, not a broken menu.
async function removeQuietly(supabase, path) {
  if (!path) {
    return;
  }
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) logFailure("storage cleanup", error);
}

async function uploadFor(table, folder, formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const file = formData.get("file");
  if (!id) {
    return "Missing id.";
  }
  const problem = fileProblem(file);
  if (problem) {
    return problem;
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

  const path = newPath(folder, TYPES[file.type]);
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    logFailure(`${table} photo upload`, uploadError);
    return "The photo didn't upload. Check your connection and try again.";
  }

  // Point the row at the new file BEFORE deleting the old one. If this fails we
  // have an unused file, which is harmless; the other order loses the photo.
  const { data: saved, error: saveError } = await supabase
    .from(table)
    .update({ image_path: path })
    .eq("id", id)
    .select("id");
  if (saveError || !saved?.length) {
    await removeQuietly(supabase, path);
    return saveError
      ? dbFailure(`${table} photo save`, saveError)
      : "That row no longer exists. Refresh the page.";
  }

  await removeQuietly(supabase, row.image_path);
  refreshMenu();
}

async function removeFor(table, formData) {
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

export async function uploadItemImage(formData) {
  return uploadFor("menu_item", "items", formData);
}

export async function removeItemImage(formData) {
  return removeFor("menu_item", formData);
}

export async function uploadSectionImage(formData) {
  return uploadFor("menu_section", "sections", formData);
}

export async function removeSectionImage(formData) {
  return removeFor("menu_section", formData);
}
