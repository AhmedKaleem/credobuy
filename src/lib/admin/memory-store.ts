import type { Banner, Product } from "@/types";

/**
 * In-process overlay used when Supabase is not configured so admin CRUD
 * still works in local demo (resets on server restart).
 */
type Store = {
  products: Map<string, Product>;
  deletedProductIds: Set<string>;
  banners: Map<string, Banner>;
  deletedBannerIds: Set<string>;
  bannerOrder: string[] | null;
};

function getStore(): Store {
  const g = globalThis as unknown as { __credoAdminStore?: Store };
  if (!g.__credoAdminStore) {
    g.__credoAdminStore = {
      products: new Map(),
      deletedProductIds: new Set(),
      banners: new Map(),
      deletedBannerIds: new Set(),
      bannerOrder: null,
    };
  }
  return g.__credoAdminStore;
}

export function memoryUpsertProduct(product: Product) {
  const s = getStore();
  s.deletedProductIds.delete(product.id);
  s.products.set(product.id, product);
}

export function memoryDeleteProduct(id: string) {
  const s = getStore();
  s.products.delete(id);
  s.deletedProductIds.add(id);
}

export function memoryGetProduct(id: string): Product | undefined {
  return getStore().products.get(id);
}

export function mergeProducts(base: Product[]): Product[] {
  const s = getStore();
  const map = new Map(base.map((p) => [p.id, p]));
  for (const id of s.deletedProductIds) map.delete(id);
  for (const [id, p] of s.products) map.set(id, p);
  return Array.from(map.values());
}

export function memoryUpsertBanner(banner: Banner) {
  const s = getStore();
  s.deletedBannerIds.delete(banner.id);
  s.banners.set(banner.id, banner);
}

export function memoryDeleteBanner(id: string) {
  const s = getStore();
  s.banners.delete(id);
  s.deletedBannerIds.add(id);
}

export function mergeBanners(base: Banner[]): Banner[] {
  const s = getStore();
  const map = new Map(base.map((b) => [b.id, b]));
  for (const id of s.deletedBannerIds) map.delete(id);
  for (const [id, b] of s.banners) map.set(id, b);
  return Array.from(map.values());
}
