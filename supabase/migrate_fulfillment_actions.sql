-- ============================================================================
-- Magic-link / WhatsApp action tokens + service-role accept
-- Run after migrate_fulfillment.sql
-- ============================================================================

-- Allow system (service role) to accept without distributor session
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
  where id = f.order_id and status = 'pending';

  perform public.log_fulfillment_event(
    p_fulfillment_id, 'accepted', 'offered', 'accepted', '{}'::jsonb
  );
  return f;
end $$;

-- One-time codes for magic links + WhatsApp button payloads
create table if not exists public.fulfillment_action_tokens (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  fulfillment_id uuid not null references public.order_fulfillments(id) on delete cascade,
  distributor_id uuid not null references public.distributors(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_action text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ff_action_tokens_code
  on public.fulfillment_action_tokens(code);
create index if not exists idx_ff_action_tokens_ff
  on public.fulfillment_action_tokens(fulfillment_id);

alter table public.fulfillment_action_tokens enable row level security;

drop policy if exists "admin all action tokens" on public.fulfillment_action_tokens;
create policy "admin all action tokens" on public.fulfillment_action_tokens
  for all using (public.is_admin()) with check (public.is_admin());
