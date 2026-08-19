-- Log inbound WhatsApp webhooks so we can see if Meta is calling us.
-- Run in Supabase SQL editor.

create table if not exists public.whatsapp_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  received_at timestamptz not null default now(),
  http_method text not null default 'POST',
  signature_ok boolean,
  phone_number_id text,
  message_types text[],
  from_phone text,
  parsed_action text,
  parsed_code text,
  handler_result text,
  payload jsonb,
  error text
);

create index if not exists idx_wa_webhook_events_received
  on public.whatsapp_webhook_events(received_at desc);

alter table public.whatsapp_webhook_events enable row level security;

drop policy if exists "admin read wa webhook events" on public.whatsapp_webhook_events;
create policy "admin read wa webhook events" on public.whatsapp_webhook_events
  for select using (public.is_admin());

-- service role inserts; no public write policy needed
grant select on public.whatsapp_webhook_events to authenticated;
grant all on public.whatsapp_webhook_events to service_role;
