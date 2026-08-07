-- ============================================================================
-- CredoBuy — Row Level Security (final V1, 20 tables)
-- Run after schema.sql
-- ============================================================================

alter table public.users                  enable row level security;
alter table public.addresses              enable row level security;
alter table public.categories             enable row level security;
alter table public.brands                 enable row level security;
alter table public.device_brands          enable row level security;
alter table public.device_models          enable row level security;
alter table public.products               enable row level security;
alter table public.banners                enable row level security;
alter table public.promotions             enable row level security;
alter table public.coupons                enable row level security;
alter table public.reviews                enable row level security;
alter table public.carts                  enable row level security;
alter table public.cart_items             enable row level security;
alter table public.wishlists              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.payments               enable row level security;
alter table public.shipments              enable row level security;
alter table public.distributors           enable row level security;
alter table public.supplier_products      enable row level security;
alter table public.fast_delivery_pincodes enable row level security;
alter table public.order_fulfillments     enable row level security;
alter table public.fulfillment_events     enable row level security;
alter table public.fulfillment_rejects    enable row level security;

-- Public catalog reads
create policy "public read categories" on public.categories for select using (true);
create policy "public read brands" on public.brands for select using (true);
create policy "public read device_brands" on public.device_brands for select using (true);
create policy "public read device_models" on public.device_models for select using (true);
create policy "public read products" on public.products for select using (is_active);
create policy "public read reviews" on public.reviews for select using (true);
create policy "public read coupons" on public.coupons for select using (active);
create policy "public read banners" on public.banners for select using (
  is_active
  and (valid_from is null or valid_from <= now())
  and (valid_to is null or valid_to >= now())
);
create policy "public read promotions" on public.promotions for select using (
  is_active
  and (valid_from is null or valid_from <= now())
  and (valid_to is null or valid_to >= now())
);
create policy "public read pincodes" on public.fast_delivery_pincodes for select using (true);

-- Admin catalog writes
create policy "admin write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write brands" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write device_brands" on public.device_brands
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write device_models" on public.device_models
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write coupons" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write banners" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write promotions" on public.promotions
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write reviews" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage distributors" on public.distributors
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage supplier" on public.supplier_products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write pincodes" on public.fast_delivery_pincodes
  for all using (public.is_admin()) with check (public.is_admin());

-- Users
create policy "read own user" on public.users
  for select using (auth.uid() = id or public.is_admin());
create policy "update own user" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Addresses
create policy "own addresses" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Carts
create policy "own cart" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart items" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- Wishlists
create policy "own wishlist" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders
create policy "read own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "create own orders" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "admin update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "insert own order items" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "read own payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "admin write payments" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "read own shipments" on public.shipments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "admin write shipments" on public.shipments
  for all using (public.is_admin()) with check (public.is_admin());

-- Fulfillment (see also migrate_fulfillment.sql for distributor policies)
create policy "admin all fulfillments" on public.order_fulfillments
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all fulfillment events" on public.fulfillment_events
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all fulfillment rejects" on public.fulfillment_rejects
  for all using (public.is_admin()) with check (public.is_admin());

-- Customers can post reviews
create policy "insert own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
