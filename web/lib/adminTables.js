import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { CAFE_SLUG } from "@/lib/cafe";

// The QR codes are generated here, at request time, from the tables in the
// database. The alternative - a folder of PNGs committed to the repo - goes
// stale the moment a table is added or the domain changes.
export async function getTableQrs(baseUrl) {
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
    .from("dining_table")
    .select("id, code, label, active")
    .eq("cafe_id", cafe.id)
    .order("code");
  if (error) {
    throw error;
  }

  return Promise.all(
    (data ?? []).map(async (table) => {
      const url = `${baseUrl}/t/${table.code}`;
      return {
        ...table,
        url,
        // SVG, not PNG: it stays sharp at any print size, and it is just markup
        // so it needs no file and no storage.
        svg: await QRCode.toString(url, {
          type: "svg",
          margin: 2,
          color: { dark: "#141210", light: "#FBF3E7" },
        }),
      };
    }),
  );
}
