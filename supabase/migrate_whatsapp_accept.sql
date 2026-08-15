-- Ensure WhatsApp / magic-link accept works via service_role
-- and grants are present. Safe to re-run.

create or replace function public.accept_fulfillment(p_fulfillment_id uuid)
returns public.order_fulfillments
language plpgsql security definer set search_path = public as $$
declare
  f public.order_fulfillments;
  v_ok boolean;
  v_dist uuid;
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
  where id = f.order_id and status in ('pending', 'confirmed');

  perform public.log_fulfillment_event(
    p_fulfillment_id, 'accepted', 'offered', 'accepted', '{}'::jsonb
  );
  return f;
end $$;

grant execute on function public.accept_fulfillment(uuid) to authenticated;
grant execute on function public.accept_fulfillment(uuid) to service_role;
grant execute on function public.reject_fulfillment(uuid, text) to authenticated;
grant execute on function public.reject_fulfillment(uuid, text) to service_role;
