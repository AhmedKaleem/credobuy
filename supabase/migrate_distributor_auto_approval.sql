-- Plan B: distributor auto_approval + webhook events already separate.
-- Run in Supabase SQL editor.

alter table public.distributors
  add column if not exists auto_approval boolean not null default false;

comment on column public.distributors.auto_approval is
  'When true, offered fulfillments for this distributor are accepted automatically (no WhatsApp/portal action).';
