-- ============================================================================
-- CredoBuy — Supabase schema (final V1)
-- ============================================================================
-- 20 tables. Stock lives on products (no inventory table).
-- product_images / product_variants / compatible_model_ids are jsonb/uuid[]
-- columns on products (no child tables).
--
-- Tables:
--   users, addresses,
--   categories, brands, device_brands, device_models, products,
--   banners, coupons, reviews,
--   carts, cart_items, wishlists,
--   orders, order_items, payments, shipments,
--   distributors, supplier_products, fast_delivery_pincodes,
--   order_fulfillments, fulfillment_events, fulfillment_rejects
--
-- Run: schema.sql → rls.sql → migrate_fulfillment.sql (or include below)
--      → npm run seed:supabase
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin', 'distributor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('razorpay','cod','mock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type address_type as enum ('home','work','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent','flat');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfillment_status as enum (
    'pending','offered','accepted','rejected','expired','cancelled',
    'packed','shipped','delivered','failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfillment_event_type as enum (
    'created','assigned','accepted','rejected','expired','rerouted',
    'cancelled','packed','shipped','delivered','failed','note'
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- users + addresses
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  type address_type not null default 'home',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);

-- ----------------------------------------------------------------------------
-- Catalogue taxonomy
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.device_brands (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_url text,
  sort_order int not null default 0
);

create table if not exists public.device_models (
  id uuid primary key default uuid_generate_v4(),
  device_brand_id uuid not null references public.device_brands(id) on delete cascade,
  slug text unique not null,
  name text not null,
  image_url text,
  release_year int,
  created_at timestamptz not null default now()
);
create index if not exists idx_models_brand on public.device_models(device_brand_id);

-- ----------------------------------------------------------------------------
-- products (37 fields — heart of the app)
-- product_images / product_variants jsonb; compatible_model_ids uuid[]
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  brand_name text,

  short_description text,
  description text,
  price numeric(10,2) not null,
  mrp numeric(10,2) not null,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  stock_status stock_status not null default 'in_stock',
  stock int not null default 0,

  product_images jsonb not null default '[]'::jsonb,
  product_variants jsonb not null default '[]'::jsonb,
  compatible_model_ids uuid[] not null default '{}'::uuid[],

  features jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,

  connector_type text,
  wattage int,
  material text,
  warranty_months int not null default 12,

  universal boolean not null default false,
  is_trending boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,

  department text,
  taxonomy_category text,
  sub_category text,
  series text,
  product_category text,
  product_type text,

  created_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_compat on public.products using gin (compatible_model_ids);
create index if not exists idx_products_search on public.products
  using gin (
    to_tsvector(
      'english',
      title || ' ' || coalesce(short_description, '') || ' ' ||
      coalesce(product_type, '') || ' ' || coalesce(series, '')
    )
  );

-- ----------------------------------------------------------------------------
-- banners, coupons, reviews
-- ----------------------------------------------------------------------------
create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  eyebrow text,
  cta_label text,
  cta_href text,
  image_url text,
  bg text,
  text_tone text not null default 'light',
  sort_order int not null default 0,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_banners_sort on public.banners(sort_order);

do $$ begin
  create type promotion_placement as enum (
    'announcement',
    'offers_strip',
    'deal_of_the_day'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.promotions (
  id uuid primary key default uuid_generate_v4(),
  placement promotion_placement not null,
  title text,
  message text not null,
  href text,
  icon text,
  product_id uuid references public.products(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_promotions_placement
  on public.promotions(placement, sort_order);

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text,
  type coupon_type not null,
  value numeric(10,2) not null,
  min_order numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  usage_limit int,
  active boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- ----------------------------------------------------------------------------
-- carts / wishlists (product-based; no variant FK)
-- ----------------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  unique (cart_id, product_id)
);

create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references public.users(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  address_snapshot jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_method payment_method not null default 'mock',
  coupon_code text,
  placed_at timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  variant_name text,
  image_url text,
  price numeric(10,2) not null,
  quantity int not null
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  gateway text not null default 'mock',
  gateway_order_id text,
  gateway_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);

create table if not exists public.shipments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier text,
  tracking_number text,
  status order_status not null default 'packed',
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz
);
create index if not exists idx_shipments_order on public.shipments(order_id);

-- ----------------------------------------------------------------------------
-- distributors + supplier cost
-- ----------------------------------------------------------------------------
create table if not exists public.distributors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  city text,
  state text,
  user_id uuid unique references public.users(id) on delete set null,
  priority int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_products (
  id uuid primary key default uuid_generate_v4(),
  distributor_id uuid not null references public.distributors(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_sku text,
  cost_price numeric(10,2) not null,
  lead_time_days int not null default 3,
  stock int not null default 0,
  reserved int not null default 0,
  available int generated always as (stock - reserved) stored,
  unique (distributor_id, product_id)
);

create table if not exists public.order_fulfillments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null check (quantity > 0),
  distributor_id uuid references public.distributors(id) on delete set null,
  status fulfillment_status not null default 'pending',
  customer_unit_price numeric(10,2) not null,
  supplier_unit_cost numeric(10,2),
  cost_variance numeric(10,2) not null default 0,
  attempt_number int not null default 1,
  max_attempts int not null default 5,
  reject_reason text,
  sla_deadline timestamptz,
  admin_override boolean not null default false,
  notes text,
  assigned_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fulfillment_events (
  id uuid primary key default uuid_generate_v4(),
  fulfillment_id uuid not null references public.order_fulfillments(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type fulfillment_event_type not null,
  from_status fulfillment_status,
  to_status fulfillment_status,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fulfillment_rejects (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  distributor_id uuid not null references public.distributors(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (order_item_id, distributor_id)
);

-- ----------------------------------------------------------------------------
-- fast delivery pincodes
-- ----------------------------------------------------------------------------
create table if not exists public.fast_delivery_pincodes (
  pincode text primary key
);

-- ----------------------------------------------------------------------------
-- Auth hook + admin helper
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_distributor()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'distributor'
  );
$$;

create or replace function public.current_distributor_id()
returns uuid language sql security definer stable set search_path = public as $$
  select d.id
  from public.distributors d
  where d.user_id = auth.uid() and d.is_active
  limit 1;
$$;

-- Full RPCs (assign/accept/reject/reroute/stock) live in migrate_fulfillment.sql
-- so existing projects can upgrade without re-running the whole schema.
