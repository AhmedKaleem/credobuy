-- ============================================================================
-- Unified promotions table: announcement | offers_strip | deal_of_the_day
-- Run in Supabase SQL editor (safe on existing projects).
-- ============================================================================

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
create index if not exists idx_promotions_active
  on public.promotions(is_active);

alter table public.promotions enable row level security;

drop policy if exists "public read promotions" on public.promotions;
create policy "public read promotions" on public.promotions
  for select using (
    is_active
    and (valid_from is null or valid_from <= now())
    and (valid_to is null or valid_to >= now())
  );

drop policy if exists "admin write promotions" on public.promotions;
create policy "admin write promotions" on public.promotions
  for all using (public.is_admin()) with check (public.is_admin());

-- Migrate legacy announcements → promotions (if table exists)
do $$ begin
  if to_regclass('public.announcements') is not null then
    insert into public.promotions (placement, message, href, sort_order, is_active)
    select
      'announcement'::promotion_placement,
      a.message,
      a.href,
      a.sort_order,
      a.is_active
    from public.announcements a
    where not exists (
      select 1 from public.promotions p
      where p.placement = 'announcement' and p.message = a.message
    );
  end if;
end $$;

-- Seed defaults only when empty
insert into public.promotions (placement, title, message, href, icon, sort_order, is_active)
select * from (values
  ('announcement'::promotion_placement, null::text,
   'BACK TO SCHOOL · Buy 2+ and get 15% off — auto-applied at checkout',
   '/shop', null::text, 1, true),
  ('announcement'::promotion_placement, null,
   'FREE express shipping on orders over ₹499',
   '/shop', null, 2, true),
  ('announcement'::promotion_placement, null,
   'NEW · Straps, charms & MagSafe wallets just dropped',
   '/shop?sort=newest', null, 3, true),
  ('announcement'::promotion_placement, null,
   '2-year warranty · 30-day no-questions-asked returns',
   '/contact', null, 4, true),
  ('offers_strip'::promotion_placement, '10% Instant Bank Discount',
   'On HDFC, ICICI & SBI credit cards', null, 'Landmark', 1, true),
  ('offers_strip'::promotion_placement, 'No Cost EMI',
   'Available on orders above ₹3,000', null, 'Wallet', 2, true),
  ('offers_strip'::promotion_placement, 'Extra 5% Cashback',
   'With CredoBuy Wallet payments', null, 'Percent', 3, true),
  ('offers_strip'::promotion_placement, 'UPI & Cards Accepted',
   '100% secure, encrypted checkout', null, 'CreditCard', 4, true)
) as v(placement, title, message, href, icon, sort_order, is_active)
where not exists (select 1 from public.promotions limit 1);

-- Optional: drop legacy announcements after migrate
-- drop table if exists public.announcements;
