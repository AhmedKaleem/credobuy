-- Add / upgrade banners table for admin-managed hero carousel.
-- Safe to run on existing projects.

create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  eyebrow text,
  cta_label text,
  cta_href text,
  image_url text,
  bg text,
  text_tone text not null default 'light',
  sort_order int not null default 0,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now()
);

alter table public.banners add column if not exists eyebrow text;
alter table public.banners add column if not exists image_url text;
alter table public.banners add column if not exists text_tone text default 'light';
alter table public.banners add column if not exists valid_from timestamptz;
alter table public.banners add column if not exists valid_to timestamptz;
alter table public.banners add column if not exists created_at timestamptz default now();

alter table public.banners enable row level security;

drop policy if exists "public read banners" on public.banners;
drop policy if exists "admin write banners" on public.banners;

create policy "public read banners"
  on public.banners for select
  using (
    is_active
    and (valid_from is null or valid_from <= now())
    and (valid_to is null or valid_to >= now())
  );

create policy "admin write banners"
  on public.banners for all
  using (public.is_admin())
  with check (public.is_admin());
