"use server";

import { findCoupon, getProductsByIds } from "@/lib/queries";
import {
  resolveAgainstCatalog,
  type ResolvedCartItem,
} from "@/lib/cart";
import type { CartItem, Coupon, Product } from "@/types";

/** Client-safe: resolve products by id (Supabase or local fallback). */
export async function fetchProductsByIdsAction(
  ids: string[]
): Promise<Product[]> {
  if (!ids.length) return [];
  return getProductsByIds(ids);
}

/** Client-safe: look up an active coupon. */
export async function findCouponAction(
  code: string
): Promise<Coupon | undefined> {
  return findCoupon(code);
}

/** Client-safe: resolve cart lines against the live catalogue. */
export async function resolveCartItemsAction(
  items: CartItem[]
): Promise<ResolvedCartItem[]> {
  if (!items.length) return [];
  const catalog = await getProductsByIds(items.map((i) => i.productId));
  return resolveAgainstCatalog(items, catalog);
}
