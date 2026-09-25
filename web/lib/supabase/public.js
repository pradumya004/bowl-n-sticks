import { createClient } from "@supabase/supabase-js";

// Read from web/.env.local NEXT_PUBLIC_ = exposed to the browser (safe:
// this is the publishable key, and RLS keeps it read-only).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// One shared client the whole app imports to run queries.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
