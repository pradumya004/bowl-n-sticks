import { supabase } from "@/lib/supabase/public";

const CAFE_SLUG = "bowl-n-sticks";

// Fetches the cafe info + every section, each with its items, each with its options, all in one round trip. Runs on the server (called from page.js)
export async function getMenu() {
  const [cafeRes, sectionsRes] = await Promise.all([
    supabase
      .from("cafe")
      .select("name, tagline, timings, socials, rules")
      .eq("slug", CAFE_SLUG)
      .maybeSingle(), // one row as an object, or null if the cafe is missing
      // (maybeSingle, not single, so an empty DB returns null gracefully
      //  instead of throwing and crashing the build/page)
    supabase
      .from("menu_section")
      .select(
        // "items:" and "options:" rename the nested tables to friendlier keys
        `id, name, blurb, sort_order,
         items:menu_item (
           id, name, description, price, diet_type, is_spicy, protein_g, badges, is_featured, sort_order,
           options:menu_item_option ( label, price, is_delta, sort_order )
         )`,
      )
      .order("sort_order"), // sections in display order
  ]);

  if (cafeRes.error) {
    throw cafeRes.error;
  }
  if (sectionsRes.error) {
    throw sectionsRes.error;
  }

  // Sort the nested items + options by their sort_order. RLS already hides inactive rows.
  const sections = (sectionsRes.data ?? []).map((section) => ({
    ...section,
    items: [...(section.items ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        ...item,
        options: [...(item.options ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      })),
  }));
  return { cafe: cafeRes.data, sections };
}

// Look up one table by its code (e.g. "T1").
// Returns {code, label} or null if not found.
export async function getTable(code) {
  const { data } = await supabase
    .from("dining_table")
    .select("code, label")
    .eq("code", code)
    .maybeSingle(); // null instead of an error when no row matches
  return data;
}
