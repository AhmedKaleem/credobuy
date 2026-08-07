-- ============================================================================
-- CredoBuy — Seed data
-- Run after schema.sql + rls.sql.
--
-- The full product catalogue lives as typed data in `src/data/products.ts`
-- (173 products with taxonomy columns). After applying schema.sql +
-- migrate_product_taxonomy.sql, sync products from the app data or replace
-- the representative inserts below.
-- ============================================================================

-- ---- Categories ------------------------------------------------------------
insert into public.categories (slug, name, description, icon, sort_order) values
  ('cases-and-covers','Cases & Covers','Slim, rugged and designer back covers.','Smartphone',1),
  ('screen-protectors','Screen Protectors','Tempered glass and privacy guards.','ShieldCheck',2),
  ('chargers','Chargers','Fast wall and wireless chargers.','Zap',3),
  ('charging-cables','Charging Cables','Durable braided USB-C, Lightning cables.','Cable',4),
  ('power-banks','Power Banks','Pocket to high-capacity power banks.','BatteryCharging',5),
  ('earphones-and-earbuds','Earphones & Earbuds','Wired, TWS and neckbands.','Headphones',6),
  ('mobile-holders-and-stands','Holders & Stands','Car mounts and desk stands.','TabletSmartphone',7),
  ('mobile-photography-accessories','Photography Accessories','Gimbals, tripods, lenses.','Camera',8),
  ('magsafe-and-wallets','MagSafe & Wallets','Magnetic wallets, rings and mounts.','Wallet',9),
  ('earbuds-cases','Earbuds Cases','Protective cases for AirPods and earbuds.','Package',10),
  ('watch-bands','Watch Bands','Sport, leather and metal bands.','Watch',11),
  ('tablet-cases','Tablet & iPad Cases','Folios and rugged covers for tablets.','Tablet',12),
  ('straps-and-charms','Straps & Charms','Crossbody straps, wrist straps and charms.','Sparkles',13)
on conflict (slug) do nothing;

-- ---- Accessory brands ------------------------------------------------------
insert into public.brands (slug, name) values
  ('mous','Mous'),('dbrand','dbrand'),('nomad','Nomad'),
  ('esr','ESR'),('casetify','CASETiFY'),('credobuy','CredoBuy')
on conflict (slug) do nothing;

-- ---- Device brands (10) ----------------------------------------------------
insert into public.device_brands (slug, name, sort_order) values
  ('apple','Apple',1),('samsung','Samsung',2),('oneplus','OnePlus',3),('xiaomi','Xiaomi',4),
  ('realme','Realme',5),('vivo','Vivo',6),('oppo','Oppo',7),('google','Google',8),
  ('motorola','Motorola',9),('nothing','Nothing',10)
on conflict (slug) do nothing;

-- ---- Device models (30) ----------------------------------------------------
insert into public.device_models (device_brand_id, slug, name, release_year)
select b.id, m.slug, m.name, m.year from (values
  ('apple','iphone-16-pro-max','iPhone 16 Pro Max',2024),
  ('apple','iphone-16-pro','iPhone 16 Pro',2024),
  ('apple','iphone-16','iPhone 16',2024),
  ('apple','iphone-15','iPhone 15',2023),
  ('samsung','galaxy-s24-ultra','Galaxy S24 Ultra',2024),
  ('samsung','galaxy-s24','Galaxy S24',2024),
  ('samsung','galaxy-a55','Galaxy A55',2024),
  ('samsung','galaxy-m35','Galaxy M35',2024),
  ('oneplus','oneplus-12','OnePlus 12',2024),
  ('oneplus','oneplus-12r','OnePlus 12R',2024),
  ('oneplus','oneplus-nord-4','OnePlus Nord 4',2024),
  ('xiaomi','xiaomi-14','Xiaomi 14',2024),
  ('xiaomi','redmi-note-13-pro','Redmi Note 13 Pro',2024),
  ('xiaomi','redmi-13c','Redmi 13C',2023),
  ('realme','realme-12-pro','Realme 12 Pro+',2024),
  ('realme','realme-narzo-70','Realme Narzo 70',2024),
  ('realme','realme-gt-6','Realme GT 6',2024),
  ('vivo','vivo-v30-pro','Vivo V30 Pro',2024),
  ('vivo','vivo-y200','Vivo Y200',2024),
  ('vivo','vivo-x100','Vivo X100',2024),
  ('oppo','oppo-reno-12-pro','Oppo Reno 12 Pro',2024),
  ('oppo','oppo-f27-pro','Oppo F27 Pro+',2024),
  ('oppo','oppo-a79','Oppo A79',2023),
  ('google','pixel-9-pro','Pixel 9 Pro',2024),
  ('google','pixel-8a','Pixel 8a',2024),
  ('motorola','moto-edge-50-pro','Moto Edge 50 Pro',2024),
  ('motorola','moto-g84','Moto G84',2023),
  ('nothing','nothing-phone-2','Nothing Phone 2',2023),
  ('nothing','nothing-phone-2a','Nothing Phone 2a',2024),
  ('nothing','cmf-phone-1','CMF Phone 1',2024)
) as m(brand_slug, slug, name, year)
join public.device_brands b on b.slug = m.brand_slug
on conflict (slug) do nothing;

-- ---- Coupons ---------------------------------------------------------------
insert into public.coupons (code, description, type, value, min_order, max_discount, active) values
  ('CREDO10','10% off on your first order','percent',10,499,300,true),
  ('FLAT150','Flat ₹150 off on orders above ₹999','flat',150,999,null,true),
  ('TN20','Tamil Nadu special — 20% off up to ₹500','percent',20,1499,500,true)
on conflict (code) do nothing;

-- ---- Distributors ----------------------------------------------------------
insert into public.distributors (name, contact_person, phone, email, city, state) values
  ('Chennai Mobile Accessories Pvt Ltd','Suresh Babu','9840012345','sales@chennaimobacc.in','Chennai','Tamil Nadu'),
  ('Coimbatore Gadget Hub','Lakshmi Narayanan','9842198765','orders@cbegadgethub.in','Coimbatore','Tamil Nadu'),
  ('Madurai TechTrade','Vignesh R','9843321100','contact@maduraitechtrade.in','Madurai','Tamil Nadu'),
  ('Bengaluru Distribution Co','Anil Gupta','9845567890','hello@blrdistro.in','Bengaluru','Karnataka');

-- ---- Representative products (extend to the full 40 from src/data) ----------
insert into public.products
  (slug, title, brand_id, category_id, short_description, price, mrp, rating, review_count,
   stock_status, stock, connector_type, wattage, colors, material, warranty_months,
   universal, is_trending, is_best_seller, is_new_arrival, features, specs, tags)
select p.slug, p.title, b.id, c.id, p.short_description, p.price, p.mrp, p.rating, p.review_count,
       p.stock_status::stock_status, p.stock, p.connector_type, p.wattage, p.colors::jsonb, p.material,
       p.warranty_months, p.universal, p.is_trending, p.is_best_seller, p.is_new_arrival,
       p.features::jsonb, p.specs::jsonb, p.tags::jsonb
from (values
  ('spigen-tough-armor-iphone-16-pro','Spigen Tough Armor Case – iPhone 16 Pro','spigen','cases-and-covers',
    'Military-grade dual-layer protection with a kickstand.',1499,2999,4.6,1284,'in_stock',120,
    null,null,'["Matte Black","Metal Slate"]','TPU + Polycarbonate',6,false,true,true,false,
    '["MIL-STD drop protection","Built-in kickstand"]','[{"label":"Type","value":"Back Cover"}]','["rugged"]'),
  ('credobuy-67w-gan-charger','CredoBuy 67W GaN Fast Charger (Dual USB-C)','credobuy','chargers',
    'Compact GaN charger powers laptop and phone together.',1799,3499,4.6,1543,'in_stock',210,
    'USB-C',67,'["White","Black"]',null,12,true,true,true,false,
    '["67W total output","Dual USB-C + USB-A"]','[{"label":"Output","value":"67W"}]','["gan"]'),
  ('ambrane-20000mah-power-bank','Ambrane 20000mAh 22.5W Power Bank','ambrane','power-banks',
    'High-capacity power bank with fast charging and triple output.',1499,2999,4.4,3120,'in_stock',180,
    'USB-C',22,'["Black","Blue"]',null,12,true,true,true,false,
    '["20000mAh capacity","22.5W fast charging"]','[{"label":"Capacity","value":"20000mAh"}]','["high-capacity"]'),
  ('boat-airdopes-141-tws','boAt Airdopes 141 TWS Earbuds','boat','earphones-and-earbuds',
    '42-hour playback TWS earbuds with beast mode gaming.',1099,2990,4.3,45210,'in_stock',260,
    'USB-C',null,'["Bold Black","Cool White","Warm Red"]',null,12,true,true,true,false,
    '["42 hours playback","Beast low-latency mode"]','[{"label":"Type","value":"TWS"}]','["tws"]')
) as p(slug,title,brand_slug,category_slug,short_description,price,mrp,rating,review_count,stock_status,stock,
       connector_type,wattage,colors,material,warranty_months,universal,is_trending,is_best_seller,is_new_arrival,
       features,specs,tags)
join public.brands b on b.slug = p.brand_slug
join public.categories c on c.slug = p.category_slug
on conflict (slug) do nothing;

-- Example compatibility mapping (case fits iPhone 16 Pro).
insert into public.product_compatibility (product_id, device_model_id)
select pr.id, dm.id from public.products pr, public.device_models dm
where pr.slug = 'spigen-tough-armor-iphone-16-pro' and dm.slug = 'iphone-16-pro'
on conflict do nothing;
