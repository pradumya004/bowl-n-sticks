import { createClient } from "@/lib/supabase/server";
import { CAFE_SLUG } from "@/lib/cafe";

// The cafe's own details, for the settings screen. Everything the customer sees
// in the hero and the footer comes from this one row, which is why the brand
// name is nowhere in the code: renaming the cafe is a form submission.
export async function getCafe() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cafe")
    .select(
      "id, name, tagline, timings, address, maps_url, phone, socials, rules",
    )
    .eq("slug", CAFE_SLUG)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}
