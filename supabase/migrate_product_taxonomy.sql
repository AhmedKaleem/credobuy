-- Add product taxonomy columns (safe to re-run).
-- Run this in the Supabase SQL editor if products table already exists.

alter table public.products add column if not exists department text;
alter table public.products add column if not exists taxonomy_category text;
alter table public.products add column if not exists sub_category text;
alter table public.products add column if not exists series text;
alter table public.products add column if not exists product_category text;
alter table public.products add column if not exists product_type text;
alter table public.products add column if not exists variant_label text;
alter table public.products add column if not exists compatible_device text;

create index if not exists idx_products_department on public.products(department);
create index if not exists idx_products_sub_category on public.products(sub_category);
create index if not exists idx_products_series on public.products(series);
create index if not exists idx_products_product_type on public.products(product_type);
