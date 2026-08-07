import type { Banner, Product, StockStatus } from "@/types";
import { productPlaceholder } from "@/lib/placeholder";
import { mapProduct } from "@/lib/supabase/mappers";

export type ProductInput = {
  id?: string;
  title: string;
  slug: string;
  brandId: string;
  categoryId: string;
  department?: string;
  taxonomyCategory?: string;
  subCategory?: string;
  series?: string;
  productCategory?: string;
  productType?: string;
  variantLabel?: string;
  compatibleDevice?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  mrp: number;
  stock: number;
  imageUrl?: string;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
};

export type BannerInput = {
  id?: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  bg?: string;
  textTone?: "light" | "dark";
  sortOrder?: number;
  isActive?: boolean;
};

function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock < 10) return "low_stock";
  return "in_stock";
}

export function productFromInput(input: ProductInput, existing?: Product): Product {
  const id = input.id ?? existing?.id ?? `prod-${Date.now()}`;
  const imageUrl =
    input.imageUrl ||
    existing?.images[0]?.url ||
    productPlaceholder(input.title, id);

  return {
    id,
    slug: input.slug,
    title: input.title,
    brandId: input.brandId,
    categoryId: input.categoryId,
    department: input.department ?? existing?.department ?? "Electronics",
    taxonomyCategory:
      input.taxonomyCategory ?? existing?.taxonomyCategory ?? "Mobile",
    subCategory: input.subCategory ?? existing?.subCategory ?? "",
    series: input.series ?? existing?.series ?? "",
    productCategory:
      input.productCategory ?? existing?.productCategory ?? input.title,
    productType: input.productType ?? existing?.productType ?? "Accessory",
    variantLabel: input.variantLabel ?? existing?.variantLabel ?? "",
    compatibleDevice:
      input.compatibleDevice ?? existing?.compatibleDevice ?? "Universal",
    shortDescription:
      input.shortDescription ?? existing?.shortDescription ?? input.title,
    description: input.description ?? existing?.description ?? input.title,
    price: input.price,
    mrp: input.mrp,
    rating: existing?.rating ?? 0,
    reviewCount: existing?.reviewCount ?? 0,
    stockStatus: stockStatus(input.stock),
    stock: input.stock,
    images: [
      {
        id: `${id}-img-0`,
        productId: id,
        url: imageUrl,
        alt: input.title,
        sortOrder: 0,
      },
    ],
    variants: existing?.variants ?? [],
    features: existing?.features ?? [],
    specs: existing?.specs ?? [],
    compatibleModelIds: existing?.compatibleModelIds ?? [],
    universal: !(input.compatibleDevice || existing?.compatibleDevice),
    colors: existing?.colors ?? [],
    warrantyMonths: existing?.warrantyMonths ?? 12,
    isTrending: input.isTrending ?? existing?.isTrending ?? false,
    isBestSeller: input.isBestSeller ?? existing?.isBestSeller ?? false,
    isNewArrival: input.isNewArrival ?? existing?.isNewArrival ?? true,
    tags: existing?.tags ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function bannerFromInput(input: BannerInput, existing?: Banner): Banner {
  return {
    id: input.id ?? existing?.id ?? `banner-${Date.now()}`,
    title: input.title,
    subtitle: input.subtitle ?? existing?.subtitle ?? "",
    eyebrow: input.eyebrow ?? existing?.eyebrow,
    ctaLabel: input.ctaLabel ?? existing?.ctaLabel ?? "Shop now",
    ctaHref: input.ctaHref ?? existing?.ctaHref ?? "/shop",
    imageUrl: input.imageUrl ?? existing?.imageUrl ?? "",
    bg: input.bg ?? existing?.bg ?? "from-[#16150f] to-[#3f3d35]",
    textTone: input.textTone ?? existing?.textTone ?? "light",
  };
}

export function mapDbProduct(row: Record<string, unknown>): Product {
  return mapProduct(row);
}

export function mapDbBanner(row: Record<string, unknown>): Banner {
  return {
    id: String(row.id),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    eyebrow: row.eyebrow ? String(row.eyebrow) : undefined,
    ctaLabel: String(row.cta_label ?? "Shop now"),
    ctaHref: String(row.cta_href ?? "/shop"),
    imageUrl: String(row.image_url ?? ""),
    bg: String(row.bg ?? "from-[#16150f] to-[#3f3d35]"),
    textTone: row.text_tone === "dark" ? "dark" : "light",
  };
}
