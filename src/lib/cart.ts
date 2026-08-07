import { products as localProducts } from "@/data/products";
import type { CartItem, Coupon, Product, ProductVariant } from "@/types";
import { isSupabaseConfigured } from "@/lib/config";

export interface ResolvedCartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 49;

export function resolveAgainstCatalog(
  items: CartItem[],
  catalog: Product[]
): ResolvedCartItem[] {
  return items
    .map((item) => {
      const product = catalog.find((p) => p.id === item.productId);
      if (!product) return null;
      const variant =
        product.variants.find((v) => v.id === item.variantId) ??
        product.variants[0] ??
        ({
          id: `${product.id}-default`,
          productId: product.id,
          sku: product.slug,
          name: "Default",
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          isDefault: true,
        } satisfies ProductVariant);
      return { product, variant, quantity: item.quantity };
    })
    .filter((x): x is ResolvedCartItem => x !== null);
}

/** Sync resolve — local/demo catalog only. */
export function resolveCartItems(items: CartItem[]): ResolvedCartItem[] {
  return resolveAgainstCatalog(items, localProducts);
}

/**
 * Resolve cart lines. Pass a `fetchProducts` callback from a server action
 * when Supabase is configured (keeps this module client-safe).
 */
export async function resolveCartItemsAsync(
  items: CartItem[],
  fetchProducts?: (ids: string[]) => Promise<Product[]>
): Promise<ResolvedCartItem[]> {
  if (!items.length) return [];
  if (isSupabaseConfigured() && fetchProducts) {
    const catalog = await fetchProducts(items.map((i) => i.productId));
    return resolveAgainstCatalog(items, catalog);
  }
  return resolveAgainstCatalog(items, localProducts);
}

export interface CartTotals {
  subtotal: number;
  mrpTotal: number;
  savings: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/** Compute a coupon discount against a subtotal, honouring its rules. */
export function computeCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (subtotal < coupon.minOrder) return 0;
  if (coupon.type === "flat") return Math.min(coupon.value, subtotal);
  const raw = Math.round((subtotal * coupon.value) / 100);
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
}

export function computeTotals(
  resolved: ResolvedCartItem[],
  coupon?: Coupon | null
): CartTotals {
  const subtotal = resolved.reduce(
    (sum, i) => sum + i.variant.price * i.quantity,
    0
  );
  const mrpTotal = resolved.reduce(
    (sum, i) => sum + i.variant.mrp * i.quantity,
    0
  );
  const itemCount = resolved.reduce((sum, i) => sum + i.quantity, 0);
  const discount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;
  const afterDiscount = subtotal - discount;
  const shipping =
    afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;
  return {
    subtotal,
    mrpTotal,
    savings: Math.max(0, mrpTotal - subtotal),
    discount,
    shipping,
    total: afterDiscount + shipping,
    itemCount,
  };
}

export { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE };
