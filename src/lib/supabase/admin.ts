import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Privileged Supabase Admin Client.
 *
 * - Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security.
 * - MUST ONLY be used in secure, trusted server-side code (route handlers, background tasks).
 * - NEVER import or execute this in client components.
 */
export function createAdminClient() {
  const env = getServerEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdatbevqfhkcennubqfz.supabase.co";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client initialization");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
