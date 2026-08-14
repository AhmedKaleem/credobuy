-- Fix guest checkout: create_fulfillments_for_order treated null user_id as "order not found".
-- Guest orders intentionally have user_id = null; only missing rows should raise that error.
-- Run in Supabase SQL editor.

create or replace function public.create_fulfillments_for_order(p_order_id uuid)
returns setof public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  item record;
  f public.order_fulfillments;
  v_owner uuid;
begin
  select user_id into v_owner from public.orders where id = p_order_id;
  if not found then
    raise exception 'order not found';
  end if;

  -- Guest orders (null owner) may only be fulfilled by service_role / admin.
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

grant execute on function public.create_fulfillments_for_order(uuid) to authenticated;
grant execute on function public.create_fulfillments_for_order(uuid) to service_role;
