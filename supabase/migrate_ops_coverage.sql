-- Restock wait window, support tickets, admin order-item updates.
-- Run in Supabase SQL editor after migrate_fulfillment_unfulfillable.sql.

alter table public.order_fulfillments
  add column if not exists waiting_until timestamptz;

alter table public.order_fulfillments
  add column if not exists waiting_notified_at timestamptz;

comment on column public.order_fulfillments.waiting_until is
  'When no partner can fill the line, hold until this time then fail for admin refund/substitute.';

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text not null default 'Contact form message',
  body text not null,
  status text not null default 'open' check (status in ('open', 'replied', 'closed')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_support_tickets_status on public.support_tickets(status, created_at desc);

alter table public.support_tickets enable row level security;

drop policy if exists "admin all tickets" on public.support_tickets;
create policy "admin all tickets" on public.support_tickets
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin update order items" on public.order_items;
create policy "admin update order items" on public.order_items
  for update using (public.is_admin()) with check (public.is_admin());

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
    rejected_at = null,
    waiting_until = null
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
  v_reason text;
begin
  select * into f from public.order_fulfillments where id = p_fulfillment_id for update;
  if not found then
    raise exception 'fulfillment not found';
  end if;

  v_from := f.status;

  if f.attempt_number > f.max_attempts then
    update public.order_fulfillments set status = 'failed', waiting_until = null
    where id = p_fulfillment_id returning * into f;
    perform public.log_fulfillment_event(
      p_fulfillment_id, 'failed', v_from, 'failed',
      jsonb_build_object('reason', 'max_attempts')
    );
    return f;
  end if;

  v_dist := public.pick_next_distributor(
    f.product_id, f.quantity, f.order_item_id, f.customer_unit_price
  );
  if v_dist is not null then
    return public.assign_fulfillment(p_fulfillment_id, v_dist, false);
  end if;

  v_reason := 'no_distributor_available';
  if exists (
    select 1
    from public.supplier_products sp
    join public.distributors d on d.id = sp.distributor_id
    where sp.product_id = f.product_id
      and d.is_active
      and sp.available >= f.quantity
      and sp.cost_price > f.customer_unit_price
      and not exists (
        select 1 from public.fulfillment_rejects fr
        where fr.order_item_id = f.order_item_id
          and fr.distributor_id = sp.distributor_id
      )
  ) then
    v_reason := 'no_profitable_distributor';
  end if;

  -- Wait for restock unless the hold already expired.
  if f.waiting_until is null then
    update public.order_fulfillments set
      status = 'pending',
      waiting_until = now() + interval '2 days',
      reject_reason = v_reason
    where id = p_fulfillment_id returning * into f;
    perform public.log_fulfillment_event(
      p_fulfillment_id, 'note', v_from, 'pending',
      jsonb_build_object('reason', v_reason, 'waiting_until', f.waiting_until)
    );
    return f;
  end if;

  if f.waiting_until > now() then
    return f;
  end if;

  update public.order_fulfillments set status = 'failed', waiting_until = null
  where id = p_fulfillment_id returning * into f;
  perform public.log_fulfillment_event(
    p_fulfillment_id, 'failed', v_from, 'failed',
    jsonb_build_object('reason', v_reason, 'wait_expired', true)
  );
  return f;
end $$;

create or replace function public.retry_waiting_fulfillments()
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select id from public.order_fulfillments
    where status = 'pending'
      and waiting_until is not null
  loop
    perform public.auto_assign_fulfillment(r.id);
    n := n + 1;
  end loop;
  return n;
end $$;

grant execute on function public.retry_waiting_fulfillments() to authenticated;
grant execute on function public.retry_waiting_fulfillments() to service_role;
