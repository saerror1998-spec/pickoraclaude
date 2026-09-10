import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolvePublicOrigin } from "@/lib/request-origin";

/**
 * Supabase redirects here after a customer completes Google sign-in, with a
 * `code` query param to exchange for a session. `next` (from wherever the
 * sign-in was triggered) controls where the customer lands afterward — e.g.
 * back on the product page they were trying to add to cart from.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const origin = resolvePublicOrigin(request);

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", origin));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/?auth_error=not_configured", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Failed to exchange OAuth code for session", error.message);
    return NextResponse.redirect(new URL("/?auth_error=exchange_failed", origin));
  }

  return response;
}
