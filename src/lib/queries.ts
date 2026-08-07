/**
 * Data access layer — Supabase-first.
 *
 * When NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set, every read hits Supabase.
 * Without env (local demo), falls back to bundled `src/data/*`.
 */
import {
  brands as localBrands,
  categories as localCategories,
  deviceBrands as localDeviceBrands,
  deviceModels as localDeviceModels,
} from "@/data/catalog";
import { products as localProducts } from "@/data/products";
import {
  coupons as localCoupons,
  distributors as localDistributors,
  heroBanners as localBanners,
  promotions as localPromotions,
  reviewsForProduct,
} from "@/data/marketing";
import type {
  Brand,
  Category,
  Coupon,
  DeviceBrand,
  DeviceModel,
  Product,
  ProductFilters,
  Promotion,
  PromotionPlacement,
  Review,
} from "@/types";
import { discountPercent } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/config";
import { mergeBanners, mergeProducts } from "@/lib/admin/memory-store";
import {
  applyFilters as applyFiltersBase,
  buildFacets as buildFacetsBase,
  type FilterLookups,
} from "@/lib/catalog-utils";
import {
  sbGetBanners,
  sbGetBrands,
  sbGetCategories,
  sbGetCoupons,
  sbGetDeviceBrands,
  sbGetDeviceModels,
  sbGetDistributors,
  sbGetProducts,
  sbGetPromotions,
  sbGetReviews,
} from "@/lib/supabase/catalog-repo";

export type { FilterLookups };
export { applyFiltersBase as applyFiltersPure, buildFacetsBase as buildFacetsPure };

/* ----------------------------- Lookups cache --------------------------- */

let brandCache: Brand[] = localBrands;
let categoryCache: Category[] = localCategories;
let deviceBrandCache: DeviceBrand[] = localDeviceBrands;
let deviceModelCache: DeviceModel[] = localDeviceModels;

function withLocalCategoryCounts(list: Category[], catalog: Product[]): Category[] {
  return list.map((c) => ({
    ...c,
    productCount: catalog.filter((p) => p.categoryId === c.id).length,
  }));
}

/* ----------------------------- Categories ----------------------------- */

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetCategories();
    if (rows) {
      categoryCache = rows;
      return rows;
    }
  }
  const catalog = mergeProducts(localProducts);
  categoryCache = withLocalCategoryCounts(localCategories, catalog);
  return categoryCache;
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const list = await getCategories();
  return list.find((c) => c.slug === slug) ?? null;
}

/* ------------------------------- Brands -------------------------------- */

export async function getBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetBrands();
    if (rows) {
      brandCache = rows;
      return rows;
    }
  }
  brandCache = localBrands;
  return brandCache;
}

export function getBrandById(id: string): Brand | undefined {
  return brandCache.find((b) => b.id === id) ?? localBrands.find((b) => b.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return (
    categoryCache.find((c) => c.id === id) ??
    localCategories.find((c) => c.id === id)
  );
}

/* --------------------------- Device catalog ---------------------------- */

export async function getDeviceBrands(): Promise<DeviceBrand[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetDeviceBrands();
    if (rows) {
      deviceBrandCache = rows;
      return rows;
    }
  }
  deviceBrandCache = localDeviceBrands;
  return deviceBrandCache;
}

export async function getDeviceBrandBySlug(
  slug: string
): Promise<DeviceBrand | null> {
  const list = await getDeviceBrands();
  return list.find((b) => b.slug === slug) ?? null;
}

export async function getDeviceModels(): Promise<DeviceModel[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetDeviceModels();
    if (rows) {
      deviceModelCache = rows;
      return rows;
    }
  }
  deviceModelCache = localDeviceModels;
  return deviceModelCache;
}

export async function getModelsForBrandSlug(
  slug: string
): Promise<DeviceModel[]> {
  const [brandList, models] = await Promise.all([
    getDeviceBrands(),
    getDeviceModels(),
  ]);
  const brand = brandList.find((b) => b.slug === slug);
  if (!brand) return [];
  return models.filter((m) => m.deviceBrandId === brand.id);
}

export async function getModelBySlug(
  slug: string
): Promise<DeviceModel | null> {
  const models = await getDeviceModels();
  return models.find((m) => m.slug === slug) ?? null;
}

export function getModelById(id: string): DeviceModel | undefined {
  return (
    deviceModelCache.find((m) => m.id === id) ??
    localDeviceModels.find((m) => m.id === id)
  );
}

/* ------------------------------ Products ------------------------------- */

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetProducts();
    if (rows) {
      await getBrands();
      return rows;
    }
  }
  return mergeProducts(localProducts);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const all = await getAllProducts();
  return ids
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export async function getTrending(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isTrending).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  const bestsellers = all.filter((p) => p.isBestSeller);
  if (bestsellers.length >= limit) return bestsellers.slice(0, limit);
  return [...all]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isNewArrival).slice(0, limit);
}

export async function getSpecialOffers(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return [...all]
    .sort(
      (a, b) => discountPercent(b.mrp, b.price) - discountPercent(a.mrp, a.price)
    )
    .slice(0, limit);
}

export async function getRelatedProducts(
  product: Product,
  limit = 6
): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit);
}

export async function getCompatibleProducts(
  modelId: string
): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(
    (p) => p.universal || p.compatibleModelIds.includes(modelId)
  );
}

/* ------------------------------- Filtering ----------------------------- */

/** Server-aware wrapper: falls back to warmed caches when lookups omitted. */
export function applyFilters(
  input: Product[],
  filters: ProductFilters,
  lookups?: FilterLookups
): Product[] {
  return applyFiltersBase(input, filters, {
    categories: lookups?.categories ?? categoryCache,
    brands: lookups?.brands ?? brandCache,
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts();
  return applyFilters(all, { search: query });
}

export function buildFacets(list: Product[], brandList?: Brand[]) {
  return buildFacetsBase(list, brandList ?? brandCache);
}

/* ------------------------------- Reviews ------------------------------- */

export async function getReviews(product: Product): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetReviews(product.id);
    if (rows && rows.length) return rows;
  }
  return reviewsForProduct(product.id, product.rating);
}

/* ------------------------------- Coupons ------------------------------- */

export async function getCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetCoupons();
    if (rows) return rows.filter((c) => c.active);
  }
  return localCoupons.filter((c) => c.active);
}

export async function findCoupon(code: string): Promise<Coupon | undefined> {
  const list = await getCoupons();
  return list.find(
    (c) => c.code.toLowerCase() === code.toLowerCase() && c.active
  );
}

/* ------------------------------- Banners ------------------------------- */

export async function getBanners() {
  if (isSupabaseConfigured()) {
    const rows = await sbGetBanners();
    if (rows && rows.length) return rows;
  }
  return mergeBanners(localBanners);
}

export async function getPromotions(
  placement?: PromotionPlacement
): Promise<Promotion[]> {
  if (isSupabaseConfigured()) {
    const rows = await sbGetPromotions(placement);
    if (rows && rows.length) {
      return rows.filter((p) => p.isActive);
    }
  }
  const list = localPromotions.filter((p) => p.isActive);
  return placement ? list.filter((p) => p.placement === placement) : list;
}

export async function getAnnouncements(): Promise<Promotion[]> {
  return getPromotions("announcement");
}

/** Featured deal product: promo.product_id when set, else highest-discount product. */
export async function getDealOfTheDay(): Promise<{
  product: Product;
  promo?: Promotion;
} | null> {
  const promos = await getPromotions("deal_of_the_day");
  const promo = promos[0];
  if (promo?.productId) {
    const [product] = await getProductsByIds([promo.productId]);
    if (product) return { product, promo };
  }
  const offers = await getSpecialOffers(1);
  if (!offers[0]) return null;
  return { product: offers[0], promo };
}

/* ----------------------------- Distributors ---------------------------- */

export async function getDistributors() {
  if (isSupabaseConfigured()) {
    const rows = await sbGetDistributors();
    if (rows) return rows;
  }
  return localDistributors;
}
