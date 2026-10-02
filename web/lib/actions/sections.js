"use server";
import { createClient } from "@/lib/supabase/server";
import { getCafeId, refreshMenu, dbFailure, logFailure } from "./shared";
import { MEDIA_BUCKET } from "@/lib/storage";

// Each action returns the reason it failed, or nothing at all on success.
const GONE = "That section no longer exists. Refresh the page.";

export async function createSection(formData) {
  const supabase = await createClient();
  const cafeId = await getCafeId(supabase);
  const name = formData.get("name")?.toString().trim();
  const blurb = formData.get("blurb")?.toString().trim() || null;
  if (!cafeId) return "Cafe not found in the database.";
  if (!name) return "Name is required.";

  // place the new section at the end (max sort_order + 1)
  const { data: last, error: lastError } = await supabase
    .from("menu_section")
    .select("sort_order")
    .eq("cafe_id", cafeId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return dbFailure("createSection/sort_order", lastError);

  const { error } = await supabase.from("menu_section").insert({
    cafe_id: cafeId,
    name,
    blurb,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) return dbFailure("createSection", error);

  refreshMenu();
}

export async function updateSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const blurb = formData.get("blurb")?.toString().trim() || null;
  if (!id) return "Missing section id.";
  if (!name) return "Name is required.";

  // .select("id") so we can tell a real update from one that matched no rows -
  // without it, editing a section someone else deleted reports success.
  const { data, error } = await supabase
    .from("menu_section")
    .update({ name, blurb })
    .eq("id", id)
    .select("id");
  if (error) return dbFailure("updateSection", error);
  if (!data?.length) return GONE;

  refreshMenu();
}

export async function toggleSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  if (!id) return "Missing section id.";

  const { data, error } = await supabase
    .from("menu_section")
    .update({ active: !active })
    .eq("id", id)
    .select("id");
  if (error) return dbFailure("toggleSection", error);
  if (!data?.length) return GONE;

  refreshMenu();
}

// Takes the full list of section ids in their new order. The database function
// rewrites every sort_order in one atomic call and returns how many rows it
// moved, so a count that doesn't match means the list we dragged is stale.
export async function reorderSections(ids) {
  const supabase = await createClient();
  if (!Array.isArray(ids) || ids.length === 0) {
    return "Nothing to reorder.";
  }

  const { data, error } = await supabase.rpc("reorder_menu_sections", { ids });
  if (error) return dbFailure("reorderSections", error);
  if (data !== ids.length) {
    return "The menu changed while you were dragging. Refresh the page.";
  }

  refreshMenu();
}

export async function deleteSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return "Missing section id.";

  // Deleting a section cascades to its dishes in Postgres, but storage files
  // are invisible to that cascade. Collect every path first, or they orphan.
  const { data: section } = await supabase
    .from("menu_section")
    .select("image_path, items:menu_item (image_path)")
    .eq("id", id)
    .maybeSingle();

  const paths = [
    section?.image_path,
    ...(section?.items ?? []).map((i) => i.image_path),
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("menu_section")
    .delete()
    .eq("id", id)
    .select("id"); // cascades to its items
  if (error) return dbFailure("deleteSection", error);
  if (!data?.length) return "That section was already deleted.";

  if (paths.length) {
    const { error: fileError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove(paths);
    if (fileError) logFailure("deleteSection photo cleanup", fileError);
  }

  refreshMenu();
}
