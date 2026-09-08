import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client authenticated with the service role key, which
 * bypasses RLS. Never import this from a "use client" component — the
 * `server-only` import throws a build error if that happens by mistake.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't configured, so callers
 * must fall back to sample data.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}
