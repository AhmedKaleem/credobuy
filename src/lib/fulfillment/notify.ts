import { createServiceClient } from "@/lib/supabase/service";
import { createFulfillmentActionToken } from "@/lib/fulfillment/tokens";
import {
  isWhatsAppCloudConfigured,
  isContactEmailConfigured,
  getContactFromEmail,
} from "@/lib/config";
import {
  sendWhatsAppAssignmentButtons,
  sendWhatsAppText,
} from "@/lib/whatsapp/client";
import { Resend } from "resend";

/**
 * After fulfillments are created/assigned, notify each offered distributor
 * via WhatsApp buttons (preferred) and/or email magic links.
 */
export async function notifyDistributorsForOrder(
  orderId: string
): Promise<{ notified: number; errors: string[] }> {
  const sb = createServiceClient();
  if (!sb) return { notified: 0, errors: ["No service client"] };

  const { data: rows, error } = await sb
    .from("order_fulfillments")
    .select(
      "id, quantity, status, distributor_id, product_id, order_id, sla_deadline, customer_unit_price"
    )
    .eq("order_id", orderId)
    .eq("status", "offered");

  if (error || !rows?.length) {
    return {
      notified: 0,
      errors: error ? [error.message] : ["No offered fulfillments"],
    };
  }

  const productIds = [
    ...new Set(rows.map((r) => r.product_id).filter(Boolean).map(String)),
  ];
  const distIds = [
    ...new Set(rows.map((r) => r.distributor_id).filter(Boolean).map(String)),
  ];

  const [{ data: order }, { data: products }, { data: dists }] =
    await Promise.all([
      sb
        .from("orders")
        .select("order_number")
        .eq("id", orderId)
        .maybeSingle(),
      productIds.length
        ? sb.from("products").select("id, title").in("id", productIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      distIds.length
        ? sb
            .from("distributors")
            .select("id, name, phone, email")
            .in("id", distIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name: string;
              phone: string | null;
              email: string | null;
            }[],
          }),
    ]);

  const productMap = new Map(
    (products ?? []).map((p) => [String(p.id), String(p.title)])
  );
  const distMap = new Map(
    (dists ?? []).map((d) => [
      String(d.id),
      {
        id: String(d.id),
        name: String(d.name),
        phone: d.phone ? String(d.phone) : null,
        email: d.email ? String(d.email) : null,
      },
    ])
  );

  const orderNumber = order?.order_number
    ? String(order.order_number)
    : orderId.slice(0, 8);

  let notified = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const dist = row.distributor_id
      ? distMap.get(String(row.distributor_id))
      : undefined;
    if (!dist) continue;

    const productTitle = row.product_id
      ? productMap.get(String(row.product_id)) ?? "Product"
      : "Product";

    const token = await createFulfillmentActionToken({
      fulfillmentId: String(row.id),
      distributorId: dist.id,
      expiresAt: row.sla_deadline
        ? new Date(String(row.sla_deadline))
        : undefined,
    });
    if (!token) {
      errors.push(`Token failed for fulfillment ${row.id}`);
      continue;
    }

    const body = [
      `CredoBuy assignment`,
      `Order ${orderNumber}`,
      `${productTitle} × ${row.quantity}`,
      `Customer price locked — tap Accept or Reject.`,
      `Or reply: ACCEPT ${token.code} / REJECT ${token.code}`,
    ].join("\n");

    let sent = false;

    if (isWhatsAppCloudConfigured() && dist.phone) {
      const wa = await sendWhatsAppAssignmentButtons({
        toPhone: dist.phone,
        body,
        acceptPayload: `ff:accept:${token.code}`,
        rejectPayload: `ff:reject:${token.code}`,
      });
      if (wa.ok) {
        sent = true;
      } else {
        const text = await sendWhatsAppText(
          dist.phone,
          `${body}\n\nAccept: ${token.acceptUrl}\nReject: ${token.rejectUrl}`
        );
        if (text.ok) sent = true;
        else errors.push(`WhatsApp ${dist.name}: ${wa.error}`);
      }
    }

    if (isContactEmailConfigured() && dist.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: getContactFromEmail(),
          to: [dist.email],
          subject: `[CredoBuy] New assignment — ${orderNumber}`,
          text: [
            `Hi ${dist.name},`,
            "",
            body,
            "",
            `Accept: ${token.acceptUrl}`,
            `Reject: ${token.rejectUrl}`,
            "",
            "Customer price is locked. Rejecting will auto-route to another partner.",
          ].join("\n"),
        });
        sent = true;
      } catch (e) {
        errors.push(
          `Email ${dist.name}: ${e instanceof Error ? e.message : "failed"}`
        );
      }
    }

    if (!sent && !isWhatsAppCloudConfigured() && !isContactEmailConfigured()) {
      console.info("[fulfillment notify] Configure WhatsApp or Resend. Links:", {
        distributor: dist.name,
        accept: token.acceptUrl,
        reject: token.rejectUrl,
      });
    }

    if (sent) notified += 1;
  }

  return { notified, errors };
}

/** Resolve latest unused token for a distributor phone (text ACCEPT/REJECT without code). */
export async function findLatestOpenTokenForPhone(
  phone: string
): Promise<string | null> {
  const sb = createServiceClient();
  if (!sb) return null;

  const digits = phone.replace(/\D/g, "");
  const local10 = digits.length >= 10 ? digits.slice(-10) : digits;

  const { data: distList } = await sb
    .from("distributors")
    .select("id, phone")
    .eq("is_active", true);

  const match = (distList ?? []).find((d) => {
    const p = String(d.phone ?? "").replace(/\D/g, "");
    if (!p) return false;
    return p === digits || p.endsWith(local10) || digits.endsWith(p.slice(-10));
  });
  if (!match) return null;

  const { data: token } = await sb
    .from("fulfillment_action_tokens")
    .select("code")
    .eq("distributor_id", match.id)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return token?.code ? String(token.code) : null;
}
