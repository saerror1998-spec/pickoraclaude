"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for the login form — uses @supabase/ssr so the
 * session cookie it writes is readable by the server client/middleware
 * (a plain @supabase/supabase-js client stores the session in localStorage
 * only, which the server can't see).
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)");
  }

  return createBrowserClient(url, anonKey);
}
