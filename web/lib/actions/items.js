"use server";
import { createClient } from "@/lib/supabase/server";
import { refreshMenu } from "./shared";

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

export async function createItem(formData) {
  const supabase = await createClient();
  const sectionId = formData.get("menu_section_id")?.toString();
  const fields = itemFromForm(formData);
  if (!sectionId || !fields.name) return;

  const { data: last } = await supabase
    .from("menu_item")
    .select("sort_order")
    .eq("menu_section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("menu_item").insert({
    ...fields,
    menu_section_id: sectionId,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  refreshMenu();
}

export async function updateItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const fields = itemFromForm(formData);
  if (!id || !fields.name) return;

  await supabase.from("menu_item").update(fields).eq("id", id);
  refreshMenu();
}

export async function toggleItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  if (!id) return;

  await supabase.from("menu_item").update({ active: !active }).eq("id", id);
  refreshMenu();
}

export async function deleteItem(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("menu_item").delete().eq("id", id); // cascades to its options
  refreshMenu();
}
