-- ============================================================================
-- CredoBuy — FULL data seed (generated from src/data/*)
--
-- Source files covered:
--   1. src/data/admin.ts      -> optional demo/analytics tables (bottom)
--   2. src/data/catalog.ts    -> categories, brands, device_brands, device_models
--   3. src/data/marketing.ts  -> coupons, distributors, reviews, banners, pincodes
--   4. src/data/navigation.ts -> verticals (optional table)
--   5. src/data/products.ts   -> products, product_variants, product_images,
--                                inventory, product_compatibility
--
-- Run AFTER supabase/schema.sql (and optionally rls.sql).
-- Safe to re-run: catalog inserts use ON CONFLICT DO NOTHING. (Reviews and the
-- optional demo tables are truncated first so re-runs don't duplicate them.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CATEGORIES  (catalog.ts)
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, description, icon, sort_order) values
  ('cases-and-covers','Cases & Covers','Slim, rugged and designer back covers for every phone.','Smartphone',1),
  ('screen-protectors','Screen Protectors','Tempered glass and privacy guards with edge-to-edge fit.','ShieldCheck',2),
  ('chargers','Chargers','Fast wall and wireless chargers from 20W to 120W.','Zap',3),
  ('charging-cables','Charging Cables','Durable braided USB-C, Lightning and Micro-USB cables.','Cable',4),
  ('power-banks','Power Banks','Pocket to high-capacity power banks with fast charging.','BatteryCharging',5),
  ('earphones-and-earbuds','Earphones & Earbuds','Wired earphones, TWS earbuds and neckbands.','Headphones',6),
  ('mobile-holders-and-stands','Holders & Stands','Car mounts, desk stands and adjustable holders.','TabletSmartphone',7),
  ('mobile-photography-accessories','Photography Accessories','Gimbals, tripods, lenses and ring lights for creators.','Camera',8)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. ACCESSORY BRANDS  (catalog.ts)
-- ---------------------------------------------------------------------------
insert into public.brands (slug, name) values
  ('credobuy','CredoBuy'),
  ('spigen','Spigen'),
  ('boat','boAt'),
  ('portronics','Portronics'),
  ('ambrane','Ambrane'),
  ('mivi','Mivi'),
  ('urbn','URBN'),
  ('stuffcool','Stuffcool'),
  ('zebronics','Zebronics'),
  ('noise','Noise'),
  ('belkin','Belkin'),
  ('anker','Anker')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 3. DEVICE BRANDS  (catalog.ts)
-- ---------------------------------------------------------------------------
insert into public.device_brands (slug, name, sort_order) values
  ('apple','Apple',1),
  ('samsung','Samsung',2),
  ('oneplus','OnePlus',3),
  ('xiaomi','Xiaomi',4),
  ('realme','Realme',5),
  ('vivo','Vivo',6),
  ('oppo','Oppo',7),
  ('google','Google',8),
  ('motorola','Motorola',9),
  ('nothing','Nothing',10)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 4. DEVICE MODELS  (catalog.ts)
-- Slugs match the app's generator exactly (note the trailing "-" on the two
-- "Pro+" models, which is how catalog.ts produces them).
-- ---------------------------------------------------------------------------
insert into public.device_models (device_brand_id, slug, name, release_year)
select b.id, m.slug, m.name, m.year
from (values
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
  ('realme','realme-12-pro-','Realme 12 Pro+',2024),
  ('realme','realme-narzo-70','Realme Narzo 70',2024),
  ('realme','realme-gt-6','Realme GT 6',2024),
  ('vivo','vivo-v30-pro','Vivo V30 Pro',2024),
  ('vivo','vivo-y200','Vivo Y200',2024),
  ('vivo','vivo-x100','Vivo X100',2024),
  ('oppo','oppo-reno-12-pro','Oppo Reno 12 Pro',2024),
  ('oppo','oppo-f27-pro-','Oppo F27 Pro+',2024),
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

-- ---------------------------------------------------------------------------
-- 5. PRODUCTS  (products.ts) — all 40
-- stock_status and description are derived exactly as the app's build() does.
-- ---------------------------------------------------------------------------
insert into public.products
  (slug, title, brand_id, category_id, short_description, description,
   price, mrp, rating, review_count, stock_status, stock,
   features, specs, connector_type, wattage, colors, material, warranty_months,
   universal, is_trending, is_best_seller, is_new_arrival, tags)
select
  s.slug, s.title, b.id, c.id, s.short,
  s.short || ' ' || coalesce((select string_agg(x, ' ') from jsonb_array_elements_text(s.features::jsonb) x), ''),
  s.price, s.mrp, s.rating, s.review_count,
  (case when s.stock <= 0 then 'out_of_stock' when s.stock < 10 then 'low_stock' else 'in_stock' end)::stock_status,
  s.stock,
  s.features::jsonb, s.specs::jsonb, s.connector_type, s.wattage, s.colors::jsonb, s.material, s.warranty_months,
  s.universal, s.is_trending, s.is_best_seller, s.is_new_arrival, s.tags::jsonb
from (values
  -- Cases & Covers
  ('spigen-tough-armor-iphone-16-pro','Spigen Tough Armor Case – iPhone 16 Pro','spigen','cases-and-covers','Military-grade dual-layer protection with a kickstand.',1499,2999,4.6,1284,120,null::text,null::int,'["Matte Black","Metal Slate"]','TPU + Polycarbonate',6,false,true,true,false,'["Certified MIL-STD 810G-516.6 drop protection","Built-in kickstand for hands-free viewing","Air Cushion technology on all corners","Precise cutouts and raised bezels"]','[{"label":"Type","value":"Back Cover"},{"label":"Compatibility","value":"iPhone 16 Pro"},{"label":"Closure","value":"Slip On"}]','["rugged","kickstand"]'),
  ('credobuy-silicone-case-iphone-16-pro-max','CredoBuy Liquid Silicone Case – iPhone 16 Pro Max','credobuy','cases-and-covers','Soft-touch silicone with microfiber lining and camera guard.',699,1299,4.4,542,200,null,null,'["Midnight","Storm Blue","Clay Pink"]','Liquid Silicone',6,false,false,false,true,'["Premium liquid silicone finish","Microfiber inner lining","Raised camera protection","Anti-slip grip"]','[{"label":"Type","value":"Back Cover"},{"label":"Compatibility","value":"iPhone 16 Pro Max"}]','["silicone","slim"]'),
  ('spigen-rugged-armor-galaxy-s24-ultra','Spigen Rugged Armor Case – Galaxy S24 Ultra','spigen','cases-and-covers','Matte carbon-fibre texture with shock-absorbing spider design.',1299,2499,4.7,933,90,null,null,'["Matte Black"]','TPU',6,false,false,true,false,'["Air Cushion corners","Carbon-fibre accents","Anti-fingerprint matte finish","S-Pen friendly cutouts"]','[{"label":"Type","value":"Back Cover"},{"label":"Compatibility","value":"Galaxy S24 Ultra"}]','["rugged"]'),
  ('credobuy-clear-case-oneplus-12','CredoBuy Ultra Clear Case – OnePlus 12','credobuy','cases-and-covers','Anti-yellowing transparent case that shows off your phone.',449,999,4.2,311,8,null,null,'["Transparent"]','TPU',3,false,false,false,false,'["Anti-yellowing coating","Reinforced bumper corners","Slim 1.2mm profile"]','[{"label":"Type","value":"Back Cover"},{"label":"Compatibility","value":"OnePlus 12"}]','["clear","slim"]'),
  ('credobuy-leather-wallet-case-pixel-9-pro','CredoBuy Leather Wallet Case – Pixel 9 Pro','credobuy','cases-and-covers','Vegan-leather flip case with card slots and magnetic close.',1199,2199,4.3,156,45,null,null,'["Tan Brown","Charcoal"]','Vegan Leather',6,false,false,false,false,'["3 card slots","Magnetic closure","Foldable stand"]','[{"label":"Type","value":"Flip Cover"},{"label":"Compatibility","value":"Pixel 9 Pro"}]','["wallet","flip"]'),
  -- Screen Protectors
  ('credobuy-tempered-glass-iphone-16-pro','CredoBuy 9H Tempered Glass – iPhone 16 Pro (Pack of 2)','credobuy','screen-protectors','Edge-to-edge 9H tempered glass with easy-install frame.',399,899,4.5,2210,300,null,null,'["Clear"]','Tempered Glass',1,false,true,true,false,'["9H scratch resistance","Oleophobic anti-fingerprint coating","Bubble-free auto-alignment tray","Case-friendly 2.5D edges"]','[{"label":"Hardness","value":"9H"},{"label":"Pack","value":"2 Glass + Kit"},{"label":"Compatibility","value":"iPhone 16 Pro"}]','["9h","glass"]'),
  ('spigen-glastr-galaxy-s24','Spigen GLAS.tR Screen Protector – Galaxy S24','spigen','screen-protectors','Fingerprint-sensor compatible tempered glass with tray.',999,1799,4.6,640,75,null,null,'["Clear"]','Tempered Glass',3,false,false,false,false,'["Ultrasonic fingerprint compatible","Auto-align installation tray","AS-coated for clarity"]','[{"label":"Hardness","value":"9H"},{"label":"Compatibility","value":"Galaxy S20"}]','["glass"]'),
  ('credobuy-privacy-glass-iphone-16-pro-max','CredoBuy Privacy Tempered Glass – iPhone 16 Pro Max','credobuy','screen-protectors','28° privacy filter keeps your screen for your eyes only.',549,1199,4.3,421,60,null,null,'["Privacy"]','Tempered Glass',1,false,false,false,true,'["Anti-spy privacy filter","9H hardness","True-touch clarity"]','[{"label":"Privacy Angle","value":"28°"},{"label":"Compatibility","value":"iPhone 16 Pro Max"}]','["privacy"]'),
  ('credobuy-matte-guard-oneplus-12r','CredoBuy Matte Anti-Glare Guard – OnePlus 12R','credobuy','screen-protectors','Matte finish reduces glare and fingerprints for gaming.',329,699,4.1,188,140,null,null,'["Matte"]','Tempered Glass',1,false,false,false,false,'["Anti-glare matte","Smooth gaming glide","Fingerprint resistant"]','[{"label":"Finish","value":"Matte"},{"label":"Compatibility","value":"OnePlus 12R"}]','["matte","gaming"]'),
  ('credobuy-hydrogel-film-realme-gt-6','CredoBuy Hydrogel Film – Realme GT 6 (Pack of 2)','credobuy','screen-protectors','Self-healing flexible film with full curved-edge coverage.',249,599,4.0,97,0,null,null,'["Clear"]','Hydrogel',1,false,false,false,false,'["Self-healing TPU","Full curved coverage","Ultra-thin 0.15mm"]','[{"label":"Type","value":"Hydrogel"},{"label":"Compatibility","value":"Realme GT 6"}]','["film"]'),
  -- Chargers
  ('credobuy-67w-gan-charger','CredoBuy 67W GaN Fast Charger (Dual USB-C)','credobuy','chargers','Compact GaN charger powers laptop and phone together.',1799,3499,4.6,1543,210,'USB-C',67,'["White","Black"]',null,12,true,true,true,false,'["67W total power output","Dual USB-C + USB-A ports","GaN II heat efficiency","Foldable pins"]','[{"label":"Output","value":"67W"},{"label":"Ports","value":"2C + 1A"},{"label":"Tech","value":"GaN II"}]','["gan","fast-charging"]'),
  ('anker-nano-30w-charger','Anker Nano 30W USB-C Charger','anker','chargers','Ultra-portable 30W charger with foldable design.',1299,1999,4.7,880,130,'USB-C',30,'["White"]',null,18,true,false,true,false,'["30W PD output","PowerIQ 3.0","Foldable plug"]','[{"label":"Output","value":"30W"},{"label":"Ports","value":"1C"}]','["compact"]'),
  ('credobuy-magsafe-15w-wireless-charger','CredoBuy 15W MagSafe Wireless Charger','credobuy','chargers','Magnetic 15W wireless pad with strong alignment.',1499,2799,4.3,356,70,'USB-C',15,'["White","Space Grey"]',null,12,true,false,false,true,'["15W magnetic wireless","Case-friendly","LED charge indicator"]','[{"label":"Output","value":"15W"},{"label":"Type","value":"Wireless Magnetic"}]','["wireless","magsafe"]'),
  ('portronics-adapto-45w','Portronics Adapto 45W Super-Fast Charger','portronics','chargers','45W PPS charger tuned for Samsung Super Fast Charging.',999,1999,4.2,274,15,'USB-C',45,'["Black"]',null,12,true,false,false,false,'["45W PPS","USB-C PD","Multi-protocol"]','[{"label":"Output","value":"45W"},{"label":"Ports","value":"1C"}]','["pps"]'),
  ('credobuy-120w-hypercharge','CredoBuy 120W HyperCharge Wall Adapter','credobuy','chargers','Flagship 120W adapter for the fastest charging phones.',2499,4499,4.5,410,40,'USB-C',120,'["Black"]',null,12,true,true,false,false,'["120W max output","GaN cooling","Smart voltage detection"]','[{"label":"Output","value":"120W"},{"label":"Ports","value":"1C"}]','["gan","flagship"]'),
  -- Charging Cables
  ('credobuy-braided-usbc-100w-cable','CredoBuy 100W Braided USB-C to USB-C Cable (1.5m)','credobuy','charging-cables','Nylon-braided 100W cable with 480Mbps data transfer.',399,899,4.5,1876,400,'USB-C',100,'["Black","Grey"]','Nylon Braided',12,true,false,true,false,'["100W / 5A power delivery","Nylon-braided anti-tangle","20,000+ bend lifespan"]','[{"label":"Length","value":"1.5m"},{"label":"Power","value":"100W"},{"label":"Connector","value":"USB-C to USB-C"}]','["braided"]'),
  ('belkin-boostcharge-lightning-cable','Belkin BoostCharge USB-C to Lightning Cable (1m)','belkin','charging-cables','MFi-certified fast-charge cable for iPhone.',899,1499,4.6,522,95,'Lightning',20,'["White"]',null,24,true,false,false,false,'["Apple MFi certified","Fast charge PD","Durable connectors"]','[{"label":"Length","value":"1m"},{"label":"Connector","value":"USB-C to Lightning"}]','["mfi"]'),
  ('credobuy-micro-usb-cable','CredoBuy Fast Micro-USB Cable (1m, Pack of 2)','credobuy','charging-cables','Reliable Micro-USB cables for older phones and gadgets.',199,499,4.1,630,260,'Micro-USB',18,'["Black"]','PVC',6,true,false,false,false,'["2.4A fast charge","Pack of 2","Tangle-free"]','[{"label":"Length","value":"1m"},{"label":"Connector","value":"Micro-USB"}]','["value"]'),
  ('credobuy-3in1-multi-cable','CredoBuy 3-in-1 Multi Charging Cable','credobuy','charging-cables','One cable with USB-C, Lightning and Micro-USB tips.',349,799,4.0,289,5,'USB-C',65,'["Black","Red"]','Nylon Braided',6,true,true,false,false,'["3 connectors in one","65W max","Compact travel design"]','[{"label":"Length","value":"1.2m"},{"label":"Connector","value":"USB-C / Lightning / Micro"}]','["multi"]'),
  ('anker-powerline-usbc-2m','Anker PowerLine III USB-C Cable (2m)','anker','charging-cables','Extra-tough 2m cable rated for 25,000 bends.',799,1299,4.7,344,110,'USB-C',60,'["Black","White"]',null,18,true,false,false,false,'["25,000-bend lifespan","60W PD","2 metre reach"]','[{"label":"Length","value":"2m"},{"label":"Power","value":"60W"}]','["durable"]'),
  -- Power Banks
  ('ambrane-20000mah-power-bank','Ambrane 20000mAh 22.5W Power Bank','ambrane','power-banks','High-capacity power bank with fast charging and triple output.',1499,2999,4.4,3120,180,'USB-C',22,'["Black","Blue"]',null,12,true,true,true,false,'["20000mAh capacity","22.5W fast charging","Dual input (C + Micro)","Multi-layer protection"]','[{"label":"Capacity","value":"20000mAh"},{"label":"Output","value":"22.5W"},{"label":"Ports","value":"2A + 1C"}]','["high-capacity"]'),
  ('mivi-10000mah-pocket-power-bank','Mivi 10000mAh Pocket Power Bank','mivi','power-banks','Slim pocket-friendly power bank with 20W output.',999,1799,4.3,1440,220,'USB-C',20,'["Grey","Teal"]',null,12,true,false,true,false,'["10000mAh","20W PD","Slim metal body"]','[{"label":"Capacity","value":"10000mAh"},{"label":"Output","value":"20W"}]','["slim"]'),
  ('credobuy-magsafe-power-bank-10000','CredoBuy MagSafe Wireless Power Bank 10000mAh','credobuy','power-banks','Snap-on magnetic wireless power bank with kickstand.',2199,3999,4.2,210,55,'USB-C',20,'["White","Black"]',null,12,true,false,false,true,'["15W magnetic wireless","Built-in kickstand","USB-C PD 20W"]','[{"label":"Capacity","value":"10000mAh"},{"label":"Wireless","value":"15W"}]','["magsafe","wireless"]'),
  ('urbn-27000mah-power-bank','URBN 27000mAh 45W Power Bank','urbn','power-banks','Massive capacity charges laptops and multiple phones.',2499,4999,4.5,760,12,'USB-C',45,'["Black"]',null,12,true,false,false,false,'["27000mAh","45W laptop charging","Triple output"]','[{"label":"Capacity","value":"27000mAh"},{"label":"Output","value":"45W"}]','["laptop"]'),
  ('zebronics-5000mah-mini-power-bank','Zebronics 5000mAh Mini Power Bank','zebronics','power-banks','Ultra-compact backup power for emergencies.',599,1099,3.9,402,300,'USB-C',12,'["Black","White"]',null,6,true,false,false,false,'["5000mAh","12W output","Keychain-size"]','[{"label":"Capacity","value":"5000mAh"},{"label":"Output","value":"12W"}]','["mini"]'),
  -- Earphones & Earbuds
  ('boat-airdopes-141-tws','boAt Airdopes 141 TWS Earbuds','boat','earphones-and-earbuds','42-hour playback TWS earbuds with beast mode gaming.',1099,2990,4.3,45210,260,'USB-C',null,'["Bold Black","Cool White","Warm Red"]',null,12,true,true,true,false,'["Up to 42 hours playback","Beast low-latency mode","ENx noise cancellation for calls","IPX4 water resistance"]','[{"label":"Type","value":"TWS"},{"label":"Playback","value":"42 hrs"},{"label":"Driver","value":"8mm"}]','["tws","gaming"]'),
  ('noise-buds-vs104-tws','Noise Buds VS104 TWS Earbuds','noise','earphones-and-earbuds','Quad-mic ENC earbuds with 45-hour battery.',899,2499,4.1,18300,190,'USB-C',null,'["Jet Black","Sky Blue"]',null,12,true,false,true,false,'["45 hrs battery","Quad-mic ENC","Instacharge fast charge"]','[{"label":"Type","value":"TWS"},{"label":"Playback","value":"45 hrs"}]','["tws"]'),
  ('mivi-duopods-a25-tws','Mivi DuoPods A25 TWS Earbuds','mivi','earphones-and-earbuds','Made-in-India earbuds with big bass and AI ENC.',799,1999,4.0,9800,8,'USB-C',null,'["Black","White"]',null,12,true,false,false,false,'["13mm bass drivers","AI ENC","40 hrs playtime"]','[{"label":"Type","value":"TWS"},{"label":"Driver","value":"13mm"}]','["bass"]'),
  ('boat-bassheads-100-wired','boAt Bassheads 100 Wired Earphones','boat','earphones-and-earbuds','Iconic wired earphones with punchy bass and mic.',349,999,4.2,62000,500,'3.5mm',null,'["Black","Red","Blue"]',null,12,true,false,true,false,'["10mm drivers","In-line mic","Tangle-free cable"]','[{"label":"Type","value":"Wired"},{"label":"Jack","value":"3.5mm"}]','["wired","value"]'),
  ('mivi-collar-flash-neckband','Mivi Collar Flash Bluetooth Neckband','mivi','earphones-and-earbuds','Neckband with fast charge and 24-hour battery.',699,1799,4.1,12400,60,'USB-C',null,'["Black","Blue"]',null,12,true,false,false,true,'["24 hrs battery","Flash charge 10 min = 10 hrs","Magnetic buds"]','[{"label":"Type","value":"Neckband"},{"label":"Battery","value":"24 hrs"}]','["neckband"]'),
  -- Holders & Stands
  ('portronics-car-mount-clamp','Portronics Clamp Car Mobile Holder','portronics','mobile-holders-and-stands','One-touch dashboard car mount with 360° rotation.',499,1199,4.2,5400,150,null,null,'["Black"]','ABS Plastic',6,true,false,true,false,'["One-touch lock","360° rotation","Strong suction base"]','[{"label":"Type","value":"Car Mount"},{"label":"Rotation","value":"360°"}]','["car"]'),
  ('credobuy-aluminium-desk-stand','CredoBuy Aluminium Foldable Desk Stand','credobuy','mobile-holders-and-stands','Adjustable aluminium stand for phones and tablets.',599,1299,4.5,2100,130,null,null,'["Silver","Space Grey"]','Aluminium',12,true,true,false,false,'["Aircraft-grade aluminium","Adjustable angle","Anti-slip pads"]','[{"label":"Type","value":"Desk Stand"},{"label":"Material","value":"Aluminium"}]','["desk"]'),
  ('credobuy-magsafe-car-vent-mount','CredoBuy MagSafe Magnetic Car Vent Mount','credobuy','mobile-holders-and-stands','Strong magnetic vent mount with MagSafe alignment.',799,1599,4.3,780,40,null,null,'["Black"]','Zinc Alloy',12,true,false,false,true,'["N52 magnets","Vent clip design","Metal build"]','[{"label":"Type","value":"Car Vent Mount"},{"label":"Mount","value":"Magnetic"}]','["car","magsafe"]'),
  ('credobuy-adjustable-phone-grip-ring','CredoBuy Adjustable Finger Grip Ring Holder','credobuy','mobile-holders-and-stands','Slim ring holder that doubles as a kickstand.',199,499,4.0,3300,400,null,null,'["Black","Rose Gold","Silver"]','Zinc Alloy',3,true,false,false,false,'["360° rotating ring","Kickstand mode","3M adhesive"]','[{"label":"Type","value":"Ring Holder"},{"label":"Rotation","value":"360°"}]','["ring","grip"]'),
  ('portronics-modesk-tablet-stand','Portronics Modesk Tablet & Phone Stand','portronics','mobile-holders-and-stands','Height-adjustable stand for tablets and large phones.',899,1799,4.4,640,3,null,null,'["Black"]','Aluminium',6,true,false,false,false,'["Height adjustable","Fits up to 12.9 inch","Sturdy base"]','[{"label":"Type","value":"Tablet Stand"},{"label":"Max Size","value":"12.9\""}]','["tablet"]'),
  -- Photography Accessories
  ('credobuy-selfie-tripod-2in1','CredoBuy 2-in-1 Selfie Stick & Tripod','credobuy','mobile-photography-accessories','Bluetooth selfie stick that folds into a tripod.',799,1699,4.3,2900,120,null,null,'["Black"]','Aluminium',6,true,false,true,false,'["Detachable Bluetooth remote","Extends to 68cm","360° rotating head"]','[{"label":"Type","value":"Selfie Stick + Tripod"},{"label":"Max Length","value":"68cm"}]','["selfie","tripod"]'),
  ('credobuy-18cm-ring-light-clip','CredoBuy 18cm Clip-On Ring Light','credobuy','mobile-photography-accessories','Rechargeable ring light with 3 modes for creators.',649,1499,4.1,1100,90,'USB-C',null,'["White"]',null,6,true,true,false,false,'["3 light modes","10 brightness levels","Rechargeable"]','[{"label":"Type","value":"Ring Light"},{"label":"Size","value":"18cm"}]','["lighting","creator"]'),
  ('credobuy-clip-lens-kit-3in1','CredoBuy 3-in-1 Clip Lens Kit (Wide/Macro/Fisheye)','credobuy','mobile-photography-accessories','Universal clip-on lenses for creative mobile shots.',549,1299,3.9,470,60,null,null,'["Black"]','Glass + Alloy',3,true,false,false,false,'["Wide-angle lens","Macro lens","Fisheye lens","Universal clip"]','[{"label":"Type","value":"Lens Kit"},{"label":"Lenses","value":"3"}]','["lens"]'),
  ('zebronics-zeb-gimbal','Zebronics Zeb-Gimbal 3-Axis Stabilizer','zebronics','mobile-photography-accessories','Foldable 3-axis gimbal for buttery-smooth video.',3999,7999,4.4,320,18,'USB-C',null,'["Grey"]',null,12,true,false,false,true,'["3-axis stabilization","Face tracking","Foldable design","8 hrs battery"]','[{"label":"Type","value":"Gimbal"},{"label":"Axis","value":"3"}]','["gimbal","video"]'),
  ('credobuy-flexible-octopus-tripod','CredoBuy Flexible Octopus Tripod','credobuy','mobile-photography-accessories','Bendable-leg tripod that grips anywhere with a phone clamp.',399,899,4.2,1560,200,null,null,'["Black"]','Silicone + ABS',6,true,false,false,false,'["Wrappable flexible legs","Universal phone clamp","Bluetooth remote"]','[{"label":"Type","value":"Flexible Tripod"},{"label":"Load","value":"500g"}]','["tripod"]')
) as s(slug,title,brand_slug,category_slug,short,price,mrp,rating,review_count,stock,
       connector_type,wattage,colors,material,warranty_months,universal,
       is_trending,is_best_seller,is_new_arrival,features,specs,tags)
join public.brands b on b.slug = s.brand_slug
join public.categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 6. PRODUCT VARIANTS  (one per colour, exactly as build() derives them)
--    sku = UPPER(slug without dashes) + '-' + index; stock = floor(stock/#colors)
-- ---------------------------------------------------------------------------
insert into public.product_variants (product_id, sku, name, color, material, price, mrp, stock, is_default)
select
  p.id,
  upper(replace(p.slug, '-', '')) || '-' || (col.ord - 1),
  col.value,
  col.value,
  p.material,
  p.price,
  p.mrp,
  (p.stock / jsonb_array_length(p.colors)),
  (col.ord = 1)
from public.products p
cross join lateral jsonb_array_elements_text(p.colors) with ordinality as col(value, ord)
on conflict (sku) do nothing;

-- ---------------------------------------------------------------------------
-- 7. PRODUCT IMAGES  (first 3 colours become gallery images)
--    Uses deterministic Picsum placeholders — replace with Supabase Storage
--    URLs once you upload real product photos.
-- ---------------------------------------------------------------------------
insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://picsum.photos/seed/' || p.slug || '-' || (col.ord - 1) || '/600/600',
  p.title || ' in ' || col.value,
  (col.ord - 1)
from public.products p
cross join lateral jsonb_array_elements_text(p.colors) with ordinality as col(value, ord)
where col.ord <= 3;

-- ---------------------------------------------------------------------------
-- 8. INVENTORY  (one row per variant)
-- ---------------------------------------------------------------------------
insert into public.inventory (variant_id, quantity, reserved, low_stock_threshold)
select v.id, v.stock, 0, 10
from public.product_variants v
on conflict (variant_id) do nothing;

-- ---------------------------------------------------------------------------
-- 9. PRODUCT COMPATIBILITY  (non-universal accessories -> device models)
--    NOTE: 'spigen-glastr-galaxy-s24' maps to 'galaxy-s20' in the source data,
--    which is not in device_models, so that row resolves to nothing (same
--    behaviour as the app). Change it to 'galaxy-s24' if you want it to match.
-- ---------------------------------------------------------------------------
insert into public.product_compatibility (product_id, device_model_id)
select p.id, dm.id
from (values
  ('spigen-tough-armor-iphone-16-pro','iphone-16-pro'),
  ('credobuy-silicone-case-iphone-16-pro-max','iphone-16-pro-max'),
  ('spigen-rugged-armor-galaxy-s24-ultra','galaxy-s24-ultra'),
  ('credobuy-clear-case-oneplus-12','oneplus-12'),
  ('credobuy-leather-wallet-case-pixel-9-pro','pixel-9-pro'),
  ('credobuy-tempered-glass-iphone-16-pro','iphone-16-pro'),
  ('spigen-glastr-galaxy-s24','galaxy-s20'),
  ('credobuy-privacy-glass-iphone-16-pro-max','iphone-16-pro-max'),
  ('credobuy-matte-guard-oneplus-12r','oneplus-12r'),
  ('credobuy-hydrogel-film-realme-gt-6','realme-gt-6')
) as m(product_slug, model_slug)
join public.products p on p.slug = m.product_slug
join public.device_models dm on dm.slug = m.model_slug
on conflict (product_id, device_model_id) do nothing;

-- ---------------------------------------------------------------------------
-- 10. COUPONS  (marketing.ts)
-- ---------------------------------------------------------------------------
insert into public.coupons (code, description, type, value, min_order, max_discount, active) values
  ('CREDO10','10% off on your first order','percent',10,499,300,true),
  ('FLAT150','Flat ₹150 off on orders above ₹999','flat',150,999,null,true),
  ('TN20','Tamil Nadu special — 20% off up to ₹500','percent',20,1499,500,true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 11. DISTRIBUTORS  (marketing.ts)
-- ---------------------------------------------------------------------------
insert into public.distributors (name, contact_person, phone, email, city, state) values
  ('Chennai Mobile Accessories Pvt Ltd','Suresh Babu','9840012345','sales@chennaimobacc.in','Chennai','Tamil Nadu'),
  ('Coimbatore Gadget Hub','Lakshmi Narayanan','9842198765','orders@cbegadgethub.in','Coimbatore','Tamil Nadu'),
  ('Madurai TechTrade','Vignesh R','9843321100','contact@maduraitechtrade.in','Madurai','Tamil Nadu'),
  ('Bengaluru Distribution Co','Anil Gupta','9845567890','hello@blrdistro.in','Bengaluru','Karnataka')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 12. REVIEWS  (marketing.ts reviewsForProduct — 4 per product)
--    rating = clamp(round(product.rating) + adj, 1..5); user_id left null.
-- ---------------------------------------------------------------------------
delete from public.reviews where user_id is null;  -- keep re-runs idempotent
insert into public.reviews (product_id, user_name, rating, title, body, verified, created_at)
select
  p.id,
  r.user_name,
  greatest(1, least(5, round(p.rating)::int + r.radj)),
  r.title,
  r.body,
  r.verified,
  r.created_at::timestamptz
from public.products p
cross join (values
  (0,  'Arun Kumar',    'Excellent quality',    'Perfect fit and premium feel. Delivery to Coimbatore was quick.', true,  '2026-06-20T10:00:00Z'),
  (-1, 'Priya S',       'Good value for money', 'Works as described. Packaging could be better.',                  true,  '2026-06-18T10:00:00Z'),
  (0,  'Mohammed Rafi', 'Highly recommend',     'Charges super fast, no heating issues at all.',                   false, '2026-06-15T10:00:00Z'),
  (-1, 'Deepa R',       'Nice product',         'Looks premium and feels durable. Happy with the purchase.',       true,  '2026-06-10T10:00:00Z')
) as r(radj, user_name, title, body, verified, created_at);

-- ============================================================================
-- OPTIONAL — data that has no table in schema.sql.
-- These are UI/front-end config (banners, verticals, pincodes) and demo
-- analytics (admin.ts). The tables are created here so the data has a home in
-- Supabase. Skip this whole block if you don't need it.
-- ============================================================================

-- 13a. HERO BANNERS  (marketing.ts)
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  bg text,
  sort_order int not null default 0,
  is_active boolean not null default true
);
truncate public.banners;
insert into public.banners (title, subtitle, cta_label, cta_href, bg, sort_order) values
  ('Gear up your iPhone 16 Pro','Cases, MagSafe chargers & tempered glass — up to 50% off.','Shop iPhone 16 Pro','/device/apple/iphone-16-pro','from-primary to-rose-600',1),
  ('Fast charging, faster life','GaN chargers, 100W braided cables & 20000mAh power banks.','Shop Charging','/category/chargers','from-rose-600 to-orange-500',2),
  ('Sound that moves you','TWS earbuds & neckbands from top brands, starting ₹349.','Shop Audio','/category/earphones-and-earbuds','from-secondary to-primary',3);

-- 13b. SHOPPING VERTICALS  (navigation.ts)
create table if not exists public.verticals (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  icon text,
  soon boolean not null default false,
  sort_order int not null default 0
);
truncate public.verticals;
insert into public.verticals (label, href, icon, soon, sort_order) values
  ('Accessories','/shop','Headphones',false,1),
  ('Mobiles','/shop','Smartphone',true,2),
  ('Laptops','/shop','Laptop',true,3),
  ('Smart TVs','/shop','Tv',true,4),
  ('Smart Watches','/shop','Watch',true,5),
  ('Car Electronics','/shop','Car',true,6),
  ('Smart Devices','/shop','House',true,7);

-- 13c. FAST-DELIVERY PIN CODES  (marketing.ts)
create table if not exists public.fast_delivery_pincodes (
  pincode text primary key
);
insert into public.fast_delivery_pincodes (pincode) values
  ('600001'),('600028'),('641001'),('641012'),('625001'),('620001'),('636001'),('627001')
on conflict (pincode) do nothing;

-- 13d. DEMO CUSTOMERS  (admin.ts adminCustomers)
create table if not exists public.demo_customers (
  id text primary key,
  name text,
  email text,
  phone text,
  city text,
  orders int,
  total_spent numeric(10,2),
  joined date
);
truncate public.demo_customers;
insert into public.demo_customers (id, name, email, phone, city, orders, total_spent, joined) values
  ('c1','Arun Kumar','arun.k@example.com','9840011223','Chennai',12,28450,'2025-11-02'),
  ('c2','Priya S','priya.s@example.com','9842233445','Coimbatore',8,15230,'2026-01-15'),
  ('c3','Mohammed Rafi','rafi.m@example.com','9843344556','Madurai',5,9870,'2026-02-20'),
  ('c4','Deepa R','deepa.r@example.com','9844455667','Trichy',15,41200,'2025-09-10'),
  ('c5','Karthik V','karthik.v@example.com','9845566778','Salem',3,4560,'2026-04-05'),
  ('c6','Sneha M','sneha.m@example.com','9846677889','Chennai',7,13400,'2026-03-12');

-- 13e. DEMO ORDERS  (admin.ts adminOrders)
create table if not exists public.demo_orders (
  order_number text primary key,
  customer text,
  city text,
  items int,
  total numeric(10,2),
  status order_status,
  payment_method payment_method,
  placed_at date
);
truncate public.demo_orders;
insert into public.demo_orders (order_number, customer, city, items, total, status, payment_method, placed_at) values
  ('CB2026100241','Arun Kumar','Chennai',3,3597,'delivered','mock','2026-07-08'),
  ('CB2026100242','Priya S','Coimbatore',1,1499,'out_for_delivery','cod','2026-07-12'),
  ('CB2026100243','Mohammed Rafi','Madurai',2,2198,'shipped','mock','2026-07-13'),
  ('CB2026100244','Deepa R','Trichy',4,4296,'packed','mock','2026-07-14'),
  ('CB2026100245','Karthik V','Salem',1,999,'confirmed','cod','2026-07-15'),
  ('CB2026100246','Sneha M','Chennai',2,1848,'confirmed','mock','2026-07-15'),
  ('CB2026100247','Vikram P','Tirunelveli',1,2499,'cancelled','mock','2026-07-11');

-- 13f. ANALYTICS SERIES  (admin.ts monthlyRevenue & categorySales)
create table if not exists public.monthly_revenue (label text primary key, value numeric(12,2));
truncate public.monthly_revenue;
insert into public.monthly_revenue (label, value) values
  ('Feb',182000),('Mar',214000),('Apr',268000),('May',245000),('Jun',312000),('Jul',358000);

create table if not exists public.category_sales (label text primary key, value int);
truncate public.category_sales;
insert into public.category_sales (label, value) values
  ('Cases',420),('Chargers',380),('Audio',510),('Cables',340),('Power',290),('Screen',260);

-- ============================================================================
-- Done. Quick sanity checks:
--   select count(*) from public.products;              -- 40
--   select count(*) from public.product_variants;      -- 63
--   select count(*) from public.product_images;        -- 63
--   select count(*) from public.product_compatibility; -- 9 (galaxy-s20 skipped)
--   select count(*) from public.reviews;               -- 160
-- ============================================================================
