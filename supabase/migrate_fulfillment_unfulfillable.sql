-- Skip distributors whose cost exceeds the locked customer price.
-- Track when we have already notified/refunded a failed line.
-- Run in Supabase SQL editor.

alter table public.order_fulfillments
  add column if not exists failure_notified_at timestamptz;

alter table public.payments
  add column if not exists refunded_amount numeric(10,2) not null default 0;

comment on column public.order_fulfillments.failure_notified_at is
  'Set after ops + customer were notified (and refund attempted) for a failed line.';

drop function if exists public.pick_next_distributor(uuid, integer, uuid);

create or replace function public.pick_next_distributor(
  p_product_id uuid,
  p_qty int,
  p_order_item_id uuid,
  p_max_unit_cost numeric default null
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
    and (p_max_unit_cost is null or sp.cost_price <= p_max_unit_cost)
    and not exists (
      select 1 from public.fulfillment_rejects fr
      where fr.order_item_id = p_order_item_id
        and fr.distributor_id = sp.distributor_id
    )
  order by sp.cost_price asc, sp.lead_time_days asc, d.priority asc, d.name asc
  limit 1;

  return v_id;
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
    update public.order_fulfillments set status = 'failed'
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
  if v_dist is null then
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

    update public.order_fulfillments set status = 'failed'
    where id = p_fulfillment_id returning * into f;
    perform public.log_fulfillment_event(
      p_fulfillment_id, 'failed', v_from, 'failed',
      jsonb_build_object('reason', v_reason)
    );
    return f;
  end if;

  return public.assign_fulfillment(p_fulfillment_id, v_dist, false);
end $$;
