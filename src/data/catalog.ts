import type { Brand, Category, DeviceBrand, DeviceModel } from "@/types";
import { logoPlaceholder, productPlaceholder } from "@/lib/placeholder";

/* ------------------------------------------------------------------ */
/* Categories (8)                                                      */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    id: "cat-cases",
    slug: "cases-and-covers",
    name: "Cases & Covers",
    description: "Slim, rugged and designer back covers for every phone.",
    icon: "Smartphone",
    imageUrl: productPlaceholder("Cases & Covers", "cat-cases"),
    productCount: 0,
    sortOrder: 1,
  },
  {
    id: "cat-screen",
    slug: "screen-protectors",
    name: "Screen Protectors",
    description: "Tempered glass and privacy guards with edge-to-edge fit.",
    icon: "ShieldCheck",
    imageUrl: productPlaceholder("Screen Protectors", "cat-screen"),
    productCount: 0,
    sortOrder: 2,
  },
  {
    id: "cat-chargers",
    slug: "chargers",
    name: "Chargers",
    description: "Fast wall and wireless chargers from 20W to 120W.",
    icon: "Zap",
    imageUrl: productPlaceholder("Chargers", "cat-chargers"),
    productCount: 0,
    sortOrder: 3,
  },
  {
    id: "cat-cables",
    slug: "charging-cables",
    name: "Charging Cables",
    description: "Durable braided USB-C, Lightning and Micro-USB cables.",
    icon: "Cable",
    imageUrl: productPlaceholder("Charging Cables", "cat-cables"),
    productCount: 0,
    sortOrder: 4,
  },
  {
    id: "cat-powerbanks",
    slug: "power-banks",
    name: "Power Banks",
    description: "Pocket to high-capacity power banks with fast charging.",
    icon: "BatteryCharging",
    imageUrl: productPlaceholder("Power Banks", "cat-powerbanks"),
    productCount: 0,
    sortOrder: 5,
  },
  {
    id: "cat-audio",
    slug: "earphones-and-earbuds",
    name: "Earphones & Earbuds",
    description: "Wired earphones, TWS earbuds and neckbands.",
    icon: "Headphones",
    imageUrl: productPlaceholder("Earphones & Earbuds", "cat-audio"),
    productCount: 0,
    sortOrder: 6,
  },
  {
    id: "cat-holders",
    slug: "mobile-holders-and-stands",
    name: "Holders & Stands",
    description: "Car mounts, desk stands and adjustable holders.",
    icon: "TabletSmartphone",
    imageUrl: productPlaceholder("Holders & Stands", "cat-holders"),
    productCount: 0,
    sortOrder: 7,
  },
  {
    id: "cat-photography",
    slug: "mobile-photography-accessories",
    name: "Photography Accessories",
    description: "Gimbals, tripods, lenses and ring lights for creators.",
    icon: "Camera",
    imageUrl: productPlaceholder("Photography Accessories", "cat-photography"),
    productCount: 0,
    sortOrder: 8,
  },
  {
    id: "cat-magsafe",
    slug: "magsafe-and-wallets",
    name: "MagSafe & Wallets",
    description: "Magnetic wallets, rings and mounts for a snap-on lifestyle.",
    icon: "Wallet",
    imageUrl: productPlaceholder("MagSafe & Wallets", "cat-magsafe"),
    productCount: 0,
    sortOrder: 9,
  },
  {
    id: "cat-earbuds-cases",
    slug: "earbuds-cases",
    name: "Earbuds Cases",
    description: "Protective, expressive cases for AirPods and earbuds.",
    icon: "Package",
    imageUrl: productPlaceholder("Earbuds Cases", "cat-earbuds-cases"),
    productCount: 0,
    sortOrder: 10,
  },
  {
    id: "cat-watch",
    slug: "watch-bands",
    name: "Watch Bands",
    description: "Sport, leather and metal bands for smartwatches.",
    icon: "Watch",
    imageUrl: productPlaceholder("Watch Bands", "cat-watch"),
    productCount: 0,
    sortOrder: 11,
  },
  {
    id: "cat-tablet",
    slug: "tablet-cases",
    name: "Tablet & iPad Cases",
    description: "Folios, keyboard cases and rugged covers for tablets.",
    icon: "Tablet",
    imageUrl: productPlaceholder("Tablet & iPad Cases", "cat-tablet"),
    productCount: 0,
    sortOrder: 12,
  },
  {
    id: "cat-straps",
    slug: "straps-and-charms",
    name: "Straps & Charms",
    description: "Crossbody straps, wrist straps and phone charms.",
    icon: "Sparkles",
    imageUrl: productPlaceholder("Straps & Charms", "cat-straps"),
    productCount: 0,
    sortOrder: 13,
  },
];

/* ------------------------------------------------------------------ */
/* Accessory brands                                                    */
/* ------------------------------------------------------------------ */

const brandNames = [
  "Mous",
  "dbrand",
  "Nomad",
  "ESR",
  "CASETiFY",
  "CredoBuy",
];

export const brands: Brand[] = brandNames.map((name) => ({
  id: `brand-${name.toLowerCase().replace(/\s+/g, "-")}`,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  logoUrl: logoPlaceholder(name),
}));

/* ------------------------------------------------------------------ */
/* Device brands (10) and device models (30+)                          */
/* ------------------------------------------------------------------ */

export const deviceBrands: DeviceBrand[] = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Google",
  "Motorola",
  "Nothing",
].map((name) => ({
  id: `dbrand-${name.toLowerCase()}`,
  slug: name.toLowerCase(),
  name,
  logoUrl: logoPlaceholder(name),
}));

type ModelSeed = [brandSlug: string, name: string, year: number];

const modelSeeds: ModelSeed[] = [
  // Apple
  ["apple", "iPhone 16 Pro Max", 2024],
  ["apple", "iPhone 16 Pro", 2024],
  ["apple", "iPhone 16", 2024],
  ["apple", "iPhone 15", 2023],
  // Samsung
  ["samsung", "Galaxy S24 Ultra", 2024],
  ["samsung", "Galaxy S24", 2024],
  ["samsung", "Galaxy A55", 2024],
  ["samsung", "Galaxy M35", 2024],
  // OnePlus
  ["oneplus", "OnePlus 12", 2024],
  ["oneplus", "OnePlus 12R", 2024],
  ["oneplus", "OnePlus Nord 4", 2024],
  // Xiaomi
  ["xiaomi", "Xiaomi 14", 2024],
  ["xiaomi", "Redmi Note 13 Pro", 2024],
  ["xiaomi", "Redmi 13C", 2023],
  // Realme
  ["realme", "Realme 12 Pro+", 2024],
  ["realme", "Realme Narzo 70", 2024],
  ["realme", "Realme GT 6", 2024],
  // Vivo
  ["vivo", "Vivo V30 Pro", 2024],
  ["vivo", "Vivo Y200", 2024],
  ["vivo", "Vivo X100", 2024],
  // Oppo
  ["oppo", "Oppo Reno 12 Pro", 2024],
  ["oppo", "Oppo F27 Pro+", 2024],
  ["oppo", "Oppo A79", 2023],
  // Google
  ["google", "Pixel 9 Pro", 2024],
  ["google", "Pixel 8a", 2024],
  // Motorola
  ["motorola", "Moto Edge 50 Pro", 2024],
  ["motorola", "Moto G84", 2023],
  // Nothing
  ["nothing", "Nothing Phone 2", 2023],
  ["nothing", "Nothing Phone 2a", 2024],
  ["nothing", "CMF Phone 1", 2024],
];

export const deviceModels: DeviceModel[] = modelSeeds.map(
  ([brandSlug, name, year]) => ({
    id: `dmodel-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    deviceBrandId: `dbrand-${brandSlug}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    imageUrl: productPlaceholder(name, name),
    releaseYear: year,
  })
);

export function modelsForBrand(brandId: string): DeviceModel[] {
  return deviceModels.filter((m) => m.deviceBrandId === brandId);
}
