"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/config";
import { computeTotals, resolveAgainstCatalog } from "@/lib/cart";
import { getProductsByIds } from "@/lib/queries";
import { buildTimeline } from "@/lib/orders";
import { generateOrderNumber } from "@/lib/utils";
import type {
  Address,
  CartItem,
  Order,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

export type PlaceOrderInput = {
  items: CartItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  /** Prefill when payment intent already used this number. */
  orderNumber?: string;
  /** Razorpay / gateway references after successful capture. */
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
};

export type PlaceOrderResult =
  | {
      ok: true;
      order: Order;
      persisted: boolean;
      fulfillmentCount: number;
      warning?: string;
    }
  | { ok: false; error: string };

function addressSnapshot(address: Address) {
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    type: address.type,
  };
}

function toDomainOrder(args: {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: Order["status"];
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  placedAt: string;
}): Order {
  return {
    ...args,
    timeline: buildTimeline(args.status, args.placedAt),
  };
}

/**
 * Place an order after client-side payment confirmation (or COD).
 * When Supabase + service role are available: persists orders/items/payments
 * and creates distributor fulfillments. Always returns a domain Order for
 * the local orders store / success page.
 */
export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  if (!input.items?.length) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!input.address?.fullName || !input.address.pincode) {
    return { ok: false, error: "Please select a delivery address." };
  }

  const catalog = await getProductsByIds(input.items.map((i) => i.productId));
  const resolved = resolveAgainstCatalog(input.items, catalog);
  if (!resolved.length) {
    return { ok: false, error: "Cart items are no longer available." };
  }

  const totals = computeTotals(resolved);
  const orderNumber = input.orderNumber?.trim() || generateOrderNumber();
  const placedAt = new Date().toISOString();
  const paymentMethod = input.paymentMethod;
  const paymentStatus: PaymentStatus =
    paymentMethod === "cod" ? "pending" : "paid";
  const orderStatus: Order["status"] =
    paymentMethod === "cod" ? "pending" : "confirmed";

  const domainItems: OrderItem[] = resolved.map((r) => ({
    id: `${orderNumber}-${r.variant.id}`,
    productId: r.product.id,
    variantId: r.variant.id,
    title: r.product.title,
    variantName: r.variant.name,
    imageUrl: r.product.images[0]?.url ?? "",
    price: r.variant.price,
    quantity: r.quantity,
  }));

  // Demo / no Supabase — local order only
  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      persisted: false,
      fulfillmentCount: 0,
      warning: "Supabase not configured — order saved locally only.",
      order: toDomainOrder({
        id: orderNumber,
        orderNumber,
        userId: "local",
        items: domainItems,
        address: input.address,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        status: orderStatus,
        paymentStatus,
        paymentMethod,
        couponCode: input.couponCode,
        placedAt,
      }),
    };
  }

  // Prefer service role so guest checkout can insert + create fulfillments
  const service = createServiceClient();
  const userClient = await createClient();
  let userId: string | null = null;
  if (userClient) {
    const {
      data: { user },
    } = await userClient.auth.getUser();
    userId = user?.id ?? null;
  }

  const sb = service ?? userClient;
  if (!sb) {
    return { ok: false, error: "Supabase is not available." };
  }

  if (!service) {
    // Without service role, RLS requires a logged-in customer for inserts
    if (!userId) {
      return {
        ok: true,
        persisted: false,
        fulfillmentCount: 0,
        warning:
          "Add SUPABASE_SERVICE_ROLE_KEY to persist orders & create fulfillments for guest checkout.",
        order: toDomainOrder({
          id: orderNumber,
          orderNumber,
          userId: "local",
          items: domainItems,
          address: input.address,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          total: totals.total,
          status: orderStatus,
          paymentStatus,
          paymentMethod,
          couponCode: input.couponCode,
          placedAt,
        }),
      };
    }
  }

  const { data: orderRow, error: orderError } = await sb
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: userId,
      address_id: null,
      address_snapshot: addressSnapshot(input.address),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      status: orderStatus,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      coupon_code: input.couponCode ?? null,
      placed_at: placedAt,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    console.error("placeOrder order insert:", orderError);
    return {
      ok: false,
      error: orderError?.message ?? "Could not create order.",
    };
  }

  const orderId = String(orderRow.id);

  const itemRows = resolved.map((r) => ({
    order_id: orderId,
    product_id: r.product.id,
    title: r.product.title,
    variant_name: r.variant.name,
    image_url: r.product.images[0]?.url ?? null,
    price: r.variant.price,
    quantity: r.quantity,
  }));

  const { data: insertedItems, error: itemsError } = await sb
    .from("order_items")
    .insert(itemRows)
    .select("id, product_id, title, variant_name, image_url, price, quantity");

  if (itemsError) {
    console.error("placeOrder items insert:", itemsError);
    // Best-effort cleanup
    await sb.from("orders").delete().eq("id", orderId);
    return { ok: false, error: itemsError.message };
  }

  const { error: payError } = await sb.from("payments").insert({
    order_id: orderId,
    gateway: paymentMethod === "razorpay" ? "razorpay" : paymentMethod,
    gateway_order_id: input.gatewayOrderId ?? null,
    gateway_payment_id: input.gatewayPaymentId ?? null,
    amount: totals.total,
    currency: "INR",
    status: paymentStatus,
  });
  if (payError) {
    console.error("placeOrder payment insert:", payError);
    // Non-fatal for demo — order + items already exist
  }

  // Fulfillments require service role for guests (null user_id)
  let fulfillmentCount = 0;
  let warning: string | undefined;
  const rpcClient = service ?? sb;
  const { data: fulfillments, error: ffError } = await rpcClient.rpc(
    "create_fulfillments_for_order",
    { p_order_id: orderId }
  );

  if (ffError) {
    console.error("placeOrder fulfillments:", ffError);
    warning =
      "Order saved, but fulfillment assignment failed. Check admin → Fulfillment / supplier stock.";
  } else {
    fulfillmentCount = Array.isArray(fulfillments) ? fulfillments.length : 0;
    try {
      const { notifyDistributorsForOrder } = await import(
        "@/lib/fulfillment/notify"
      );
      const notify = await notifyDistributorsForOrder(orderId);
      if (notify.errors.length) {
        console.warn("fulfillment notify:", notify.errors);
      }
    } catch (e) {
      console.error("fulfillment notify failed:", e);
    }
  }

  const mappedItems: OrderItem[] = (insertedItems ?? []).map((row, i) => ({
    id: String(row.id),
    productId: String(row.product_id ?? domainItems[i]?.productId ?? ""),
    variantId: domainItems[i]?.variantId ?? `${orderId}-default`,
    title: String(row.title),
    variantName: String(row.variant_name ?? ""),
    imageUrl: String(row.image_url ?? ""),
    price: Number(row.price),
    quantity: Number(row.quantity),
  }));

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath("/distributor");

  return {
    ok: true,
    persisted: true,
    fulfillmentCount,
    warning,
    order: toDomainOrder({
      id: orderId,
      orderNumber,
      userId: userId ?? "guest",
      items: mappedItems.length ? mappedItems : domainItems,
      address: input.address,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      status: orderStatus,
      paymentStatus,
      paymentMethod,
      couponCode: input.couponCode,
      placedAt,
    }),
  };
}
