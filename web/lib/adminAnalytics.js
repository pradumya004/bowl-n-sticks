import { createClient } from "@/lib/supabase/server";
import { CAFE_SLUG } from "@/lib/cafe";
import { logData } from "@/lib/debug";

// Everything the dashboard shows, in one round trip. The heavy lifting is a
// Postgres function (analytics_summary) rather than five queries: grouping
// thousands of rows is what the database is for, and it keeps the page fast as
// the table grows.
export async function getAnalytics(days = 30) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_summary", {
    p_cafe_slug: CAFE_SLUG,
    p_days: days,
  });

  if (error) {
    throw error;
  }

  logData(`getAnalytics(${days})`, data);
  return data;
}
