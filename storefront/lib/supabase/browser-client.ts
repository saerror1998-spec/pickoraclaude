"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for customer auth (Google sign-in) — uses
 * @supabase/ssr so the session cookie it writes is readable by the server
 * client below, keeping server-rendered UI (e.g. Header) in sync with the
 * client's auth state.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)");
  }

  return createBrowserClient(url, anonKey);
}
