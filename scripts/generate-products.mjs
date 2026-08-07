/**
 * Generates src/data/products.ts from the sourced taxonomy catalogue.
 * Run: node scripts/generate-products.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** TSV rows: Department Category SubCategory Series ProductCategory ProductType Variant CompatibleDevice Brand */
const TSV = `
Electronics	Mobile	Cases & Covers	Limitless	Phone Cases	Phone Case	-	All iPhone Models	Mous
Electronics	Mobile	Cases & Covers	Limitless	Phone Cases	Phone Case	-	All Samsung Galaxy Models	Mous
Electronics	Mobile	Cases & Covers	Limitless	Phone Cases	Phone Case	-	All Google Pixel Models	Mous
Electronics	Mobile	Cases & Covers	Ultra Protective	Phone Cases	Protective Phone Case	-	All Supported Devices	Mous
Electronics	Mobile	Cases & Covers	Crystal Clear	Phone Cases	Clear Phone Case	Transparent	All Supported Devices	Mous
Electronics	Mobile	Cases & Covers	IntraLock	Phone Cases	Motorcycle Phone Case	Magnetic Lock	All Supported Devices	Mous
Electronics	Mobile	Cases & Covers	Mount Ready	Phone Cases	Mount Compatible Phone Case	Mount Ready	All Supported Devices	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Wireless Charger	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Car Charger	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Portable Charger	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Desk Charger	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Charging Stand	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Watch Charger	-	Apple Watch / Pixel Watch	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Charging Mount	-	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Cable	USB-C / Lightning	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Adapter	USB-C	Universal	Mous
Electronics	Mobile	Accessories	Charging	Wireless Charging	Power Bank	-	Universal	Mous
Electronics	Mobile	Accessories	Device Accessories	Protection	Screen Protector	-	All Supported Devices	Mous
Electronics	Mobile	Accessories	Device Accessories	Phone Accessories	Case Strap	-	All Phone Cases	Mous
Electronics	Mobile	Accessories	Device Accessories	Phone Accessories	Phone Ring	-	All Phone Cases	Mous
Electronics	Mobile	Accessories	Device Accessories	Wallet	Magnetic Wallet	MagSafe	Supported Devices	Mous
Electronics	Mobile	Accessories	Device Accessories	Watch Accessories	Watch Strap	-	Apple / Pixel / Samsung Watch	Mous
Electronics	Mobile	Accessories	Device Accessories	Audio Accessories	AirPods Case	-	AirPods	Mous
Electronics	Mobile	Accessories	Device Accessories	Charging Accessories	Cable	-	Universal	Mous
Electronics	Mobile	Accessories	Device Accessories	Charging Accessories	Adapter	-	Universal	Mous
Electronics	Mobile	Accessories	Device Accessories	Bike Accessories	Cycling Mount	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Bags	Laptop Sleeve	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Bags	Pouch	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Bags	Tech Pouch	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Bags	Toiletry Pouch	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Organization	Compression Wardrobe	-	Universal	Mous
Electronics	Lifestyle	Travel Accessories	Travel	Organization	Document Pouch	-	Universal	Mous
Electronics	Mobile	Cases & Covers	Tank	Rugged Cases	Rugged Phone Case	Standard	All Supported Phone Devices	dbrand
Electronics	Mobile	Cases & Covers	Ghost	Clear Cases	Clear Phone Case	Transparent	All Supported Phone Devices	dbrand
Electronics	Mobile	Cases & Covers	Grip	Custom Cases	Grip Phone Case	Standard	All Supported Phone Devices	dbrand
Electronics	Mobile	Screen Protection	Prism	Screen Protectors	Tempered Glass	Clear	All Supported Phone Devices	dbrand
Electronics	Mobile	Skins	Signature	Phone Skins	Device Skin	Carbon Fiber / Leather / Matte / Gloss	All Supported Phone Devices	dbrand
Electronics	Lifestyle	Stickers	Signature	Stickers	Vinyl Sticker	Assorted Designs	Universal	dbrand
Electronics	Mobile	Cases & Covers	Standard	Phone Cases	Phone Case	-	All Supported Phones	Nomad
Electronics	Tablet	Cases & Covers	Standard	iPad Cases	iPad Case	-	All Supported iPads	Nomad
Electronics	Audio	Cases & Covers	Standard	Headphone Cases	Headphone Case	-	AirPods / Headphones	Nomad
Electronics	Wearables	Watch Bands	Leather	Leather Bands	Modern Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Leather	Leather Bands	Traditional Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Leather	Leather Bands	Active Band Pro	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Leather	Leather Bands	Garmin Band	-	Garmin Watch	Nomad
Electronics	Wearables	Watch Bands	Metal	Metal Bands	Stratos Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Metal	Metal Bands	Titanium Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Metal	Metal Bands	Steel Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Sport	Sport Bands	Sport Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Rugged	Rugged Bands	Rocky Point Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Rugged	Rugged Bands	Rugged Band	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Sport	Sport Bands	Active Band Pro	-	Apple Watch	Nomad
Electronics	Wearables	Watch Bands	Sport	Sport Bands	Tempo Band	-	Apple Watch	Nomad
Electronics	Wearables	Charging	Standard	Watch Charging	Apple Watch Charger	-	Apple Watch	Nomad
Electronics	Mobile	Charging	Standard	Charging Accessories	Universal Cable	-	Universal	Nomad
Electronics	Wearables	Accessories	Standard	Smartwatch Accessories	Pixel Watch Accessories	-	Pixel Watch	Nomad
Electronics	Wearables	Accessories	Standard	Smartwatch Accessories	Garmin Watch Accessories	-	Garmin Watch	Nomad
Electronics	Lifestyle	Design Lab	Standard	Customization	Design Lab	-	Universal	Nomad
Electronics	Mobile	Charging	Cables	Data Cables	USB Cable	-	Universal	Nomad
Electronics	Mobile	Charging	Cables	USB-C	USB-C Cable	-	Universal	Nomad
Electronics	Mobile	Charging	Cables	ChargeKey	ChargeKey Cable	-	Universal	Nomad
Electronics	Wearables	Charging	Cables	Apple Watch Cable	Charging Cable	-	Apple Watch	Nomad
Electronics	Mobile	Charging	Cables	Cable Adapters	Adapter	-	Universal	Nomad
Electronics	Mobile	Charging	AC Adapter	USB-C Adapter	Wall Charger	-	Universal	Nomad
Electronics	Mobile	Charging	AC Adapter	USB-C + Apple Watch	Multi Charger	-	Universal	Nomad
Electronics	Car	Charging	Car Charging	USB-C Car Adapter	Car Charger	-	Universal	Nomad
Electronics	Mobile	Charging	Stand One	Wireless Chargers	Charging Stand	-	MagSafe Devices	Nomad
Electronics	Mobile	Charging	Base One Max	Wireless Chargers	Charging Base	-	MagSafe Devices	Nomad
Electronics	Mobile	Charging	Stand One Max	Wireless Chargers	Charging Stand	-	MagSafe Devices	Nomad
Electronics	Car	Charging	Vehicle Charging	Vehicle Accessories	Starlink Cable	-	Starlink	Nomad
Electronics	Car	Charging	Vehicle Charging	Vehicle Accessories	12V Car Adapter	-	Universal	Nomad
Electronics	Car	Charging	Vehicle Charging	Vehicle Accessories	Charge Mount	-	Universal	Nomad
Electronics	Smart Tracking	Find My	Standard	Tracking Devices	Tracking Card	-	Apple Find My	Nomad
Electronics	Smart Tracking	Find My	Leather Mag	Wallet Accessories	Leather Mag Wallet	-	MagSafe Devices	Nomad
Electronics	Smart Tracking	Find My	AirTag	AirTag Accessories	AirTag Holder	-	Apple AirTag	Nomad
Lifestyle	Wallets	Traditional	Standard	Wallet	Bifold Wallet	-	Universal	Nomad
Lifestyle	Wallets	Minimalist	Standard	Wallet	Card Wallet Plus	-	Universal	Nomad
Lifestyle	Wallets	Travel	Standard	Wallet	Passport Wallet	-	Universal	Nomad
Lifestyle	Wallets	Minimalist	Leather Mag	Wallet	Leather Mag Wallet	-	Universal	Nomad
Lifestyle	Wallets	Minimalist	Standard	Wallet	Card Wallet	-	Universal	Nomad
Lifestyle	Wallets	Traditional	Standard	Wallet	Traditional Wallet	-	Universal	Nomad
Lifestyle	Wallets	Premium	Shell Cordovan	Wallet	Shell Cordovan Wallet	-	Universal	Nomad
Lifestyle	Accessories	Lifestyle Gear	Standard	Everyday Carry	Rugged Chain	-	Universal	Nomad
Lifestyle	Accessories	Lifestyle Gear	Standard	Stationery	Pen	-	Universal	Nomad
Lifestyle	Accessories	Lifestyle Gear	Standard	Stationery	Pen Refill	-	Universal	Nomad
Lifestyle	Accessories	Lifestyle Gear	Standard	Carry Accessories	Wrist Strap	-	Universal	Nomad
Electronics	Wearables	Google Pixel	Standard	Smartwatch Accessories	Pixel Watch	-	Pixel Watch	Nomad
Electronics	Audio	Earbuds	Pixel	Earbuds Accessories	Pixel Buds Pro	-	Pixel Buds Pro	Nomad
Electronics	Audio	Earbuds	Pixel	Earbuds Accessories	Pixel Buds	-	Pixel Buds	Nomad
Electronics	Audio	Earbuds	Pixel	Earbuds Accessories	Pixel Buds A Series	-	Pixel Buds A Series	Nomad
Electronics	Mobile	Charging	HaloLock	Wireless Chargers	Apple Watch Portable Charger	Black	Apple Watch	ESR
Electronics	Mobile	Charging	HaloLock	Charging Stations	3-in-1 Wireless Charging Set	Black	Apple Ecosystem	ESR
Electronics	Car	Charging	HaloLock	Car Chargers	Magnetic Wireless Car Charger	Black	MagSafe Devices	ESR
Electronics	Mobile	Accessories	HaloLock	Magnetic Accessories	Universal Ring 360	Standard	Universal	ESR
Electronics	Mobile	Charging	HaloLock	Wireless Chargers	Kickstand MagSafe Charger	Standard	MagSafe Devices	ESR
Electronics	Mobile	Charging	HaloLock	Travel Chargers	3-in-1 Travel Charging Set	Black	Apple Ecosystem	ESR
Electronics	Mobile	Charging	HaloLock	Wireless Chargers	Mini Wireless Charger	Black	MagSafe Devices	ESR
Electronics	Mobile	Charging	MagSlim	Power Banks	MagSlim Power Bank	Black	MagSafe Devices	ESR
Electronics	Car	Charging	HaloLock	Dashboard Chargers	Dashboard Wireless Charger	Black	MagSafe Devices	ESR
Electronics	Mobile	Charging	HaloLock	Charging Stations	5-in-1 Charging Station	Standard	Apple Ecosystem	ESR
Electronics	Mobile	Charging	HaloLock	Charging Stations	2-in-1 Watch Charging Set	White	Apple Watch	ESR
Electronics	Mobile	Charging	MagSlim	Power Banks	5000mAh Kickstand Power Bank	Black	MagSafe Devices	ESR
Electronics	Mobile	Charging	CryoBoost	Charging Stations	3-in-1 Wireless Charging Station	Black	Apple Ecosystem	ESR
Electronics	Mobile	Charging	MagSlim	Power Banks	10000mAh Power Bank	Black	MagSafe Devices	ESR
Electronics	Car	Charging	CryoBoost	Car Chargers	Wireless Car Charger	Standard	MagSafe Devices	ESR
Electronics	Car	Charging	HaloLock	Car Chargers	Touchscreen Wireless Car Charger	Black	Universal	ESR
Electronics	Mobile	Charging	HaloLock	Wireless Chargers	Mini Kickstand Charger	Black	MagSafe Devices	ESR
Electronics	Mobile	Charging	HaloLock	Charging Stations	3-in-1 Charging Stand	Black	Apple Ecosystem	ESR
Electronics	Mobile	Charging	CryoBoost	Bundles	CryoBoost Pro Bundle	Standard	Apple Ecosystem	ESR
Electronics	Mobile	Charging	CryoBoost	Bundles	MagSafe Everyday Bundle	Standard	MagSafe Devices	ESR
Electronics	Mobile	Charging	HaloLock	Bundles	One-Stop Bundle	Black/White	Apple Ecosystem	ESR
Electronics	Mobile	Charging	HaloLock	Travel Chargers	Travel Charging Set	Black	Apple Ecosystem	ESR
Electronics	Mobile	Charging	HaloLock	Charging Stations	65W 5-in-1 Charging Station	Standard	Universal	ESR
Electronics	Mobile	Charging	CryoBoost	Charging Stations	3-in-1 Wireless Charger	Black	Apple Ecosystem	ESR
Electronics	Mobile	Charging	HaloLock	Wireless Chargers	Kickstand Wireless Charger	Sierra Blue	MagSafe Devices	ESR
Electronics	Mobile	Charging	CryoBoost	Charging Stations	100W 6-in-1 Charging Station	Standard	Apple Ecosystem	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Hybrid Cases	Classic Hybrid Case	Clear	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Hybrid Cases	Classic Hybrid Stash Stand Case	Clear	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Clear Cases	Zero Clear Case	Clear	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Silicone Cases	Cloud Soft Case	Pink	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Premium Cases	Classic Pro Case	Frosted Dark Green	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Silicone Cases	Cloud Soft Stash Stand	Black	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Rugged Cases	Cyber Tough Case	Black	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Kickstand Cases	Boost Flickstand Case	Clear	iPhone 16 Pro Max	ESR
Electronics	Mobile	Cases & Covers	HaloLock	Rugged Cases	Armor Tough Case	Clear Black	iPhone 16 Pro Max	ESR
Electronics	Mobile	Wallets	HaloLock	Smart Wallets	Geo Wallet Stand	Midnight Black	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Smart Wallets	Geo Wallet Boost	Grey	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Magnetic Wallets	Magnetic Wallet Boost	Black	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Wallet Stands	Grip Wallet Stand	Carbon Fiber	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Magnetic Wallets	Magnetic Wallet	Midnight Black	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Wallet Stands	Aura Wallet Stand	Pink	MagSafe Devices	ESR
Electronics	Mobile	Wallets	HaloLock	Leather Wallets	Vegan Leather Wallet Stand	Black Sheepskin	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	MagSlim	Magnetic Power Banks	Kickstand Power Bank	10000mAh Black	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	MagSlim	Magnetic Power Banks	Power Bank	5000mAh Black	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	MagSlim	Magnetic Power Banks	Power Bank	10000mAh Blue	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	MagSlim	Magnetic Power Banks	Kickstand Power Bank	5000mAh White	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	HaloLock	Wallet Power Banks	Power Bank Wallet	5000mAh Midnight Black	MagSafe Devices	ESR
Electronics	Mobile	Power Banks	MagSlim	Magnetic Power Banks	Kickstand Power Bank	10000mAh Titanium	MagSafe Devices	ESR
Electronics	Mobile	Accessories	HaloLock	Phone Mounts	Airplane Phone Holder	Black	Universal	ESR
Electronics	Mobile	Accessories	HaloLock	Ring Holders	Ring Stand	Sierra Blue	Universal	ESR
Electronics	Mobile	Accessories	HaloLock	Magnetic Rings	Universal Ring	Black/Silver	Universal	ESR
Electronics	Mobile	Accessories	HaloLock	Magnetic Rings	Universal Ring 360	White	Universal	ESR
Electronics	Smart Tracking	Find My	HaloLock	Smart Wallets	Geo Wallet Stand	Midnight Black	Apple Find My	ESR
Electronics	Smart Tracking	Find My	HaloLock	Smart Wallets	Geo Wallet Boost	Grey	Apple Find My	ESR
Electronics	Smart Tracking	Find My	Geo	Smart Stylus	Geo Digital Pencil	White	iPad	ESR
Electronics	Mobile	Cases & Covers	Standard	Phone Cases	Phone Case	Various Designs	All Supported Phone Devices	CASETiFY
Electronics	Mobile	Accessories	Standard	Phone Accessories	Phone Strap	Various Designs	All Supported Phones	CASETiFY
Electronics	Wearables	Accessories	Standard	Watch Accessories	Watch Strap Accessory	Various Designs	All Watches	CASETiFY
Electronics	Audio	Accessories	Standard	Earbud Accessories	Earbud Strap	Various Designs	All Earbuds	CASETiFY
Electronics	Laptop	Accessories	Standard	Laptop Accessories	Laptop Strap	Various Designs	MacBook	CASETiFY
Electronics	Tablet	Accessories	Standard	Tablet Accessories	Tablet Strap	Various Designs	iPad	CASETiFY
Electronics	Smart Tracking	Accessories	Standard	AirTag Accessories	AirTag Strap	Various Designs	AirTag	CASETiFY
Electronics	Mobile	Accessories	MagSafe	MagSafe Accessories	Various MagSafe Products	Various	MagSafe Compatible Devices	CASETiFY
Electronics	Wearables	Watch Bands	Standard	Watch Bands	Apple Watch Band	Various Materials	Apple Watch	CASETiFY
Electronics	Audio	Cases & Covers	Standard	Earbud Cases	AirPods Case	Various Designs	AirPods	CASETiFY
Electronics	Audio	Cases & Covers	Standard	Earbud Cases	Galaxy Buds Case	Various Designs	Galaxy Buds	CASETiFY
Electronics	Mobile	Accessories	Standard	Charms	Phone Charm	Various	Phones	CASETiFY
Electronics	Wearables	Accessories	Standard	Charms	Watch Charm	Various	Watches	CASETiFY
Electronics	Audio	Accessories	Standard	Charms	Earbud Charm	Various	Earbuds	CASETiFY
Electronics	Laptop	Accessories	Standard	Charms	Laptop Charm	Various	MacBook	CASETiFY
Electronics	Tablet	Accessories	Standard	Charms	Tablet Charm	Various	iPad	CASETiFY
Electronics	Smart Tracking	Accessories	Standard	Charms	AirTag Charm	Various	AirTag	CASETiFY
Electronics	Tablet	Cases & Covers	Standard	Tablet Cases	iPad Case	Various	iPad	CASETiFY
Electronics	Laptop	Cases & Covers	Standard	Laptop Cases	MacBook Case	Various	MacBook	CASETiFY
Electronics	Laptop	Cases & Covers	Standard	Laptop Cases	Gaming Laptop Case	Various	Gaming Laptops	CASETiFY
Electronics	Mobile	Screen Protection	Standard	Screen Protectors	Screen Protector	Standard	Phones	CASETiFY
Electronics	Mobile	Screen Protection	Standard	Screen Protectors	Privacy Screen Protector	Privacy	Phones	CASETiFY
Electronics	Mobile	Screen Protection	Standard	Camera Protection	Lens Protector	Standard	Phones	CASETiFY
Electronics	Laptop	Screen Protection	Standard	Screen Protectors	MacBook Screen Protector	Standard	MacBook	CASETiFY
Electronics	Mobile	Cases & Covers	Ripple	Ripple Cases	Phone Case	Ripple Design	Phones	CASETiFY
Electronics	Wearables	Cases & Covers	Ripple	Ripple Cases	Watch Case	Ripple Design	Watches	CASETiFY
Electronics	Audio	Cases & Covers	Ripple	Ripple Cases	Earbud Case	Ripple Design	Earbuds	CASETiFY
Electronics	Audio	Cases & Covers	Ripple	Ripple Cases	Headphone Case	Ripple Design	Headphones	CASETiFY
`.trim();

const rows = TSV.split("\n").map((line) => {
  const [
    department,
    taxonomyCategory,
    subCategory,
    series,
    productCategory,
    productType,
    variant,
    compatibleDevice,
    brand,
  ] = line.split("\t").map((s) => s.trim());
  return {
    department,
    taxonomyCategory,
    subCategory,
    series,
    productCategory,
    productType,
    variant: variant === "-" ? "" : variant,
    compatibleDevice,
    brand,
  };
});

const out = `import type { Product, ProductSpec, StockStatus } from "@/types";
import { productPlaceholder } from "@/lib/placeholder";
import { slugify } from "@/lib/utils";

/**
 * Product catalogue built from sourced brand taxonomies
 * (Mous, dbrand, Nomad, ESR, CASETiFY).
 *
 * Taxonomy columns:
 * Department · Category · Sub Category · Series · Product Category ·
 * Product Type · Variant · Compatible Device · Brand
 */

interface Seed {
  department: string;
  taxonomyCategory: string;
  subCategory: string;
  series: string;
  productCategory: string;
  productType: string;
  variant: string;
  compatibleDevice: string;
  brand: string;
}

const seeds: Seed[] = ${JSON.stringify(rows, null, 2)};

function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock < 10) return "low_stock";
  return "in_stock";
}

function brandId(name: string): string {
  return \`brand-\${name.toLowerCase().replace(/\\s+/g, "-")}\`;
}

/** Map taxonomy into the shop category rail. */
function mapCategoryId(seed: Seed): string {
  const s = \`\${seed.subCategory} \${seed.productCategory} \${seed.productType}\`.toLowerCase();
  if (s.includes("screen protector") || s.includes("lens protector") || s.includes("camera protection") || s.includes("tempered glass") || seed.subCategory === "Screen Protection")
    return "cat-screen";
  if (s.includes("power bank") || seed.subCategory === "Power Banks" || seed.productCategory.includes("Power Bank"))
    return "cat-powerbanks";
  if (s.includes("cable") || s.includes("adapter") && !s.includes("car"))
    return "cat-cables";
  if (
    s.includes("charg") ||
    s.includes("wireless") ||
    seed.subCategory === "Charging" ||
    seed.productCategory.includes("Charging")
  )
    return "cat-chargers";
  if (s.includes("watch band") || s.includes("leather band") || s.includes("metal band") || s.includes("sport band") || s.includes("rugged band") || seed.subCategory === "Watch Bands")
    return "cat-watch";
  if (s.includes("airpods case") || s.includes("earbud case") || s.includes("galaxy buds") || s.includes("headphone case") || seed.productCategory.includes("Earbud"))
    return "cat-earbuds-cases";
  if (s.includes("ipad") || s.includes("tablet") || seed.taxonomyCategory === "Tablet")
    return "cat-tablet";
  if (s.includes("wallet") || s.includes("magsafe") || s.includes("airtag") || s.includes("tracking") || s.includes("find my") || seed.subCategory === "Wallets" || seed.subCategory === "Find My")
    return "cat-magsafe";
  if (s.includes("strap") || s.includes("charm") || s.includes("skin") || s.includes("sticker") || s.includes("ring") || seed.subCategory === "Skins" || seed.subCategory === "Stickers")
    return "cat-straps";
  if (s.includes("mount") || s.includes("holder") || s.includes("stand") && !s.includes("case") || s.includes("pouch") || s.includes("sleeve") || s.includes("travel") || seed.subCategory === "Travel Accessories")
    return "cat-holders";
  if (s.includes("earbud") || s.includes("audio") || seed.taxonomyCategory === "Audio")
    return "cat-audio";
  if (s.includes("case") || seed.subCategory === "Cases & Covers")
    return "cat-cases";
  return "cat-cases";
}

function isUniversal(compatibleDevice: string): boolean {
  const d = compatibleDevice.toLowerCase();
  return (
    d.includes("universal") ||
    d.includes("all supported") ||
    d.includes("all phone") ||
    d.includes("all iphone") ||
    d.includes("all samsung") ||
    d.includes("all google") ||
    d.includes("all watch") ||
    d.includes("phones") ||
    d.includes("watches") ||
    d.includes("earbuds")
  );
}

function basePrice(seed: Seed): { price: number; mrp: number } {
  const brandPremium: Record<string, number> = {
    Mous: 1.15,
    dbrand: 1.1,
    Nomad: 1.25,
    ESR: 0.95,
    CASETiFY: 1.2,
  };
  const type = seed.productType.toLowerCase();
  let base = 999;
  if (type.includes("power bank")) base = 2499;
  else if (type.includes("charging station") || type.includes("5-in-1") || type.includes("6-in-1") || type.includes("3-in-1") || type.includes("bundle")) base = 4999;
  else if (type.includes("keyboard")) base = 6999;
  else if (type.includes("charger") || type.includes("wireless") || type.includes("charging stand") || type.includes("charging base")) base = 1999;
  else if (type.includes("car charger") || type.includes("dashboard")) base = 1799;
  else if (type.includes("cable") || type.includes("adapter") || type.includes("chargekey")) base = 799;
  else if (type.includes("wallet")) base = 2499;
  else if (type.includes("band") || type.includes("watch")) base = 1899;
  else if (type.includes("screen") || type.includes("tempered") || type.includes("lens")) base = 699;
  else if (type.includes("skin") || type.includes("sticker") || type.includes("charm") || type.includes("strap") || type.includes("ring")) base = 599;
  else if (type.includes("case") || type.includes("cover")) base = 1499;
  else if (type.includes("sleeve") || type.includes("pouch") || type.includes("wardrobe")) base = 1299;
  else if (type.includes("pen") || type.includes("pencil")) base = 2199;
  else if (type.includes("tracking")) base = 3499;
  else if (type.includes("mount") || type.includes("holder")) base = 999;

  const mult = brandPremium[seed.brand] ?? 1;
  const price = Math.round((base * mult) / 10) * 10;
  const mrp = Math.round((price * 1.85) / 10) * 10;
  return { price, mrp };
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildTitle(seed: Seed): string {
  const parts = [seed.brand];
  if (seed.series && seed.series !== "Standard") parts.push(seed.series);
  parts.push(seed.productType);
  if (seed.variant) parts.push(\`– \${seed.variant}\`);
  return parts.join(" ");
}

function build(seed: Seed, index: number): Product {
  const title = buildTitle(seed);
  const baseSlug = slugify(
    \`\${seed.brand}-\${seed.series}-\${seed.productType}-\${seed.variant || "default"}-\${seed.compatibleDevice}\`
  );
  const slug = \`\${baseSlug}-\${index + 1}\`;
  const { price, mrp } = basePrice(seed);
  const h = hash(slug);
  const stock = 20 + (h % 180);
  const rating = 3.8 + ((h % 12) / 10);
  const reviewCount = 40 + (h % 2400);
  const colors = seed.variant
    ? seed.variant.split("/").map((c) => c.trim()).filter(Boolean)
    : ["Default"];
  const images = colors.slice(0, 3).map((c, i) => ({
    id: \`\${slug}-img-\${i}\`,
    productId: slug,
    url: productPlaceholder(\`\${title} \${c}\`, \`\${slug}-\${i}\`),
    alt: \`\${title} in \${c}\`,
    sortOrder: i,
  }));
  const variants = colors.map((color, i) => ({
    id: \`\${slug}-var-\${i}\`,
    productId: slug,
    sku: \`\${slug.toUpperCase().replace(/-/g, "").slice(0, 24)}-\${i}\`,
    name: color,
    color,
    price,
    mrp,
    stock: Math.max(1, Math.floor(stock / colors.length)),
    isDefault: i === 0,
  }));

  const specs: ProductSpec[] = [
    { label: "Department", value: seed.department },
    { label: "Category", value: seed.taxonomyCategory },
    { label: "Sub Category", value: seed.subCategory },
    { label: "Series", value: seed.series },
    { label: "Product Category", value: seed.productCategory },
    { label: "Product Type", value: seed.productType },
    { label: "Compatible Device", value: seed.compatibleDevice },
    { label: "Brand", value: seed.brand },
  ];
  if (seed.variant) specs.push({ label: "Variant", value: seed.variant });

  const short = \`\${seed.brand} \${seed.productType} from the \${seed.series} series — for \${seed.compatibleDevice}.\`;
  const flags = {
    trending: h % 5 === 0,
    bestseller: h % 4 === 0,
    new: h % 6 === 0,
  };

  return {
    id: slug,
    slug,
    title,
    brandId: brandId(seed.brand),
    categoryId: mapCategoryId(seed),
    department: seed.department,
    taxonomyCategory: seed.taxonomyCategory,
    subCategory: seed.subCategory,
    series: seed.series,
    productCategory: seed.productCategory,
    productType: seed.productType,
    variantLabel: seed.variant,
    compatibleDevice: seed.compatibleDevice,
    shortDescription: short,
    description: \`\${short} Part of \${seed.productCategory} under \${seed.subCategory}.\`,
    price,
    mrp,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    stockStatus: stockStatus(stock),
    stock,
    images,
    variants,
    features: [
      \`Series: \${seed.series}\`,
      \`Compatible with \${seed.compatibleDevice}\`,
      \`\${seed.productCategory}\`,
      \`Genuine \${seed.brand} product\`,
    ],
    specs,
    compatibleModelIds: [],
    universal: isUniversal(seed.compatibleDevice),
    colors,
    warrantyMonths: seed.brand === "Nomad" || seed.brand === "Mous" ? 24 : 12,
    isTrending: flags.trending,
    isBestSeller: flags.bestseller,
    isNewArrival: flags.new,
    tags: [
      seed.brand.toLowerCase(),
      seed.series.toLowerCase().replace(/\\s+/g, "-"),
      seed.productType.toLowerCase().replace(/\\s+/g, "-"),
    ],
    createdAt: "2026-07-01T00:00:00.000Z",
  };
}

export const products: Product[] = seeds.map(build);
`;

writeFileSync(join(root, "src", "data", "products.ts"), out, "utf8");
console.log(`Wrote ${rows.length} products to src/data/products.ts`);
