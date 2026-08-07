/**
 * Client-safe catalog helpers (no next/headers / Supabase server imports).
 */
import type { Brand, Category, Product, ProductFilters } from "@/types";
import { discountPercent } from "@/lib/utils";

export type FilterLookups = {
  categories?: Category[];
  brands?: Brand[];
};

export function applyFilters(
  input: Product[],
  filters: ProductFilters,
  lookups: FilterLookups = {}
): Product[] {
  let list = [...input];
  const cats = lookups.categories ?? [];
  const brandList = lookups.brands ?? [];

  if (filters.categorySlug) {
    const cat = cats.find((c) => c.slug === filters.categorySlug);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
  }

  if (filters.brandSlugs?.length) {
    const ids = brandList
      .filter((b) => filters.brandSlugs!.includes(b.slug))
      .map((b) => b.id);
    list = list.filter((p) => ids.includes(p.brandId));
  }

  if (filters.modelId) {
    list = list.filter(
      (p) => p.universal || p.compatibleModelIds.includes(filters.modelId!)
    );
  }

  if (typeof filters.minPrice === "number") {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number") {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.minRating) {
    list = list.filter((p) => p.rating >= filters.minRating!);
  }

  if (filters.inStockOnly) {
    list = list.filter((p) => p.stockStatus !== "out_of_stock");
  }

  if (filters.minDiscount) {
    list = list.filter(
      (p) => discountPercent(p.mrp, p.price) >= filters.minDiscount!
    );
  }

  if (filters.connectorTypes?.length) {
    list = list.filter(
      (p) =>
        p.connectorType && filters.connectorTypes!.includes(p.connectorType)
    );
  }

  if (filters.wattages?.length) {
    list = list.filter(
      (p) => p.wattage && filters.wattages!.includes(p.wattage)
    );
  }

  if (filters.colors?.length) {
    list = list.filter((p) =>
      p.colors.some((c) => filters.colors!.includes(c))
    );
  }

  if (filters.materials?.length) {
    list = list.filter(
      (p) => p.material && filters.materials!.includes(p.material)
    );
  }

  if (filters.warrantyMonths?.length) {
    list = list.filter((p) =>
      filters.warrantyMonths!.includes(p.warrantyMonths)
    );
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        (p.brandName?.toLowerCase().includes(q) ?? false)
    );
  }

  switch (filters.sort) {
    case "price_asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating_desc":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      list.sort((a, b) =>
        a.isNewArrival === b.isNewArrival ? 0 : a.isNewArrival ? -1 : 1
      );
      break;
    case "discount_desc":
      list.sort(
        (a, b) =>
          discountPercent(b.mrp, b.price) - discountPercent(a.mrp, a.price)
      );
      break;
    default:
      break;
  }

  return list;
}

export function buildFacets(list: Product[], brandList: Brand[] = []) {
  const connectorTypes = new Set<string>();
  const wattages = new Set<number>();
  const colors = new Set<string>();
  const materials = new Set<string>();
  const warranties = new Set<number>();
  const brandIds = new Set<string>();

  for (const p of list) {
    if (p.connectorType) connectorTypes.add(p.connectorType);
    if (p.wattage) wattages.add(p.wattage);
    p.colors.forEach((c) => colors.add(c));
    if (p.material) materials.add(p.material);
    warranties.add(p.warrantyMonths);
    brandIds.add(p.brandId);
  }

  return {
    connectorTypes: [...connectorTypes].sort(),
    wattages: [...wattages].sort((a, b) => a - b),
    colors: [...colors].sort(),
    materials: [...materials].sort(),
    warranties: [...warranties].sort((a, b) => a - b),
    brands: brandList.filter((b) => brandIds.has(b.id)),
    priceRange: list.length
      ? {
          min: Math.min(...list.map((p) => p.price)),
          max: Math.max(...list.map((p) => p.price)),
        }
      : { min: 0, max: 0 },
  };
}
