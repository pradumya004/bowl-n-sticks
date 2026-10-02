import { createClient } from "@/lib/supabase/client";
import { CAFE_SLUG } from "@/lib/cafe";

// Records one anonymous event. Runs in the browser with the publishable key.
//
// The analytics_event table is unreachable to that key: record_event() is the
// only door, and it validates the type, resolves the cafe itself and truncates
// the text. So a customer can log an event and can neither read the table nor
// write anything malformed into it.
//
// Nothing identifying is sent. No ip, no user agent, no device id, no cookie.
export async function track(type, { tableCode, sectionId, query } = {}) {
  try {
    const supabase = createClient();
    await supabase.rpc("record_event", {
      p_cafe_slug: CAFE_SLUG,
      p_type: type,
      p_table_code: tableCode ?? null,
      p_section_id: sectionId ?? null,
      p_query: query ?? null,
    });
  } catch {
    // Swallowed on purpose. A diner's menu must never break because a stats
    // write failed.
  }
}
