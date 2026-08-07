"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession, requireAdmin } from "@/lib/auth/admin-session";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import {
  bannerFromInput,
  productFromInput,
  type BannerInput,
  type ProductInput,
} from "@/lib/admin/mappers";
import { mapBanner } from "@/lib/supabase/mappers";
import {
  memoryDeleteBanner,
  memoryDeleteProduct,
  memoryGetProduct,
  memoryUpsertBanner,
  memoryUpsertProduct,
} from "@/lib/admin/memory-store";
import { products as seedProducts } from "@/data/products";
import { heroBanners } from "@/data/marketing";
import type { Banner, Product } from "@/types";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function saveProductAction(
  input: ProductInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (!input.price || input.price <= 0)
    return { ok: false, error: "Price must be greater than 0." };
  if (!input.mrp || input.mrp < input.price)
    return { ok: false, error: "MRP must be ≥ selling price." };

  const slug = (input.slug || slugify(input.title)).trim();
  const payload = { ...input, slug };

  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return { ok: false, error: "Supabase unavailable" };

    const images = payload.imageUrl
      ? [{ url: payload.imageUrl, alt: payload.title, sort_order: 0 }]
      : undefined;

    const row: Record<string, unknown> = {
      title: payload.title,
      slug,
      brand_id: payload.brandId || null,
      category_id: payload.categoryId || null,
      department: payload.department ?? null,
      taxonomy_category: payload.taxonomyCategory ?? null,
      sub_category: payload.subCategory ?? null,
      series: payload.series ?? null,
      product_category: payload.productCategory ?? null,
      product_type: payload.productType ?? null,
      short_description: payload.shortDescription ?? null,
      description: payload.description ?? null,
      price: payload.price,
      mrp: payload.mrp,
      stock: payload.stock,
      stock_status:
        payload.stock <= 0
          ? "out_of_stock"
          : payload.stock < 10
            ? "low_stock"
            : "in_stock",
      is_trending: Boolean(payload.isTrending),
      is_best_seller: Boolean(payload.isBestSeller),
      is_new_arrival: Boolean(payload.isNewArrival),
      is_active: payload.isActive !== false,
      universal:
        !payload.compatibleDevice ||
        /universal|all supported/i.test(payload.compatibleDevice),
    };
    if (images) row.product_images = images;

    let productId = payload.id;
    if (productId) {
      const { error } = await sb.from("products").update(row).eq("id", productId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await sb
        .from("products")
        .insert(row)
        .select("id")
        .single();
      if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };
      productId = data.id as string;
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/shop");
    return { ok: true, id: productId! };
  }

  const existing =
    memoryGetProduct(payload.id ?? "") ??
    seedProducts.find((p) => p.id === payload.id);
  const product = productFromInput(payload, existing);
  memoryUpsertProduct(product);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  return { ok: true, id: product.id };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return { ok: false, error: "Supabase unavailable" };
    const { error } = await sb
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    memoryDeleteProduct(id);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, id };
}

export async function saveBannerAction(
  input: BannerInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  if (!input.title.trim()) return { ok: false, error: "Title is required." };

  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return { ok: false, error: "Supabase unavailable" };

    const row = {
      title: input.title,
      subtitle: input.subtitle ?? null,
      eyebrow: input.eyebrow ?? null,
      cta_label: input.ctaLabel ?? "Shop now",
      cta_href: input.ctaHref ?? "/shop",
      image_url: input.imageUrl ?? null,
      bg: input.bg ?? "from-[#16150f] to-[#3f3d35]",
      text_tone: input.textTone ?? "light",
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive !== false,
    };

    if (input.id) {
      const { error } = await sb.from("banners").update(row).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/admin/banners");
      revalidatePath("/");
      return { ok: true, id: input.id };
    }

    const { data, error } = await sb
      .from("banners")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true, id: data.id as string };
  }

  const existing = heroBanners.find((b) => b.id === input.id);
  const banner = bannerFromInput(input, existing);
  memoryUpsertBanner(banner);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true, id: banner.id };
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return { ok: false, error: "Supabase unavailable" };
    const { error } = await sb
      .from("banners")
      .update({ is_active: false })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    memoryDeleteBanner(id);
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true, id };
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (isSupabaseConfigured()) {
    const { sbGetProducts } = await import("@/lib/supabase/catalog-repo");
    const rows = await sbGetProducts({ includeInactive: true });
    return rows ?? [];
  }
  const { mergeProducts } = await import("@/lib/admin/memory-store");
  return mergeProducts(seedProducts);
}

export async function fetchAdminBanners(): Promise<Banner[]> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return [];
    const { data } = await sb
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data ?? []).map((row) => mapBanner(row as Record<string, unknown>));
  }
  const { mergeBanners } = await import("@/lib/admin/memory-store");
  return mergeBanners(heroBanners);
}
