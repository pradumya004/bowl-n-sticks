"use server";
import { createClient } from "@/lib/supabase/server";
import { dbFailure, refreshMenu } from "./shared";

// Each action returns the reason it failed, or nothing at all on success.
const GONE = "That option no longer exists. Refresh the page.";

// Shared parsing for the option form (create + update).
// Not exported: a "use server" file may only export async functions.
function optionFromForm(formData) {
  const price = formData.get("price")?.toString().trim();
  return {
    label: formData.get("label")?.toString().trim(),
    price: price ? Number(price) : 0, // price is NOT NULL in the db
    is_delta: formData.get("price_mode")?.toString() !== "absolute",
  };
}

// Why the option can't be saved, or null.
// The db has check (price >= 0), so a bad number would fail the write.
function optionProblem(fields) {
  if (!fields.label) {
    return "Label is required.";
  }
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return "Price must be a number, 0 or more.";
  }
  return null;
}

export async function createOption(formData) {
  const supabase = await createClient();
  const itemId = formData.get("menu_item_id")?.toString();
  const fields = optionFromForm(formData);
  if (!itemId) {
    return "Missing dish id.";
  }
  const problem = optionProblem(fields);
  if (problem) {
    return problem;
  }

  const { data: last, error: lastError } = await supabase
    .from("menu_item_option")
    .select("sort_order")
    .eq("menu_item_id", itemId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) {
    return dbFailure("createOption/sort_order", lastError);
  }

  const { error } = await supabase.from("menu_item_option").insert({
    ...fields,
    menu_item_id: itemId,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) {
    return dbFailure("createOption", error);
  }

  refreshMenu();
}

export async function updateOption(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const fields = optionFromForm(formData);
  if (!id) {
    return "Missing option id.";
  }
  const problem = optionProblem(fields);
  if (problem) {
    return problem;
  }

  // .select("id") so we can tell a real update from one that matched no rows.
  const { data, error } = await supabase
    .from("menu_item_option")
    .update(fields)
    .eq("id", id)
    .select("id");
  if (error) {
    return dbFailure("updateOption", error);
  }
  if (!data?.length) {
    return GONE;
  }

  refreshMenu();
}

export async function deleteOption(formData) {
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) {
    return "Missing option id.";
  }

  const { data, error } = await supabase
    .from("menu_item_option")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    return dbFailure("deleteOption", error);
  }
  if (!data?.length) {
    return "That option was already deleted.";
  }

  refreshMenu();
}
