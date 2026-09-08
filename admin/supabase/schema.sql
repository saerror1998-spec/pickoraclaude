-- Run this once in the Supabase SQL editor. Creates the orders table used
-- to reconcile real Nomod checkout sessions with store data.
--
-- Nomod has no webhook system (checked their full docs sitemap — no such
-- page exists), so orders are created as 'pending' at checkout-session-
-- creation time (storefront/app/api/checkout/route.ts) and finalized by the
-- storefront's checkout status pages, which verify the real status via
-- GET https://api.nomod.com/v1/checkout/{id} before ever marking an order
-- 'paid' — never trust just "the customer reached the success page".

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  nomod_checkout_id text unique,
  reference_id text unique,
  -- Not a strict enum: Nomod's real API returns values their own docs don't
  -- mention (e.g. "enabled" for an unpaid session, where the docs claim
  -- "created") — confirmed by hitting the live API. Store whatever Nomod
  -- actually says rather than rejecting unrecognized-but-real values.
  status text not null check (status <> ''),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'AED',
  customer_email text,
  customer_name text,
  line_items jsonb not null default '[]',
  source text, -- e.g. 'organic search', 'direct', 'referral', 'paid social'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- No public policy: only the service role (server-only, see
-- lib/supabase/admin-server.ts in both apps) can read/write this table.
-- Neither the storefront's anon key nor the admin dashboard's browser
-- client should ever see raw order data client-side.
