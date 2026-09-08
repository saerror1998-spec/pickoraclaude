-- Additive migration for the bulk product import: a unique SKU (for
-- idempotent re-imports) and a raw spec_text fallback (the source
-- catalog's free-text spec line, e.g. "8GB / 256GB / i3 10th Gen"), kept
-- alongside the parsed ram_gb/storage_gb/processor columns since the
-- source data's spec format isn't fully consistent and this preserves the
-- original text as a display fallback.

alter table public.products
  add column if not exists sku text unique,
  add column if not exists spec_text text;
