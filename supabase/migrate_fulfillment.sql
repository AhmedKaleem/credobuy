-- ============================================================================
-- CredoBuy — Distributor fulfillment (assignments, stock reserve/commit, reroute)
-- ============================================================================
-- Status flow (order_fulfillments.status):
--   pending  → offered → accepted → packed → shipped → delivered
--                 ↓         ↓
--              rejected   cancelled
--                 ↓
--            auto-reroute → offered (new attempt)
--                 ↓ (max attempts / no stock)
--              failed
--
-- Policy:
--   • Customer unit price is locked on the fulfillment (from order_items.price).
--   • Supplier cost may change on reroute; CredoBuy absorbs cost variance.
--   • Stock is per-distributor on supplier_products (stock + reserved).
--   • Reserve on offer/assign; commit on accept; release on reject/expire/cancel.
--
-- Run in Supabase SQL editor after schema.sql + rls.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type fulfillment_status as enum (
    'pending',
    'offered',
    'accepted',
    'rejected',
    'expired',
    'cancelled',
    'packed',
    'shipped',
    'delivered',
    'failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfillment_event_type as enum (
    'created',
    'assigned',
    'accepted',
    'rejected',
    'expired',
    'rerouted',
    'cancelled',
    'packed',
    'shipped',
    'delivered',
    'failed',
    'note'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Distributor login link + ranking
-- ---------------------------------------------------------------------------
alter table public.distributors
  add column if not exists user_id uuid unique references public.users(id) on delete set null;
alter table public.distributors
  add column if not exists priority int not null default 100;

create index if not exists idx_distributors_user
  on public.distributors(user_id);

-- ---------------------------------------------------------------------------
-- Per-distributor stock (reserve / available)
-- ---------------------------------------------------------------------------
alter table public.supplier_products
  add column if not exists stock int not null default 0;
alter table public.supplier_products
  add column if not exists reserved int not null default 0;

do $$ begin
  alter table public.supplier_products
    add constraint supplier_products_stock_nonneg check (stock >= 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.supplier_products
    add constraint supplier_products_reserved_nonneg check (reserved >= 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.supplier_products
    add constraint supplier_products_reserved_lte_stock check (reserved <= stock);
exception when duplicate_object then null; end $$;

alter table public.supplier_products
  drop column if exists available;
alter table public.supplier_products
  add column available int generated always as (stock - reserved) stored;

create index if not exists idx_supplier_products_product
  on public.supplier_products(product_id);
create index if not exists idx_supplier_products_available
  on public.supplier_products(product_id, available);

-- ---------------------------------------------------------------------------
-- Assignments
-- ---------------------------------------------------------------------------
create table if not exists public.order_fulfillments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null check (quantity > 0),

  distributor_id uuid references public.distributors(id) on delete set null,
  status fulfillment_status not null default 'pending',

  -- Locked customer price (never changes on reroute)
  customer_unit_price numeric(10,2) not null,
  -- Supplier cost at current assignment (may change on reroute)
  supplier_unit_cost numeric(10,2),
  -- Cost delta vs previous assignment; CredoBuy absorbs this
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

create index if not exists idx_fulfillments_order
  on public.order_fulfillments(order_id);
create index if not exists idx_fulfillments_distributor_status
  on public.order_fulfillments(distributor_id, status);
create index if not exists idx_fulfillments_status
  on public.order_fulfillments(status);

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
create index if not exists idx_fulfillment_events_ff
  on public.fulfillment_events(fulfillment_id, created_at);

create table if not exists public.fulfillment_rejects (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  distributor_id uuid not null references public.distributors(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (order_item_id, distributor_id)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
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

create or replace function public.touch_fulfillment_updated()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_fulfillment_updated on public.order_fulfillments;
create trigger trg_fulfillment_updated
  before update on public.order_fulfillments
  for each row execute function public.touch_fulfillment_updated();

create or replace function public.log_fulfillment_event(
  p_fulfillment_id uuid,
  p_event fulfillment_event_type,
  p_from fulfillment_status,
  p_to fulfillment_status,
  p_meta jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.fulfillment_events (
    fulfillment_id, actor_user_id, event_type, from_status, to_status, meta
  ) values (
    p_fulfillment_id, auth.uid(), p_event, p_from, p_to, coalesce(p_meta, '{}'::jsonb)
  );
end $$;

create or replace function public.sync_product_stock_from_suppliers(p_product_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_available int;
begin
  select coalesce(sum(greatest(available, 0)), 0)
    into v_available
  from public.supplier_products
  where product_id = p_product_id;

  update public.products
  set
    stock = v_available,
    stock_status = case
      when v_available <= 0 then 'out_of_stock'::stock_status
      when v_available < 10 then 'low_stock'::stock_status
      else 'in_stock'::stock_status
    end
  where id = p_product_id;
end $$;

-- ---------------------------------------------------------------------------
-- Stock primitives
-- ---------------------------------------------------------------------------
create or replace function public.reserve_supplier_stock(
  p_distributor_id uuid,
  p_product_id uuid,
  p_qty int
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.supplier_products
  set reserved = reserved + p_qty
  where distributor_id = p_distributor_id
    and product_id = p_product_id
    and available >= p_qty;

  if not found then
    return false;
  end if;

  perform public.sync_product_stock_from_suppliers(p_product_id);
  return true;
end $$;

create or replace function public.release_supplier_stock(
  p_distributor_id uuid,
  p_product_id uuid,
  p_qty int
) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.supplier_products
  set reserved = greatest(reserved - p_qty, 0)
  where distributor_id = p_distributor_id
    and product_id = p_product_id;

  perform public.sync_product_stock_from_suppliers(p_product_id);
end $$;

create or replace function public.commit_supplier_stock(
  p_distributor_id uuid,
  p_product_id uuid,
  p_qty int
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.supplier_products
  set
    stock = stock - p_qty,
    reserved = reserved - p_qty
  where distributor_id = p_distributor_id
    and product_id = p_product_id
    and reserved >= p_qty
    and stock >= p_qty;

  if not found then
    return false;
  end if;

  perform public.sync_product_stock_from_suppliers(p_product_id);
  return true;
end $$;

create or replace function public.pick_next_distributor(
  p_product_id uuid,
  p_qty int,
  p_order_item_id uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select sp.distributor_id into v_id
  from public.supplier_products sp
  join public.distributors d on d.id = sp.distributor_id
  where sp.product_id = p_product_id
    and d.is_active
    and sp.available >= p_qty
    and not exists (
      select 1 from public.fulfillment_rejects fr
      where fr.order_item_id = p_order_item_id
        and fr.distributor_id = sp.distributor_id
    )
  order by sp.cost_price asc, sp.lead_time_days asc, d.priority asc, d.name asc
  limit 1;

  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- Assign / offer
-- ---------------------------------------------------------------------------
create or replace function public.assign_fulfillment(
  p_fulfillment_id uuid,
  p_distributor_id uuid,
  p_admin_override boolean default false
) returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_cost numeric(10,2);
  v_prev_cost numeric(10,2);
  v_ok boolean;
  v_from fulfillment_status;
begin
  -- Internal helper: called only from other SECURITY DEFINER RPCs.
  -- Auth is enforced by accept/reject/admin_reroute/create_fulfillments_for_order.

  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then
    raise exception 'fulfillment not found';
  end if;

  if f.status not in ('pending', 'rejected', 'expired', 'failed', 'offered') then
    raise exception 'cannot assign from status %', f.status;
  end if;

  v_from := f.status;

  if f.status = 'offered' and f.distributor_id is not null and f.product_id is not null then
    perform public.release_supplier_stock(f.distributor_id, f.product_id, f.quantity);
  end if;

  select cost_price into v_cost
  from public.supplier_products
  where distributor_id = p_distributor_id and product_id = f.product_id;

  if v_cost is null then
    raise exception 'distributor does not supply this product';
  end if;

  v_ok := public.reserve_supplier_stock(p_distributor_id, f.product_id, f.quantity);
  if not v_ok then
    raise exception 'insufficient distributor stock';
  end if;

  v_prev_cost := f.supplier_unit_cost;

  update public.order_fulfillments set
    distributor_id = p_distributor_id,
    status = 'offered',
    supplier_unit_cost = v_cost,
    cost_variance = case
      when v_prev_cost is null then 0
      else v_cost - v_prev_cost
    end,
    admin_override = p_admin_override,
    assigned_at = now(),
    sla_deadline = now() + interval '4 hours',
    reject_reason = null,
    rejected_at = null
  where id = p_fulfillment_id
  returning * into f;

  perform public.log_fulfillment_event(
    p_fulfillment_id,
    case when p_admin_override then 'rerouted'::fulfillment_event_type else 'assigned'::fulfillment_event_type end,
    v_from,
    'offered',
    jsonb_build_object(
      'distributor_id', p_distributor_id,
      'supplier_unit_cost', v_cost,
      'customer_unit_price', f.customer_unit_price,
      'admin_override', p_admin_override,
      'note', 'Customer price is locked; cost variance is CredoBuy risk'
    )
  );

  return f;
end $$;

create or replace function public.auto_assign_fulfillment(p_fulfillment_id uuid)
returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_dist uuid;
  v_from fulfillment_status;
begin
  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then
    raise exception 'fulfillment not found';
  end if;

  v_from := f.status;

  if f.attempt_number > f.max_attempts then
    update public.order_fulfillments set status = 'failed'
    where id = p_fulfillment_id returning * into f;
    perform public.log_fulfillment_event(
      p_fulfillment_id, 'failed', v_from, 'failed',
      jsonb_build_object('reason', 'max_attempts')
    );
    return f;
  end if;

  v_dist := public.pick_next_distributor(f.product_id, f.quantity, f.order_item_id);
  if v_dist is null then
    update public.order_fulfillments set status = 'failed'
    where id = p_fulfillment_id returning * into f;
    perform public.log_fulfillment_event(
      p_fulfillment_id, 'failed', v_from, 'failed',
      jsonb_build_object('reason', 'no_distributor_available')
    );
    return f;
  end if;

  return public.assign_fulfillment(p_fulfillment_id, v_dist, false);
end $$;

create or replace function public.create_fulfillments_for_order(p_order_id uuid)
returns setof public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  item record;
  f public.order_fulfillments;
  v_owner uuid;
begin
  select user_id into v_owner from public.orders where id = p_order_id;
  -- Guest checkout stores user_id = null; only a missing row is "not found".
  if not found then
    raise exception 'order not found';
  end if;
  if auth.role() <> 'service_role'
     and not public.is_admin()
     and (v_owner is null or auth.uid() is distinct from v_owner) then
    raise exception 'not allowed';
  end if;

  if exists (select 1 from public.order_fulfillments where order_id = p_order_id) then
    return query select * from public.order_fulfillments where order_id = p_order_id;
    return;
  end if;

  for item in
    select id, product_id, price, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    insert into public.order_fulfillments (
      order_id, order_item_id, product_id, quantity,
      customer_unit_price, status
    ) values (
      p_order_id, item.id, item.product_id, item.quantity,
      item.price, 'pending'
    ) returning * into f;

    perform public.log_fulfillment_event(
      f.id, 'created', null, 'pending',
      jsonb_build_object('order_item_id', item.id)
    );

    f := public.auto_assign_fulfillment(f.id);
    return next f;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Distributor accept / reject
-- ---------------------------------------------------------------------------
create or replace function public.accept_fulfillment(p_fulfillment_id uuid)
returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_ok boolean;
  v_dist uuid;
begin
  v_dist := public.current_distributor_id();
  if v_dist is null and not public.is_admin() then
    raise exception 'distributor login required';
  end if;

  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then raise exception 'fulfillment not found'; end if;
  if f.status <> 'offered' then raise exception 'not in offered state'; end if;
  if not public.is_admin() and f.distributor_id <> v_dist then
    raise exception 'not your assignment';
  end if;

  v_ok := public.commit_supplier_stock(f.distributor_id, f.product_id, f.quantity);
  if not v_ok then
    raise exception 'stock commit failed';
  end if;

  update public.order_fulfillments set
    status = 'accepted',
    accepted_at = now()
  where id = p_fulfillment_id
  returning * into f;

  update public.orders
  set status = 'confirmed'
  where id = f.order_id and status = 'pending';

  perform public.log_fulfillment_event(
    p_fulfillment_id, 'accepted', 'offered', 'accepted', '{}'::jsonb
  );
  return f;
end $$;

create or replace function public.reject_fulfillment(
  p_fulfillment_id uuid,
  p_reason text default null
) returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_dist uuid;
  v_from fulfillment_status;
begin
  v_dist := public.current_distributor_id();
  if auth.role() <> 'service_role'
     and v_dist is null
     and not public.is_admin() then
    raise exception 'distributor login required';
  end if;

  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then raise exception 'fulfillment not found'; end if;
  if f.status <> 'offered' then raise exception 'not in offered state'; end if;
  if auth.role() <> 'service_role'
     and not public.is_admin()
     and f.distributor_id <> v_dist then
    raise exception 'not your assignment';
  end if;

  v_from := f.status;

  if f.distributor_id is not null and f.product_id is not null then
    perform public.release_supplier_stock(f.distributor_id, f.product_id, f.quantity);
    insert into public.fulfillment_rejects (order_item_id, distributor_id, reason)
    values (f.order_item_id, f.distributor_id, p_reason)
    on conflict (order_item_id, distributor_id) do update
      set reason = excluded.reason, created_at = now();
  end if;

  update public.order_fulfillments set
    status = 'rejected',
    reject_reason = p_reason,
    rejected_at = now(),
    attempt_number = attempt_number + 1
  where id = p_fulfillment_id
  returning * into f;

  perform public.log_fulfillment_event(
    p_fulfillment_id, 'rejected', v_from, 'rejected',
    jsonb_build_object('reason', p_reason)
  );

  -- Auto-reroute; customer_unit_price stays locked
  return public.auto_assign_fulfillment(p_fulfillment_id);
end $$;

create or replace function public.admin_reroute_fulfillment(
  p_fulfillment_id uuid,
  p_distributor_id uuid default null,
  p_reason text default null
) returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_from fulfillment_status;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then raise exception 'fulfillment not found'; end if;

  if f.status in ('accepted', 'packed', 'shipped', 'delivered') then
    raise exception 'cannot reroute after accept without cancel flow';
  end if;

  v_from := f.status;

  if f.status = 'offered' and f.distributor_id is not null and f.product_id is not null then
    perform public.release_supplier_stock(f.distributor_id, f.product_id, f.quantity);
  end if;

  update public.order_fulfillments set
    status = 'pending',
    attempt_number = attempt_number + 1,
    reject_reason = coalesce(p_reason, reject_reason),
    notes = trim(both from coalesce(notes, '') || E'\n' || coalesce('Admin reroute: ' || p_reason, 'Admin reroute'))
  where id = p_fulfillment_id;

  perform public.log_fulfillment_event(
    p_fulfillment_id, 'rerouted', v_from, 'pending',
    jsonb_build_object('reason', p_reason, 'forced_distributor', p_distributor_id)
  );

  if p_distributor_id is not null then
    return public.assign_fulfillment(p_fulfillment_id, p_distributor_id, true);
  end if;
  return public.auto_assign_fulfillment(p_fulfillment_id);
end $$;

create or replace function public.expire_stale_fulfillment_offers()
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select id from public.order_fulfillments
    where status = 'offered'
      and sla_deadline is not null
      and sla_deadline < now()
  loop
    -- Use reject path so stock releases + auto-reroute runs
    perform public.reject_fulfillment(r.id, 'SLA expired');
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.order_fulfillments enable row level security;
alter table public.fulfillment_events enable row level security;
alter table public.fulfillment_rejects enable row level security;

drop policy if exists "admin all fulfillments" on public.order_fulfillments;
create policy "admin all fulfillments" on public.order_fulfillments
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "distributor read own fulfillments" on public.order_fulfillments;
create policy "distributor read own fulfillments" on public.order_fulfillments
  for select using (distributor_id = public.current_distributor_id());

drop policy if exists "customer read order fulfillments" on public.order_fulfillments;
create policy "customer read order fulfillments" on public.order_fulfillments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "admin all fulfillment events" on public.fulfillment_events;
create policy "admin all fulfillment events" on public.fulfillment_events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "distributor read own fulfillment events" on public.fulfillment_events;
create policy "distributor read own fulfillment events" on public.fulfillment_events
  for select using (
    exists (
      select 1 from public.order_fulfillments f
      where f.id = fulfillment_id
        and f.distributor_id = public.current_distributor_id()
    )
  );

drop policy if exists "admin all fulfillment rejects" on public.fulfillment_rejects;
create policy "admin all fulfillment rejects" on public.fulfillment_rejects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "distributor read own supplier products" on public.supplier_products;
create policy "distributor read own supplier products" on public.supplier_products
  for select using (distributor_id = public.current_distributor_id());

drop policy if exists "distributor update own supplier stock" on public.supplier_products;
create policy "distributor update own supplier stock" on public.supplier_products
  for update using (distributor_id = public.current_distributor_id())
  with check (distributor_id = public.current_distributor_id());

drop policy if exists "distributor read self" on public.distributors;
create policy "distributor read self" on public.distributors
  for select using (user_id = auth.uid() or public.is_admin());

grant execute on function public.accept_fulfillment(uuid) to authenticated;
grant execute on function public.reject_fulfillment(uuid, text) to authenticated;
grant execute on function public.admin_reroute_fulfillment(uuid, uuid, text) to authenticated;
grant execute on function public.create_fulfillments_for_order(uuid) to authenticated;
grant execute on function public.create_fulfillments_for_order(uuid) to service_role;
grant execute on function public.assign_fulfillment(uuid, uuid, boolean) to authenticated;
grant execute on function public.auto_assign_fulfillment(uuid) to authenticated;
grant execute on function public.expire_stale_fulfillment_offers() to authenticated;

-- ---------------------------------------------------------------------------
-- Ops notes (manual):
-- 1. Create Auth user for a distributor, set public.users.role = 'distributor'
-- 2. Link: update distributors set user_id = '<auth-user-uuid>' where id = '...';
-- 3. Seed supplier_products.stock / cost_price for products they can fulfill
-- 4. After paid order insert: select create_fulfillments_for_order('<order-id>');
-- ---------------------------------------------------------------------------
