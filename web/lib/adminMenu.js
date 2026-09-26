import { createClient } from "@/lib/supabase/server";
import { logData } from "@/lib/debug";

const CAFE_SLUG = "bowl-n-sticks";

// Admin read: every section (active AND hidden) with its item count.
// Uses the server client, which carries the logged-in session, so RLS lets us see hidden rows too (as public anon only ever sees active rows).
export async function getAdminSections() {
  const supabase = await createClient();

  // Throw rather than return [] on a DB failure: an empty list would quietly
  // tell the owner they have no sections, which is a much worse lie than a crash.
  const { data: cafe, error: cafeError } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();

  if (cafeError) {
    throw cafeError;
  }
  if (!cafe) {
    return [];
  }

  const { data, error } = await supabase
    .from("menu_section")
    .select("id, name, slug, blurb, sort_order, active, menu_item(count)")
    .eq("cafe_id", cafe.id)
    .order("sort_order");

  if (error) {
    throw error;
  }

  // menu_item(count) comes back as [{ count: N }], so we need to flatten it to a plain number.
  return (data ?? []).map((s) => ({
    ...s,
    itemCount: s.menu_item?.[0]?.count ?? 0,
  }));
}

// Admin read: one section with ALL its items (active + hidden), in display order.
// Looked up by slug and scoped to the cafe - slugs are unique per cafe, not globally.
export async function getAdminSection(slug) {
  const supabase = await createClient();

  const { data: cafe, error: cafeError } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();

  if (cafeError) {
    throw cafeError;
  }
  if (!cafe) {
    return null;
  }

  const { data, error } = await supabase
    .from("menu_section")
    .select(
      `id, name, blurb, active, sort_order, items:menu_item (id, name, description, price, diet_type, is_spicy, protein_g, badges, is_featured, active, sort_order, options:menu_item_option (id, label, price, is_delta, sort_order))`,
    )
    .eq("cafe_id", cafe.id)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  logData("getAdminSection: raw row from Postgres", data);

  return {
    ...data,
    items: [...(data.items ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        ...item,
        options: [...(item.options ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      })),
  };
}
