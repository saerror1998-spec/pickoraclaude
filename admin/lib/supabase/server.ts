import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Route Handler Supabase client, backed by the request's
 * cookies (via @supabase/ssr) so it shares a session with the browser client
 * and the proxy. Used for auth checks (`auth.getUser()`), not for data reads
 * — those still go through lib/supabase/client.ts (anon) or
 * lib/supabase/admin-server.ts (service role).
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
          // cookies() is read-only there. Safe to ignore as long as proxy.ts
          // is also refreshing the session, which it is.
        }
      },
    },
  });
}
