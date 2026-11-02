import { createServiceClient } from "@/lib/supabase/service";
import { refundRazorpayPayment } from "@/lib/payment/refund";
import { formatINR } from "@/lib/utils";
import {
  ACTIVE_FULFILLMENT_STATUSES,
  loadCustomerContact,
  notifyCustomer,
} from "@/lib/fulfillment/failure";

export async function refundFulfillmentLine(fulfillmentId: string): Promise<
  { ok: true; refundedInr: number; cancelledOrder: boolean } | { ok: false; error: string }
> {
  const sb = createServiceClient();
  if (!sb) return { ok: false, error: "Server is not configured." };

  const { data: f, error } = await sb
    .from("order_fulfillments")
    .select(
      "id, order_id, order_item_id, status, quantity, customer_unit_price, product_id"
    )
    .eq("id", fulfillmentId)
    .maybeSingle();
  if (error || !f) return { ok: false, error: "Fulfillment not found." };
  if (!["failed", "pending", "rejected"].includes(String(f.status))) {
    return { ok: false, error: `Cannot refund a ${f.status} line.` };
  }

  const lineTotal = Number(f.customer_unit_price) * Number(f.quantity);
  const { data: allFf } = await sb
    .from("order_fulfillments")
    .select("id, status")
    .eq("order_id", f.order_id);

  const othersActive = (allFf ?? []).some(
    (row) =>
      String(row.id) !== fulfillmentId &&
      ACTIVE_FULFILLMENT_STATUSES.has(String(row.status))
  );
  const othersProgressed = (allFf ?? []).some(
    (row) =>
      String(row.id) !== fulfillmentId &&
      ["accepted", "packed", "shipped", "delivered"].includes(String(row.status))
  );
  const cancelOrder = !othersActive && !othersProgressed;

  const { data: payment } = await sb
    .from("payments")
    .select("id, gateway, gateway_payment_id, amount, status, refunded_amount")
    .eq("order_id", f.order_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: order } = await sb
    .from("orders")
    .select("order_number, total, payment_method")
    .eq("id", f.order_id)
    .maybeSingle();

  let refundAmount = lineTotal;
  if (cancelOrder && order) refundAmount = Number(order.total ?? lineTotal);

  let refundedInr = 0;
  let refundNote = "COD — item will not be charged.";

  if (payment && ["razorpay", "mock"].includes(String(payment.gateway))) {
    const already = Number(payment.refunded_amount ?? 0);
    const paid = Number(payment.amount ?? 0);
    const toRefund = Math.min(refundAmount, Math.max(0, paid - already));
    if (toRefund > 0 && String(payment.gateway) === "razorpay" && payment.gateway_payment_id) {
      const result = await refundRazorpayPayment({
        paymentId: String(payment.gateway_payment_id),
        amountInr: toRefund,
        notes: {
          orderNumber: String(order?.order_number ?? f.order_id),
          reason: "admin_unfillable_refund",
        },
      });
      if (!result.ok) return { ok: false, error: result.error };
      refundedInr = toRefund;
      const newRefunded = already + toRefund;
      const nextStatus = newRefunded + 0.009 >= paid ? "refunded" : "paid";
      await sb
        .from("payments")
        .update({ refunded_amount: newRefunded, status: nextStatus })
        .eq("id", payment.id);
      if (nextStatus === "refunded") {
        await sb
          .from("orders")
          .update({ payment_status: "refunded" })
          .eq("id", f.order_id);
      }
      refundNote = `Refund of ${formatINR(toRefund)} initiated.`;
    } else if (toRefund > 0 && String(payment.gateway) === "mock") {
      refundedInr = toRefund;
      const newRefunded = already + toRefund;
      const nextStatus = newRefunded + 0.009 >= paid ? "refunded" : payment.status;
      await sb
        .from("payments")
        .update({ refunded_amount: newRefunded, status: nextStatus })
        .eq("id", payment.id);
      refundNote = `Demo refund of ${formatINR(toRefund)} recorded.`;
    }
  }

  await sb
    .from("order_fulfillments")
    .update({
      status: "cancelled",
      notes: `Admin refund: ${refundNote}`,
      waiting_until: null,
    })
    .eq("id", fulfillmentId);

  if (cancelOrder) {
    await sb
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", f.order_id)
      .in("status", ["pending", "confirmed"]);
  }

  const { data: item } = await sb
    .from("order_items")
    .select("title")
    .eq("id", f.order_item_id)
    .maybeSingle();

  const contact = await loadCustomerContact(String(f.order_id));
  if (contact) {
    await notifyCustomer({
      email: contact.email,
      phone: contact.phone,
      name: contact.name,
      subject: `Update on order ${contact.orderNumber}`,
      text: [
        contact.name ? `Hi ${contact.name},` : "Hi,",
        cancelOrder
          ? `Order ${contact.orderNumber} could not be sourced and has been cancelled.`
          : `We could not source ${item?.title ?? "an item"} on order ${contact.orderNumber}. The rest of your order is still being processed.`,
        refundNote,
        "Sorry for the inconvenience.",
      ].join("\n\n"),
    });
  }

  return { ok: true, refundedInr, cancelledOrder: cancelOrder };
}

export async function substituteFulfillmentProduct(
  fulfillmentId: string,
  newProductId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = createServiceClient();
  if (!sb) return { ok: false, error: "Server is not configured." };

  const { data: f } = await sb
    .from("order_fulfillments")
    .select("id, order_id, order_item_id, status, quantity, customer_unit_price")
    .eq("id", fulfillmentId)
    .maybeSingle();
  if (!f) return { ok: false, error: "Fulfillment not found." };
  if (!["failed", "pending", "rejected"].includes(String(f.status))) {
    return { ok: false, error: `Cannot substitute a ${f.status} line.` };
  }

  const { data: product } = await sb
    .from("products")
    .select("id, title, images, price")
    .eq("id", newProductId)
    .maybeSingle();
  if (!product) return { ok: false, error: "Substitute product not found." };

  const images = Array.isArray(product.images) ? product.images : [];
  const imageUrl =
    images[0] && typeof images[0] === "object" && images[0] !== null
      ? String((images[0] as { url?: string }).url ?? "")
      : "";

  const { data: oldItem } = await sb
    .from("order_items")
    .select("title")
    .eq("id", f.order_item_id)
    .maybeSingle();

  await sb
    .from("order_items")
    .update({
      product_id: newProductId,
      title: product.title,
      image_url: imageUrl || null,
    })
    .eq("id", f.order_item_id);

  await sb.from("fulfillment_rejects").delete().eq("order_item_id", f.order_item_id);

  await sb
    .from("order_fulfillments")
    .update({
      product_id: newProductId,
      status: "pending",
      attempt_number: 1,
      distributor_id: null,
      waiting_until: null,
      waiting_notified_at: null,
      failure_notified_at: null,
      reject_reason: null,
      notes: `Admin substitute: ${oldItem?.title ?? "item"} → ${product.title}`,
    })
    .eq("id", fulfillmentId);

  const { error: assignErr } = await sb.rpc("auto_assign_fulfillment", {
    p_fulfillment_id: fulfillmentId,
  });
  if (assignErr) return { ok: false, error: assignErr.message };

  const contact = await loadCustomerContact(String(f.order_id));
  if (contact) {
    await notifyCustomer({
      email: contact.email,
      phone: contact.phone,
      name: contact.name,
      subject: `Substitute on order ${contact.orderNumber}`,
      text: [
        contact.name ? `Hi ${contact.name},` : "Hi,",
        `${oldItem?.title ?? "An item"} on order ${contact.orderNumber} could not be sourced.`,
        `We are sending ${product.title} instead at the same price you paid (${formatINR(Number(f.customer_unit_price))}).`,
        "Reply if you would prefer a refund instead.",
      ].join("\n\n"),
    });
  }

  return { ok: true };
}
