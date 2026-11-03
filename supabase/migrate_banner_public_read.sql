-- Let the homepage read banner rows (including the `image` column)
-- without hiding them on valid_from / valid_to.
-- Run in the Supabase SQL editor if the hero still shows placeholder art.

alter table public.banners add column if not exists image text;
alter table public.banners add column if not exists image_url text;

drop policy if exists "public read banners" on public.banners;
create policy "public read banners" on public.banners
  for select using (is_active is not false);
