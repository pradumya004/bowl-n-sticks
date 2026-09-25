"use server";
import { createClient } from "@/lib/supabase/server";
import { getCafeId, refreshMenu } from "./shared";

export async function createSection(formData) {
  const supabase = await createClient();
  const cafeId = await getCafeId(supabase);
  const name = formData.get("name")?.toString().trim();
  const blurb = formData.get("blurb")?.toString().trim() || null;
  if (!cafeId || !name) return;

  // place the new section at the end (max sort_order + 1)
  const { data: last } = await supabase
    .from("menu_section")
    .select("sort_order")
    .eq("cafe_id", cafeId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("menu_section").insert({
    cafe_id: cafeId,
    name,
    blurb,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  refreshMenu();
}

export async function updateSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const blurb = formData.get("blurb")?.toString().trim() || null;
  if (!id || !name) return;

  await supabase.from("menu_section").update({ name, blurb }).eq("id", id);
  refreshMenu();
}

export async function toggleSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  if (!id) return;

  await supabase.from("menu_section").update({ active: !active }).eq("id", id);
  refreshMenu();
}

export async function deleteSection(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("menu_section").delete().eq("id", id); // cascades to its items
  refreshMenu();
}
