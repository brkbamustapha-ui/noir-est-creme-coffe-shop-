import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns null when Supabase is not configured, so the site can still render
 * from its built-in fallback menu instead of crashing the whole page.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Secret shared with the SECURITY DEFINER admin RPCs. Server-side only. */
export function adminToken(): string {
  return process.env.SUPABASE_ADMIN_TOKEN ?? "";
}

export function isConfigured(): boolean {
  return Boolean(url && anonKey);
}
