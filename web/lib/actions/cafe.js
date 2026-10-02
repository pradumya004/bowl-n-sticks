"use server";
import { createClient } from "@/lib/supabase/server";
import { CAFE_SLUG } from "@/lib/cafe";
import { refreshMenu, dbFailure } from "./shared";

// Rules arrive as a textarea, one per line. Blank lines are dropped so a stray
// return key doesn't put an empty bullet on the customer's menu.
function linesToArray(value) {
  return (value ?? "")
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function clean(formData, key, max = 200) {
  const value = formData.get(key)?.toString().trim();
  return value ? value.slice(0, max) : null;
}

export async function updateCafe(formData) {
  const supabase = await createClient();

  const name = clean(formData, "name", 60);
  if (!name) {
    return "The cafe needs a name.";
  }

  const mapsUrl = clean(formData, "maps_url", 400);
  // Only http(s). A javascript: url here would end up as a link on a page every
  // customer opens.
  if (mapsUrl && !/^https?:\/\//i.test(mapsUrl)) {
    return "The maps link must start with http:// or https://";
  }

  const fields = {
    name,
    tagline: clean(formData, "tagline", 160),
    timings: clean(formData, "timings", 120),
    address: clean(formData, "address", 240),
    maps_url: mapsUrl,
    phone: clean(formData, "phone", 24),
    // jsonb column: nulls stripped so an empty field doesn't render an empty link
    socials: Object.fromEntries(
      Object.entries({
        instagram: clean(formData, "instagram", 60)?.replace(/^@/, "") ?? null,
        zomato: clean(formData, "zomato", 60),
        swiggy: clean(formData, "swiggy", 60),
      }).filter(([, v]) => v),
    ),
    rules: linesToArray(formData.get("rules")),
  };

  const { data, error } = await supabase
    .from("cafe")
    .update(fields)
    .eq("slug", CAFE_SLUG)
    .select("id");
  if (error) return dbFailure("updateCafe", error);
  if (!data?.length) {
    return "Cafe not found in the database.";
  }

  refreshMenu();
}
