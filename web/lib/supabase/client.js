import { createBrowserClient } from "@supabase/ssr";

// Supabase client for Client components (browser-side).
// This is the only place we call createBrowserClient, so that we can easily swap in a different client if we want to.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
