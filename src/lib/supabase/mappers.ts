import type {
  Banner,
  Brand,
  Category,
  Coupon,
  DeviceBrand,
  DeviceModel,
  Distributor,
  Product,
  ProductImage,
  ProductVariant,
  Promotion,
  PromotionPlacement,
  Review,
  StockStatus,
} from "@/types";
import { productPlaceholder } from "@/lib/placeholder";

function stockStatus(stock: number, raw?: string): StockStatus {
  if (raw === "in_stock" || raw === "low_stock" || raw === "out_of_stock") {
    return raw;
  }
  if (stock <= 0) return "out_of_stock";
  if (stock < 10) return "low_stock";
  return "in_stock";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

function asUuidArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

function parseImages(
  id: string,
  title: string,
  value: unknown
): ProductImage[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: `${id}-img`,
        productId: id,
        url: productPlaceholder(title, id),
        alt: title,
        sortOrder: 0,
      },
    ];
  }

  return value
    .map((raw, i) => {
      const img = raw as Record<string, unknown>;
      const url = String(img.url ?? "");
      if (!url) return null;
      return {
        id: String(img.id ?? `${id}-img-${i}`),
        productId: id,
        url,
        alt: String(img.alt ?? title),
        sortOrder: Number(img.sort_order ?? img.sortOrder ?? i),
      } satisfies ProductImage;
    })
    .filter((x): x is ProductImage => Boolean(x))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseVariants(
  productId: string,
  value: unknown,
  fallback?: { price: number; mrp: number; stock: number; slug: string }
): ProductVariant[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((raw, i) => {
      const v = raw as Record<string, unknown>;
      return {
        id: String(v.id ?? `${productId}-var-${i}`),
        productId,
        sku: String(v.sku ?? `${productId}-${i}`),
        name: String(v.name ?? "Default"),
        color: v.color ? String(v.color) : undefined,
        material: v.material ? String(v.material) : undefined,
        price: Number(v.price ?? 0),
        mrp: Number(v.mrp ?? 0),
        stock: Number(v.stock ?? 0),
        isDefault: Boolean(v.is_default ?? v.isDefault ?? i === 0),
      } satisfies ProductVariant;
    });
  }

  // One SKU on the product row — synthesise a default variant for cart/UI
  return [
    {
      id: `${productId}-default`,
      productId,
      sku: fallback?.slug ?? productId,
      name: "Default",
      price: fallback?.price ?? 0,
      mrp: fallback?.mrp ?? 0,
      stock: fallback?.stock ?? 0,
      isDefault: true,
    },
  ];
}

export function mapCategory(row: Record<string, unknown>, productCount = 0): Category {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ""),
    icon: String(row.icon ?? "Package"),
    imageUrl: String(row.image_url ?? ""),
    productCount,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapBrand(row: Record<string, unknown>): Brand {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    logoUrl: String(row.logo_url ?? ""),
  };
}

export function mapDeviceBrand(row: Record<string, unknown>): DeviceBrand {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    logoUrl: String(row.logo_url ?? ""),
  };
}

export function mapDeviceModel(row: Record<string, unknown>): DeviceModel {
  return {
    id: String(row.id),
    deviceBrandId: String(row.device_brand_id),
    slug: String(row.slug),
    name: String(row.name),
    imageUrl: String(row.image_url ?? ""),
    releaseYear: Number(row.release_year ?? 0),
  };
}

export function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row.code),
    description: String(row.description ?? ""),
    type: row.type === "flat" ? "flat" : "percent",
    value: Number(row.value),
    minOrder: Number(row.min_order ?? 0),
    maxDiscount: row.max_discount == null ? undefined : Number(row.max_discount),
    active: Boolean(row.active),
  };
}

export function mapDistributor(row: Record<string, unknown>): Distributor {
  return {
    id: String(row.id),
    name: String(row.name),
    contactPerson: String(row.contact_person ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    productCount: Number(row.product_count ?? 0),
    userId: row.user_id ? String(row.user_id) : undefined,
    priority: row.priority == null ? undefined : Number(row.priority),
  };
}

export function mapBanner(row: Record<string, unknown>): Banner {
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

export function mapPromotion(row: Record<string, unknown>): Promotion {
  return {
    id: String(row.id),
    placement: String(row.placement) as PromotionPlacement,
    title: row.title ? String(row.title) : undefined,
    message: String(row.message),
    href: row.href ? String(row.href) : undefined,
    icon: row.icon ? String(row.icon) : undefined,
    productId: row.product_id ? String(row.product_id) : undefined,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active ?? true),
    validFrom: row.valid_from ? String(row.valid_from) : undefined,
    validTo: row.valid_to ? String(row.valid_to) : undefined,
  };
}

export function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    userName: String(row.user_name),
    rating: Number(row.rating),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    verified: Boolean(row.verified),
  };
}

/** Map a products row (final V1: images/variants/compat on the row). */
export function mapProduct(row: Record<string, unknown>): Product {
  const id = String(row.id);
  const title = String(row.title);
  const stock = Number(row.stock ?? 0);
  const price = Number(row.price);
  const mrp = Number(row.mrp);
  const images = parseImages(
    id,
    title,
    row.product_images ?? row.images
  );
  const variants = parseVariants(id, row.product_variants ?? row.variants, {
    price,
    mrp,
    stock,
    slug: String(row.slug),
  });
  const compatibleModelIds = asUuidArray(row.compatible_model_ids);
  const brandName =
    row.brand_name != null && String(row.brand_name)
      ? String(row.brand_name)
      : undefined;

  return {
    id,
    slug: String(row.slug),
    title,
    brandId: String(row.brand_id ?? ""),
    brandName,
    categoryId: String(row.category_id ?? ""),
    department: String(row.department ?? ""),
    taxonomyCategory: String(row.taxonomy_category ?? ""),
    subCategory: String(row.sub_category ?? ""),
    series: String(row.series ?? ""),
    productCategory: String(row.product_category ?? ""),
    productType: String(row.product_type ?? ""),
    // Kept on domain type for local demo data; not stored in final DB schema.
    variantLabel: String(row.variant_label ?? variants[0]?.name ?? ""),
    compatibleDevice: String(
      row.compatible_device ??
        (Boolean(row.universal) ? "Universal" : "")
    ),
    shortDescription: String(row.short_description ?? ""),
    description: String(row.description ?? ""),
    price,
    mrp,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    stockStatus: stockStatus(stock, row.stock_status as string | undefined),
    stock,
    images,
    variants,
    features: asStringArray(row.features),
    specs: Array.isArray(row.specs)
      ? (row.specs as { label: string; value: string }[])
      : [],
    compatibleModelIds,
    universal: Boolean(row.universal),
    connectorType: row.connector_type ? String(row.connector_type) : undefined,
    wattage: row.wattage == null ? undefined : Number(row.wattage),
    colors: asStringArray(row.colors),
    material: row.material ? String(row.material) : undefined,
    warrantyMonths: Number(row.warranty_months ?? 12),
    isTrending: Boolean(row.is_trending),
    isBestSeller: Boolean(row.is_best_seller),
    isNewArrival: Boolean(row.is_new_arrival),
    tags: asStringArray(row.tags),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}
