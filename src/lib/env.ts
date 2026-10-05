import { z } from "zod";

/**
 * Server-side environment variables schema.
 * These are only available in server components and route handlers.
 */
const serverEnvSchema = z.object({
  YOUCAM_API_KEY: z.string().min(1, "YOUCAM_API_KEY is required"),
  YOUCAM_API_SECRET: z.string().min(1, "YOUCAM_API_SECRET is required"),
  YOUCAM_API_BASE_URL: z.string().url("YOUCAM_API_BASE_URL must be a valid URL"),
  // Optional until the phases that use them
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

/**
 * Client-side environment variables schema.
 * These are exposed to the browser via NEXT_PUBLIC_ prefix.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL").optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

/**
 * Validate and return server environment variables.
 * Call this only in server-side code (route handlers, server components).
 * Throws at build/startup time if variables are missing.
 */
export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Missing required server environment variables");
  }
  return parsed.data;
}

/**
 * Validate and return client environment variables.
 * Safe to call anywhere — these are publicly exposed.
 */
export function getClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Missing required client environment variables");
  }
  return parsed.data;
}
