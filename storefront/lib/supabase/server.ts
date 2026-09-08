import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component Supabase client, backed by request cookies (via
 * @supabase/ssr), so server-rendered UI (e.g. Header showing the signed-in
 * user) matches the browser client's auth state. Used for reading auth
 * state only — data reads still go through lib/supabase/client.ts (anon).
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (not a Route Handler/Action) —
          // cookies() is read-only there. Safe to ignore; the auth callback
          // route handler is what actually persists the session cookie.
        }
      },
    },
  });
}
