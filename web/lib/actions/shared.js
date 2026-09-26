import { revalidatePath } from "next/cache";

export const CAFE_SLUG = "bowl-n-sticks";

// Actions run on the server, so a swallowed error is invisible in the browser.
// Everything that fails goes through here and lands in the Vercel function logs.
export function logFailure(where, error) {
  console.error(`[admin] ${where}:`, error?.code ?? "-", error?.message ?? error);
}

// Log a Supabase error, then return the line to show the user.
// Supabase returns { data, error } - it does not throw - so every write must
// check `error` or a failure looks exactly like a success.
// Actions return a message on failure and nothing on success; they don't throw,
// because Next redacts thrown server errors in production (the browser gets a
// digest, not a reason) and the error boundary would wipe the open form.
export function dbFailure(where, error) {
  logFailure(where, error);
  // 42501 = row-level security refused the write, which in practice means the
  // admin session is gone.
  if (error?.code === "42501") {
    return "Your session expired. Reload the page and sign in again.";
  }
  return "That didn't save. Please try again.";
}

export async function getCafeId(supabase) {
  const { data, error } = await supabase
    .from("cafe")
    .select("id")
    .eq("slug", CAFE_SLUG)
    .maybeSingle();
  if (error) logFailure("getCafeId", error);
  return data?.id;
}

// The public menu is statically cached, so refresh the whole tree after any
// edit. Without this, customers keep seeing the old menu until a redeploy.
export function refreshMenu() {
  revalidatePath("/", "layout");
}
