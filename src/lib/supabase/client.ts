import { createClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/lib/env";

export function createSupabaseClient() {
  const env = getClientEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "https://sdatbevqfhkcennubqfz.supabase.co";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_h3N-q6DS3xRrAOjHPNDQXA_bjxWn6DN";
  return createClient(url, anonKey);
}

export const supabase = createSupabaseClient();
