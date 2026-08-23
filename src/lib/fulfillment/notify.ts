import { createServiceClient } from "@/lib/supabase/service";
import { createFulfillmentActionToken } from "@/lib/fulfillment/tokens";
import {
  isWhatsAppCloudConfigured,
  isContactEmailConfigured,
  getContactFromEmail,
} from "@/lib/config";
import {
  sendWhatsAppDistributorOfferTemplate,
  sendWhatsAppText,
} from "@/lib/whatsapp/client";
import { formatINR } from "@/lib/utils";
import { Resend } from "resend";

function portalUrl(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://credobuy.vercel.app").replace(
    /\/$/,
    ""
  );
  return `${base}/distributor`;
}

/**
 * After fulfillments are created/assigned, notify each offered distributor.
 * Plan B: WhatsApp “Visit website” → Accept/Reject in the partner portal
 * (template Accept/Reject buttons are unreliable via webhook).
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
      errors: error ? [error.message] : [],
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
        .select("order_number, total")
        .eq("id", orderId)
        .maybeSingle(),
      productIds.length
        ? sb.from("products").select("id, title").in("id", productIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      distIds.length
        ? sb
            .from("distributors")
            .select("id, name, phone, email, auto_approval")
            .in("id", distIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name: string;
              phone: string | null;
              email: string | null;
              auto_approval?: boolean | null;
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
        autoApproval: Boolean(d.auto_approval),
      },
    ])
  );

  const orderNumber = order?.order_number
    ? String(order.order_number)
    : orderId.slice(0, 8);
  const site = portalUrl();

  let notified = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const dist = row.distributor_id
      ? distMap.get(String(row.distributor_id))
      : undefined;
    if (!dist) continue;
    // Skip partners that should have been auto-accepted already
    if (dist.autoApproval) continue;

    const productTitle = row.product_id
      ? productMap.get(String(row.product_id)) ?? "Product"
      : "Product";

    const lineTotal =
      Number(row.customer_unit_price ?? 0) * Number(row.quantity ?? 1);
    const totalPriceLabel = formatINR(
      Number.isFinite(lineTotal) && lineTotal > 0
        ? lineTotal
        : Number(order?.total ?? 0)
    );

    // Token kept for email deep-links / legacy act URLs; portal is primary path
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

    const acceptPayload = `ff:accept:${token.code}`;
    const rejectPayload = `ff:reject:${token.code}`;

    const body = [
      `CredoBuy assignment`,
      `Order ${orderNumber}`,
      `${productTitle} × ${row.quantity}`,
      `Total Price : ${totalPriceLabel}`,
      `Open the partner portal to Accept or Reject (Visit website).`,
      site,
    ].join("\n");

    let sent = false;

    if (isWhatsAppCloudConfigured() && dist.phone) {
      const tpl = await sendWhatsAppDistributorOfferTemplate({
        toPhone: dist.phone,
        orderNumber,
        productTitle,
        quantity: Number(row.quantity),
        totalPriceLabel,
        acceptPayload,
        rejectPayload,
      });
      if (tpl.ok) {
        sent = true;
      } else {
        const text = await sendWhatsAppText(dist.phone, body);
        if (text.ok) sent = true;
        else
          errors.push(
            `WhatsApp ${dist.name}: ${tpl.error || text.error || "send failed"}`
          );
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
            `Partner portal: ${site}`,
            "(Sign in once and enable Stay signed in to skip login next time.)",
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
      console.info("[fulfillment notify] Configure WhatsApp or Resend.", {
        distributor: dist.name,
        portal: site,
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
