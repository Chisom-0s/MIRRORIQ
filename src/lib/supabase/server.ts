import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

export function createSupabaseServerClient() {
  const env = getServerEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdatbevqfhkcennubqfz.supabase.co";
  const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}
