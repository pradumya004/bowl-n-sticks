import { createClient } from "@/lib/supabase/server";

const CAFE_SLUG = "bowl-n-sticks";

// Admin read: every section (active AND hidden) with its item count.
// Uses the server client, which carries the logged-in session, so RLS lets us see hidden rows too (as public anon only ever sees active rows).
export async function getAdminSections() {
  const supabase = await createClient();

  const { data: cafe } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();

  if (!cafe) {
    return [];
  }

  const { data, error } = await supabase
    .from("menu_section")
    .select("id, name, blurb, sort_order, active, menu_item(count)")
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
export async function getAdminSection(sectionId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_section")
    .select(
      `id, name, blurb, active, sort_order, items:menu_item (id, name, description, price, diet_type, is_spicy, protein_g, badges, is_featured, active, sort_order)`,
    )
    .eq("id", sectionId)
    .maybeSingle();

  // A malformed id (not a UUID) makes Postgres error, so treat any failure here
  // as "no such section" and let the page 404 instead of crashing with a 500.
  if (error || !data) {
    return null;
  }

  return {
    ...data,
    items: [...(data.items ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}
