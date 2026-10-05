import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";
import type { Database } from "./types";

export function createClient() {
  const env = getClientEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "https://sdatbevqfhkcennubqfz.supabase.co";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient<Database>(url, anonKey);
}

export const supabase = createClient();
