-- Optional catalog visuals. Mapper also synthesizes placeholders if empty.
-- Run in Supabase SQL editor after auto_approval migration if desired.

update public.categories
set image_url = 'https://picsum.photos/seed/' || slug || '/800/600'
where image_url is null
   or btrim(image_url) = '';

-- product_images is jsonb on products in this schema
update public.products
set product_images = jsonb_build_array(
  jsonb_build_object(
    'id', id::text || '-img',
    'url', 'https://picsum.photos/seed/' || slug || '/800/800',
    'alt', title,
    'sort_order', 0
  )
)
where product_images is null
   or product_images = '[]'::jsonb
   or jsonb_array_length(product_images) = 0;
