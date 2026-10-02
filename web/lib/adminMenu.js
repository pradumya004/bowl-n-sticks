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
    .select("id, name, slug, blurb, sort_order, active, image_path, menu_item(count)")
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
      `id, name, blurb, active, sort_order, image_path, items:menu_item (id, name, description, price, diet_type, is_spicy, protein_g, badges, is_featured, active, sort_order, image_path, options:menu_item_option (id, label, price, is_delta, sort_order))`,
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

// Counts for the dashboard's "needs attention" panel. Each one is a thing the
// owner can actually go and fix, which is the only reason to show a number.
// head: true means Postgres returns the count without sending any rows.
export async function getMenuHealth() {
  const supabase = await createClient();

  const { data: cafe } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();

  if (!cafe) {
    return { noPhoto: 0, noPrice: 0, hiddenItems: 0 };
  }

  // !inner turns the embedded section into a join, so the filter on cafe_id
  // applies. Without it these counts would span every cafe once we franchise.
  const base = () =>
    supabase
      .from("menu_item")
      .select("id, menu_section!inner(cafe_id)", { count: "exact", head: true })
      .eq("menu_section.cafe_id", cafe.id);

  const [noPhoto, noPrice, hiddenItems] = await Promise.all([
    base().is("image_path", null),
    base().is("price", null),
    base().eq("active", false),
  ]);

  return {
    noPhoto: noPhoto.count ?? 0,
    noPrice: noPrice.count ?? 0,
    hiddenItems: hiddenItems.count ?? 0,
  };
}

// The "needs attention" rows on the dashboard each open one of these. A count
// with nowhere to go is useless: clicking "1 dish has no price" should say
// WHICH dish and take you to it.
export const NEEDS = {
  "no-photo": {
    title: "Dishes with no photo",
    note: "A photo is the single biggest thing that makes a menu look finished.",
  },
  "no-price": {
    title: "Dishes with no price",
    note: 'These render as "MRP" on the customer menu.',
  },
  "hidden-dishes": {
    title: "Hidden dishes",
    note: "Customers cannot see these. Row-level security hides them at the database, not just in the UI.",
  },
  "hidden-sections": {
    title: "Hidden sections",
    note: "A hidden section takes everything inside it off the menu too.",
  },
  "empty-sections": {
    title: "Sections with no dishes",
    note: "An empty section never appears on the customer menu.",
  },
};

export async function getNeeds(kind) {
  const spec = NEEDS[kind];
  if (!spec) {
    return null;
  }

  const supabase = await createClient();
  const { data: cafe } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();
  if (!cafe) {
    return { ...spec, kind, rows: [] };
  }

  // Sections and dishes are different shapes, so each branch returns the same
  // {id, name, where, href} and the page stays simple.
  if (kind === "hidden-sections" || kind === "empty-sections") {
    const { data } = await supabase
      .from("menu_section")
      .select("id, name, slug, active, menu_item(count)")
      .eq("cafe_id", cafe.id)
      .order("sort_order");

    const rows = (data ?? [])
      .map((s) => ({ ...s, itemCount: s.menu_item?.[0]?.count ?? 0 }))
      .filter((s) =>
        kind === "hidden-sections" ? !s.active : s.itemCount === 0,
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        where: `${s.itemCount} ${s.itemCount === 1 ? "dish" : "dishes"}`,
        href: `/admin/sections/${s.slug}`,
      }));

    return { ...spec, kind, rows };
  }

  let query = supabase
    .from("menu_item")
    .select("id, name, menu_section!inner(name, slug, cafe_id)")
    .eq("menu_section.cafe_id", cafe.id)
    .order("name");

  if (kind === "no-photo") query = query.is("image_path", null);
  if (kind === "no-price") query = query.is("price", null);
  if (kind === "hidden-dishes") query = query.eq("active", false);

  const { data } = await query;

  return {
    ...spec,
    kind,
    rows: (data ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      where: i.menu_section.name,
      // the #item- anchor scrolls to and highlights the exact card
      href: `/admin/sections/${i.menu_section.slug}#item-${i.id}`,
    })),
  };
}
