import type { NextRequest } from "next/server";

/**
 * Resolves the public-facing origin a request actually came in on.
 *
 * request.url / request.nextUrl.origin reflect what the Next.js server
 * process itself was bound to — on this host, that's an internal address
 * (0.0.0.0:3000), not the public domain, because the reverse proxy in front
 * of it doesn't rewrite the request URL, only the Host-related headers. Any
 * redirect built from request.url instead of this ends up pointing at that
 * internal address, which is unreachable from the browser. Hit this for
 * real: OAuth callback redirects and Nomod checkout success/failure URLs
 * both landed on http://0.0.0.0:3000/... in production before this fix.
 *
 * X-Forwarded-Host/-Proto are the standard headers reverse proxies set for
 * exactly this purpose (Cloudflare, and effectively every other proxy,
 * includes them) — trust those first, then fall back to a plain Host header,
 * then to the request's own origin as a last resort for direct/local access
 * with no proxy in front at all.
 */
export function resolvePublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    return `${forwardedProto ?? "https"}://${host}`;
  }

  return request.nextUrl.origin;
}
