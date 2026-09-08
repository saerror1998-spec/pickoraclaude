# Pickora Storefront

Customer-facing storefront homepage for Pickora, a refurbished-laptop retailer. Built with
Next.js (App Router), Tailwind CSS, Framer Motion, GSAP/ScrollTrigger + Lenis for smooth scroll,
Supabase for product data, and Nomod for hosted checkout.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's
  Settings → API. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor to
  create the `products` table the storefront reads from.
- `NOMOD_API_KEY` — server-side only, used by [`app/api/checkout/route.ts`](app/api/checkout/route.ts)
  to create hosted checkout sessions. Never exposed to the browser.
- `NEXT_PUBLIC_STORE_CURRENCY` — ISO 4217 currency code (defaults to `USD`) used for both price
  display and the currency sent to Nomod. Deliberately `NEXT_PUBLIC_` (a currency code isn't
  sensitive) — see the note in [`lib/products.ts`](lib/products.ts) about why a non-public var here
  silently breaks once real product cards are rendered.
- `SUPABASE_SERVICE_ROLE_KEY` — needed both for [`scripts/import-products.mjs`](scripts/import-products.mjs)
  (bulk product import) and, at runtime, for writing to the `orders` table (see Checkout below).
  Server-only, never used by client code.

Run [`admin/supabase/schema.sql`](../admin/supabase/schema.sql) in the Supabase SQL editor to
create the `orders` table (owned by the admin app's schema since it's also read by the admin
dashboard).

### Customer sign-in (Google, via Supabase Auth)

Adding to cart or buying requires signing in with Google (`components/AddToCartButton.tsx`) —
enforced client-side, not by hiding the cart page itself. This needs two things configured beyond
the env vars above, both easy to get wrong silently (the failure mode is a Google/Supabase error
page, not a helpful in-app message):

1. **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client ID →
   Authorized redirect URIs must include the Supabase callback shown in Supabase's
   Authentication → Providers → Google settings (`https://<project-ref>.supabase.co/auth/v1/callback`).
   Missing this gives `Error 400: redirect_uri_mismatch` on Google's side.
2. **Supabase** → Authentication → URL Configuration → Redirect URLs must include this app's own
   `/auth/callback` route for every environment you run it in (e.g. `http://localhost:3000/auth/callback`
   and `https://store.pickoraonline.com/auth/callback`) — this is separate from #1 and separate
   from any redirect URLs you've added for the admin app's domain.

The flow: `AuthProvider` (`components/AuthProvider.tsx`) calls `signInWithOAuth`, which sends the
customer to Google, then to Supabase's callback, then back to this app's
[`app/auth/callback/route.ts`](app/auth/callback/route.ts), which exchanges the code for a session
and redirects to wherever the customer was trying to go (e.g. back to the product page they were
adding to cart from).

### Nomod's real API (verified against the live API — their public docs are thin)

`createNomodCheckoutSession` in [`lib/nomod.ts`](lib/nomod.ts) matches what
`https://api.nomod.com` actually does, which differs from what you'd guess from a Stripe-shaped
mental model:
- `POST https://api.nomod.com/v1/checkout` (not `/v1/checkout/sessions`)
- Auth via the `X-API-KEY` header (not `Authorization: Bearer`)
- `amount`/`unit_amount`/`total_amount` are **decimal strings in the main currency unit**
  (`"965.00"`), not integer cents
- Three redirect URLs: `success_url`, `failure_url`, **and** `cancelled_url` (not just success/cancel)
- Response has `url` (the hosted checkout page) and `id`, not `checkout_url`

Docs, once you know where to look: `https://nomod.com/docs/api-reference/create-checkout` (their
top-level `/docs` and `/docs/api-reference/introduction` pages don't link here directly — it's
reachable from the "Hosted Checkout" section of the sidebar).

**Nomod has no webhook system** — checked their full `sitemap.xml`, no such page exists anywhere in
their docs. Order status is instead reconciled by polling `GET /v1/checkout/{id}`
(`getNomodCheckoutStatus` in `lib/nomod.ts`), which the checkout status pages call. Also: their docs
prose claims an unpaid session's status is `"created"`, but the live API actually returns
`"enabled"` — confirmed by hitting it directly, not from docs. `lib/orders.ts` and
`components/CheckoutOutcome.tsx` store/handle whatever Nomod actually returns rather than
enumerating a status list, since their docs have already proven unreliable once.

If Supabase env vars are absent, the storefront falls back to bundled sample data
([`lib/sample-data.ts`](lib/sample-data.ts)) so it stays demoable without credentials. If they're
present but the query fails (e.g. the `products` table doesn't exist yet), the homepage renders a
graceful error state instead of crashing.

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

## Tests

```bash
npm test         # run the full suite once (vitest run)
npm run test:watch
```

Covers: product filtering/sorting/price formatting, `createNomodCheckoutSession`'s exact request
shape (endpoint, `X-API-KEY` header, decimal-string amounts — the things most likely to silently
regress), the `/api/checkout` route (validation, Nomod error propagation), the checkout button's
success/error/loading states, product card rendering (pricing, save badge, sold-out state), filter
sidebar interactions, the scroll/mount reveal animation (including its `prefers-reduced-motion`
fallback), and Google sign-in (`AuthProvider`'s session/loading state, `AccountMenu`'s signed-in/out
UI, the `/auth/callback` code-exchange route, and that cart actions correctly redirect to sign-in
rather than adding to cart when signed out).

## Bulk product import

[`scripts/import-products.mjs`](scripts/import-products.mjs) is a one-off importer: reads a source
CSV catalog + a folder of product images, uploads images to a public Supabase Storage bucket, and
upserts rows into `products` (keyed by `sku`, so re-runs are safe). Run
[`supabase/migrations/002_add_sku_spec_text.sql`](supabase/migrations/002_add_sku_spec_text.sql)
first (adds the `sku`/`spec_text` columns it needs), then:

```bash
node --env-file=.env.local scripts/import-products.mjs <csvPath> <imagesDir> [--limit=N]
```

The source CSV's `Title`/`Subtitle` fields aren't fully structured (RAM/storage/processor are
free text in inconsistent shapes), so the script best-effort parses them into `ram_gb`/`storage_gb`/
`processor` for filtering, but also stores the original text as `spec_text` — `ProductCard` and the
PDP prefer `spec_text` for display when present, since it's more reliable than the parsed fields.

## Architecture notes

- **Design tokens** live in [`app/globals.css`](app/globals.css) under `:root` / `@theme inline`
  (Tailwind v4's CSS-based theme config) — colors, radii, easing, shadows, spacing.
- **Scroll reveal** ([`components/ScrollReveal.tsx`](components/ScrollReveal.tsx)) uses Framer
  Motion for the actual line-mask animation, driven either immediately on mount (above-the-fold
  content like the hero) or by a plain `IntersectionObserver` (below-the-fold section headlines).
  Framer's built-in `whileInView` was unreliable for elements already in the viewport at mount in
  testing, hence the explicit observer.
- **Smooth scroll** ([`components/SmoothScrollProvider.tsx`](components/SmoothScrollProvider.tsx))
  wires Lenis to GSAP's `ScrollTrigger.update`, and is skipped entirely under reduced motion.
- **Cart** ([`components/CartProvider.tsx`](components/CartProvider.tsx)) is `localStorage`-backed
  React context, not a database table — there's no customer account system, so cart state is
  per-browser. It starts empty on both the server and the client's first render (avoiding a
  hydration mismatch), then fills in from `localStorage` right after mount. The product page
  (`app/products/[slug]/page.tsx`) offers "Add to Cart" (stays on the page) and "Buy Now" (adds then
  jumps to `/cart`); `/cart` is where checkout actually happens, via the same `CheckoutButton` used
  everywhere, now given every cart line item instead of just one.
- **Checkout**: the client posts line items to `/api/checkout`, which validates them, calls Nomod
  server-side, and — best-effort, doesn't block checkout on failure — inserts a `pending` row into
  `orders` (`lib/orders.ts`) keyed by our own generated `reference_id`, which we embed as `?order=`
  on all three redirect URLs we give Nomod (no need to guess what query params Nomod's redirect
  might add, since we control the base URL). The three checkout status pages
  (`app/checkout/{success,failed,cancelled}/page.tsx`) all render through one shared
  `<CheckoutOutcome>` component that looks up the local order by that reference, then calls
  `getNomodCheckoutStatus` to verify the *real* status before ever showing "payment successful" —
  landing on `/checkout/success` proves nothing on its own, since that URL can be hand-navigated to.
  All failure modes (missing config, network error, Nomod 4xx/5xx, DB errors) surface as a visible
  message rather than a silent failure or a false "success."
