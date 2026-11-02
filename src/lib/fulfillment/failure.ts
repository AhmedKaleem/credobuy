import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getAppBaseUrl,
  getContactFromEmail,
  getContactToEmail,
  getSupportWhatsAppNumber,
  isContactEmailConfigured,
  isWhatsAppCloudConfigured,
} from "@/lib/config";
import { formatINR } from "@/lib/utils";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

export const ACTIVE_FULFILLMENT_STATUSES = new Set([
  "pending",
  "offered",
  "accepted",
  "packed",
  "shipped",
]);

export function snapshotField(
  snapshot: Record<string, unknown> | null,
  key: string
): string | null {
  const v = snapshot?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function reasonLabel(reason: string | null): string {
  if (reason === "no_profitable_distributor") {
    return "no partner at or below the locked customer price";
  }
  if (reason === "max_attempts") {
    return "too many partner declines";
  }
  return "no partner could fulfill this item";
}

export async function sendOpsAlert(text: string): Promise<string | null> {
  const errors: string[] = [];
  if (isWhatsAppCloudConfigured()) {
    const wa = await sendWhatsAppText(getSupportWhatsAppNumber(), text);
    if (!wa.ok) errors.push(wa.error);
  }

  if (isContactEmailConfigured()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: getContactFromEmail(),
        to: getContactToEmail(),
        subject: text.split("\n")[0]?.slice(0, 80) || "CredoBuy ops alert",
        text,
      });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "ops email failed");
    }
  } else {
    console.info("[ops alert]", text);
  }

  return errors.length ? errors.join("; ") : null;
}

export async function notifyCustomer(input: {
  email: string | null;
  phone: string | null;
  name: string | null;
  subject: string;
  text: string;
}): Promise<string | null> {
  const errors: string[] = [];
  if (input.phone && isWhatsAppCloudConfigured()) {
    const wa = await sendWhatsAppText(input.phone, input.text);
    if (!wa.ok) errors.push(wa.error);
  }

  if (input.email && isContactEmailConfigured()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: getContactFromEmail(),
        to: input.email,
        subject: input.subject,
        text: input.text,
      });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "customer email failed");
    }
  }

  return errors.length ? errors.join("; ") : null;
}

export async function loadCustomerContact(orderId: string): Promise<{
  orderNumber: string;
  email: string | null;
  phone: string | null;
  name: string | null;
} | null> {
  const sb = createServiceClient();
  if (!sb) return null;
  const { data: order } = await sb
    .from("orders")
    .select("order_number, user_id, address_snapshot")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;
  const snapshot = (order.address_snapshot ?? null) as Record<
    string,
    unknown
  > | null;
  let email = snapshotField(snapshot, "email");
  if (!email && order.user_id) {
    const { data: user } = await sb
      .from("users")
      .select("email")
      .eq("id", order.user_id)
      .maybeSingle();
    if (user?.email) email = String(user.email);
  }
  return {
    orderNumber: String(order.order_number),
    email,
    phone: snapshotField(snapshot, "phone"),
    name: snapshotField(snapshot, "fullName"),
  };
}

export async function handleWaitingLines(orderId: string): Promise<{
  handled: number;
  errors: string[];
}> {
  const sb = createServiceClient();
  if (!sb) return { handled: 0, errors: ["No service client"] };

  const now = new Date().toISOString();
  const { data: claimed, error } = await sb
    .from("order_fulfillments")
    .update({ waiting_notified_at: now })
    .eq("order_id", orderId)
    .eq("status", "pending")
    .not("waiting_until", "is", null)
    .is("waiting_notified_at", null)
    .select("id, order_item_id, quantity, customer_unit_price, waiting_until, reject_reason");

  if (error) return { handled: 0, errors: [error.message] };
  if (!claimed?.length) return { handled: 0, errors: [] };

  const { data: order } = await sb
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();
  const { data: items } = await sb
    .from("order_items")
    .select("id, title")
    .in(
      "id",
      claimed.map((l) => String(l.order_item_id))
    );
  const titles = new Map(
    (items ?? []).map((i) => [String(i.id), String(i.title)])
  );

  const lines = claimed
    .map((l) => {
      const until = l.waiting_until
        ? new Date(String(l.waiting_until)).toLocaleString("en-IN")
        : "soon";
      return `• ${titles.get(String(l.order_item_id)) ?? "Item"} × ${l.quantity} — holding until ${until} (${reasonLabel(l.reject_reason ? String(l.reject_reason) : null)})`;
    })
    .join("\n");

  const err = await sendOpsAlert(
    [
      `Waiting on stock: ${order?.order_number ?? orderId.slice(0, 8)}`,
      "No partner can fill these lines yet. We will retry for 2 days, then you can refund or substitute.",
      lines,
      `${getAppBaseUrl()}/admin/fulfillment`,
    ].join("\n")
  );

  return { handled: claimed.length, errors: err ? [err] : [] };
}

/**
 * After the restock window expires, mark failed lines for admin action.
 * Does not refund or email the customer — admin chooses refund or substitute.
 */
export async function handleUnfulfillableLines(orderId: string): Promise<{
  handled: number;
  refundedInr: number;
  cancelled: boolean;
  errors: string[];
}> {
  const sb = createServiceClient();
  if (!sb) {
    return {
      handled: 0,
      refundedInr: 0,
      cancelled: false,
      errors: ["No service client"],
    };
  }

  const now = new Date().toISOString();
  const { data: claimed, error: claimErr } = await sb
    .from("order_fulfillments")
    .update({ failure_notified_at: now })
    .eq("order_id", orderId)
    .eq("status", "failed")
    .is("failure_notified_at", null)
    .select(
      "id, order_item_id, quantity, customer_unit_price, reject_reason"
    );

  if (claimErr) {
    return {
      handled: 0,
      refundedInr: 0,
      cancelled: false,
      errors: [claimErr.message],
    };
  }
  if (!claimed?.length) {
    return { handled: 0, refundedInr: 0, cancelled: false, errors: [] };
  }

  const { data: order } = await sb
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();
  const { data: items } = await sb
    .from("order_items")
    .select("id, title")
    .in(
      "id",
      claimed.map((l) => String(l.order_item_id))
    );
  const titles = new Map(
    (items ?? []).map((i) => [String(i.id), String(i.title)])
  );

  const lines = claimed
    .map((l) => {
      const amount = Number(l.customer_unit_price) * Number(l.quantity);
      return `• ${titles.get(String(l.order_item_id)) ?? "Item"} × ${l.quantity} (${formatINR(amount)}) — ${reasonLabel(l.reject_reason ? String(l.reject_reason) : null)}`;
    })
    .join("\n");

  const err = await sendOpsAlert(
    [
      `Admin action needed: ${order?.order_number ?? orderId.slice(0, 8)}`,
      "Restock wait ended. Refund this line or send a substitute product.",
      lines,
      `${getAppBaseUrl()}/admin/fulfillment`,
    ].join("\n")
  );

  return {
    handled: claimed.length,
    refundedInr: 0,
    cancelled: false,
    errors: err ? [err] : [],
  };
}
