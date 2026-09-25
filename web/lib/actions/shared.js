import { revalidatePath } from "next/cache";

export const CAFE_SLUG = "bowl-n-sticks";

export async function getCafeId(supabase) {
  const { data } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();
  return data?.id;
}

// The public menu is statically cached, so refresh the whole tree after any
// edit. Without this, customers keep seeing the old menu until a redeploy.
export function refreshMenu() {
  revalidatePath("/", "layout");
}
