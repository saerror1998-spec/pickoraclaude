-- Run this in the Supabase SQL editor (or `supabase db push` with the CLI)
-- to create the products table the storefront reads from. Column names match
-- the mapping in lib/products.ts.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  image text not null,
  processor text not null,
  ram_gb integer not null,
  storage_gb integer not null,
  price_cents integer not null check (price_cents >= 0),
  original_price_cents integer check (original_price_cents is null or original_price_cents >= price_cents),
  compatibility text[] not null default '{}',
  condition text not null check (condition in ('Excellent', 'Good', 'Fair')),
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public storefront only needs read access; writes go through the admin
-- dashboard using the service role key (which bypasses RLS).
create policy "Public products are viewable by everyone"
  on public.products for select
  using (true);
