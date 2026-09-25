import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for Server components (server-side).
// Reads the session from cookies, so that the server can make requests on behalf of the logged-in user.
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (can't set cookies there);
          // The middleware handles refreshing them, so this is safe to ignore.
        }
      },
    },
  });
}
