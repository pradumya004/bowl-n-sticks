"use server";
import { createClient } from "@/lib/supabase/server";
import { refreshMenu, dbFailure } from "./shared";

// Each action returns the reason it failed, or nothing at all on success.
const GONE = "That dish no longer exists. Refresh the page.";

// Shared parsing for the dish form (used by create + update).
// Not exported: a "use server" file may only export async functions.
function itemFromForm(formData) {
  const price = formData.get("price")?.toString().trim();
  const protein = formData.get("protein_g")?.toString().trim();
  const badges = formData.get("badges")?.toString().trim();
  return {
    name: formData.get("name")?.toString().trim(),
    description: formData.get("description")?.toString().trim() || null,
    price: price ? Number(price) : null, // blank price = shows as "MRP"
    diet_type: formData.get("diet_type")?.toString() || "veg",
    is_spicy: formData.get("is_spicy") === "on", // unchecked boxes aren't submitted
    protein_g: protein ? Number(protein) : null,
    badges: badges
      ? badges
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [],
    is_featured: formData.get("is_featured") === "on",
  };
}

// Why the dish can't be saved, or null. Number() turns junk into NaN, which
// Postgres would reject with a message nobody can read.
function itemProblem(fields) {
  if (!fields.name) return "Name is required.";
  if (fields.price !== null && !(Number.isFinite(fields.price) && fields.price >= 0)) {
    return "Price must be a number (or leave it blank for MRP).";
  }
  if (fields.protein_g !== null && !(Number.isFinite(fields.protein_g) && fields.protein_g >= 0)) {
    return "Protein must be a number (or leave it blank).";
  }
  return null;
}

export async function createItem(formData) {
  const supabase = await createClient();
  const sectionId = formData.get("menu_section_id")?.toString();
  const fields = itemFromForm(formData);
  if (!sectionId) return "Missing section id.";
  const problem = itemProblem(fields);
  if (problem) return problem;

  const { data: last, error: lastError } = await supabase
    .from("menu_item")
    .select("sort_order")
    .eq("menu_section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return dbFailure("createItem/sort_order", lastError);

  const { error } = await supabase.from("menu_item").insert({
    ...fields,
    menu_section_id: sectionId,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) return dbFailure("createItem", error);

  refreshMenu();
}

export async function updateItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const fields = itemFromForm(formData);
  if (!id) return "Missing dish id.";
  const problem = itemProblem(fields);
  if (problem) return problem;

  // .select("id") so we can tell a real update from one that matched no rows -
  // without it, editing a dish someone else deleted reports success.
  const { data, error } = await supabase
    .from("menu_item")
    .update(fields)
    .eq("id", id)
    .select("id");
  if (error) return dbFailure("updateItem", error);
  if (!data?.length) return GONE;

  refreshMenu();
}

export async function toggleItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  if (!id) return "Missing dish id.";

  const { data, error } = await supabase
    .from("menu_item")
    .update({ active: !active })
    .eq("id", id)
    .select("id");
  if (error) return dbFailure("toggleItem", error);
  if (!data?.length) return GONE;

  refreshMenu();
}

// Takes the full list of dish ids in their new order. See reorderSections.
export async function reorderItems(ids) {
  const supabase = await createClient();
  if (!Array.isArray(ids) || ids.length === 0) {
    return "Nothing to reorder.";
  }

  const { data, error } = await supabase.rpc("reorder_menu_items", { ids });
  if (error) return dbFailure("reorderItems", error);
  if (data !== ids.length) {
    return "The menu changed while you were dragging. Refresh the page.";
  }

  refreshMenu();
}

export async function deleteItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return "Missing dish id.";

  const { data, error } = await supabase
    .from("menu_item")
    .delete()
    .eq("id", id)
    .select("id"); // cascades to its options
  if (error) return dbFailure("deleteItem", error);
  if (!data?.length) return "That dish was already deleted.";

  refreshMenu();
}
