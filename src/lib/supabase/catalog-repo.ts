import type {
  Banner,
  Brand,
  Category,
  Coupon,
  DeviceBrand,
  DeviceModel,
  Distributor,
  Product,
  Promotion,
  PromotionPlacement,
  Review,
} from "@/types";
import { createPublicClient } from "@/lib/supabase/public";
import {
  mapBanner,
  mapBrand,
  mapCategory,
  mapCoupon,
  mapDeviceBrand,
  mapDeviceModel,
  mapDistributor,
  mapProduct,
  mapPromotion,
  mapReview,
} from "@/lib/supabase/mappers";

function sb() {
  return createPublicClient();
}

export async function sbGetCategories(): Promise<Category[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return null;

  const { data: products } = await client
    .from("products")
    .select("category_id")
    .eq("is_active", true);
  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    const id = String(p.category_id ?? "");
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return data.map((row) =>
    mapCategory(row as Record<string, unknown>, counts.get(String(row.id)) ?? 0)
  );
}

export async function sbGetBrands(): Promise<Brand[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client.from("brands").select("*").order("name");
  if (error || !data) return null;
  return data.map((row) => mapBrand(row as Record<string, unknown>));
}

export async function sbGetDeviceBrands(): Promise<DeviceBrand[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("device_brands")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return null;
  return data.map((row) => mapDeviceBrand(row as Record<string, unknown>));
}

export async function sbGetDeviceModels(): Promise<DeviceModel[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("device_models")
    .select("*")
    .order("name");
  if (error || !data) return null;
  return data.map((row) => mapDeviceModel(row as Record<string, unknown>));
}

export async function sbGetProducts(opts?: {
  includeInactive?: boolean;
}): Promise<Product[] | null> {
  const client = sb();
  if (!client) return null;

  let q = client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (!opts?.includeInactive) q = q.eq("is_active", true);

  const { data: rows, error } = await q;
  if (error || !rows) return null;

  // Prefer brand_name on the row; fill gaps from brands table.
  const missingBrandIds = [
    ...new Set(
      rows
        .filter((r) => !r.brand_name && r.brand_id)
        .map((r) => String(r.brand_id))
    ),
  ];
  let brandNameById = new Map<string, string>();
  if (missingBrandIds.length) {
    const { data: brands } = await client
      .from("brands")
      .select("id, name")
      .in("id", missingBrandIds);
    brandNameById = new Map(
      (brands ?? []).map((b) => [String(b.id), String(b.name)])
    );
  }

  return rows.map((row) => {
    const mapped = mapProduct(row as Record<string, unknown>);
    if (!mapped.brandName && mapped.brandId) {
      mapped.brandName = brandNameById.get(mapped.brandId);
    }
    return mapped;
  });
}

export async function sbGetBanners(): Promise<Banner[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return null;
  return data.map((row) => mapBanner(row as Record<string, unknown>));
}

export async function sbGetPromotions(
  placement?: PromotionPlacement
): Promise<Promotion[] | null> {
  const client = sb();
  if (!client) return null;
  let q = client
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (placement) q = q.eq("placement", placement);
  const { data, error } = await q;
  if (error || !data) return null;
  return data.map((row) => mapPromotion(row as Record<string, unknown>));
}

export async function sbGetCoupons(): Promise<Coupon[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("coupons")
    .select("*")
    .eq("active", true);
  if (error || !data) return null;
  return data.map((row) => mapCoupon(row as Record<string, unknown>));
}

export async function sbGetDistributors(): Promise<Distributor[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("distributors")
    .select("*")
    .order("name");
  if (error || !data) return null;
  return data.map((row) => mapDistributor(row as Record<string, unknown>));
}

export async function sbGetReviews(productId: string): Promise<Review[] | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return data.map((row) => mapReview(row as Record<string, unknown>));
}
