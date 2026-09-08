import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a browser Supabase client, or null when env vars aren't configured
 * (e.g. local dev before `.env.local` is filled in). Callers must fall back
 * to sample data when this returns null.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}
