# Pickora Admin

Internal admin dashboard for Pickora store operations: inventory, orders, and performance metrics.
Built with Next.js (App Router), Tailwind CSS (dark-first theme), Recharts, and Supabase.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same Supabase project as the
  storefront. Used to read the (public) `products` table for the Products page.
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only ([lib/supabase/admin-server.ts](lib/supabase/admin-server.ts),
  guarded by the `server-only` package so it can never leak into a client bundle). Used for admin
  queries like orders, which must bypass the storefront's public RLS policies. Get it from
  Supabase Settings → API → service_role — **never expose this key to the browser.**

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

## Data sources

- **Products** ([app/products/page.tsx](app/products/page.tsx)) reads the real `products` table via
  the anon key. Shows a real empty state if the table has no rows, and a graceful error card if
  the query fails outright.
- **Overview dashboard** ([app/page.tsx](app/page.tsx)) — Pickora doesn't have an orders/analytics
  pipeline yet, so `fetchDashboardOverview()` ([lib/admin-data.ts](lib/admin-data.ts)) checks for an
  `orders` table (see [supabase/schema.sql](supabase/schema.sql)) and falls back to realistic sample
  data ([lib/sample-data.ts](lib/sample-data.ts)) when it's missing or `SUPABASE_SERVICE_ROLE_KEY`
  isn't set. The data shape is identical either way, so wiring up real aggregation queries later is
  a change inside `fetchDashboardOverview`, not a UI change.

## Auth

Every route except `/login` is gated by [`proxy.ts`](proxy.ts) (Next.js 16's replacement for
`middleware.ts` — same mechanism, renamed file/export) via `supabase.auth.getUser()`. Signed-out
visitors are redirected to `/login`; signed-in visitors hitting `/login` are bounced to `/`.

There's no self-serve sign-up — create admin users directly in the Supabase dashboard
(Authentication → Users → Add user) with email + password. If `NEXT_PUBLIC_SUPABASE_URL`/
`NEXT_PUBLIC_SUPABASE_ANON_KEY` aren't set, the proxy lets requests through unauthenticated rather
than locking the app out — set them before deploying anywhere real.

## Tests

```bash
npm test         # run the full suite once (vitest run)
npm run test:watch
```

Covers: price/number formatting, stat card rendering and trend coloring, the funnel chart's
proportional bar widths, the products table's data mapping and empty state, the data layer's
fallback-to-sample-data behavior (missing config, missing `orders` table, and a real error path),
the sidebar's mobile drawer toggle + active-link state, and the login form's success/error paths.

## Architecture notes

- **Design tokens** live in [`app/globals.css`](app/globals.css) — a dark-only palette (this is an
  ops tool, not a themeable public page), 20px card radius, `cubic-bezier(0.16,1,0.3,1)` easing.
- **Layout** ([`app/layout.tsx`](app/layout.tsx)) stacks vertically below the `md` breakpoint (full-width
  mobile header + drawer) and switches to a row layout (icon rail → full sidebar) at `md`/`lg`. This
  was a real bug during development — an unconditional `flex` row put the mobile header in the
  sidebar's column instead of spanning full width — now covered by a Sidebar test.
- **Sidebar** ([`components/Sidebar.tsx`](components/Sidebar.tsx)) has three responsive states:
  a full-width mobile drawer (below `md`), an icons-only rail (`md`–`lg`), and the full icon+label
  nav (`lg`+).
- **Charts**: Recharts for the orders trend, revenue, and traffic-source bar/pie charts; a custom
  proportional-bar component for the funnel (simpler and more predictable than Recharts' `Funnel`
  for this shape).
