import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client authenticated with the service role key,
 * bypassing RLS. Used for order writes — the `orders` table has no public
 * insert/select policy (see admin/supabase/schema.sql), so the anon-key
 * client (lib/supabase/client.ts) can't touch it. Never import this from a
 * "use client" component — the `server-only` import throws a build error if
 * that happens by mistake. Returns null when SUPABASE_SERVICE_ROLE_KEY isn't
 * configured, so callers must handle that (e.g. skip order persistence
 * rather than crash checkout).
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
