import {
  getWhatsAppCloudConfig,
  getWhatsAppOfferTemplate,
} from "@/lib/config";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Normalize to WhatsApp international format (no +). */
export function normalizeWhatsAppTo(phone: string): string | null {
  let d = digitsOnly(phone);
  if (!d) return null;
  // Common India local 10-digit → add 91
  if (d.length === 10) d = `91${d}`;
  if (d.length < 10 || d.length > 15) return null;
  return d;
}

function waErrorMessage(err: string): string {
  if (err.includes("131030") || err.includes("not in allowed list")) {
    return "Recipient phone not on Meta WhatsApp allowlist (add the distributor number in Meta Developer → WhatsApp → API Setup → To).";
  }
  if (err.includes("Session has expired") || err.includes('"code":190')) {
    return "WhatsApp access token expired. Generate a new token in Meta Developer and update WHATSAPP_ACCESS_TOKEN (local + Vercel).";
  }
  return err.slice(0, 240);
}

async function postWhatsAppMessage(
  payload: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getWhatsAppCloudConfig();
  if (!cfg) {
    return { ok: false, error: "WhatsApp Cloud API is not configured." };
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${cfg.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp send failed:", err);
    return { ok: false, error: waErrorMessage(err) };
  }
  return { ok: true };
}

export async function sendWhatsAppText(
  toPhone: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = normalizeWhatsAppTo(toPhone);
  if (!to) return { ok: false, error: "Invalid distributor phone number." };

  return postWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

/**
 * Interactive buttons — works inside the 24h customer-care window.
 * Prefer `sendWhatsAppDistributorOfferTemplate` for business-initiated offers.
 */
export async function sendWhatsAppAssignmentButtons(input: {
  toPhone: string;
  body: string;
  acceptPayload: string;
  rejectPayload: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = normalizeWhatsAppTo(input.toPhone);
  if (!to) return { ok: false, error: "Invalid distributor phone number." };

  return postWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: input.body.slice(0, 1024) },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: input.acceptPayload.slice(0, 256),
              title: "Accept",
            },
          },
          {
            type: "reply",
            reply: {
              id: input.rejectPayload.slice(0, 256),
              title: "Reject",
            },
          },
        ],
      },
    },
  });
}

/**
 * Approved utility template `distributor_order_offer`:
 * Header: CredoBuy assignment
 * Body: Order {{1}} / {{2}} × {{3}} / Total Price : {{4}} / SLA copy
 * Buttons: Accept (QR), Reject (QR), Visit website (URL → /distributor)
 */
export async function sendWhatsAppDistributorOfferTemplate(input: {
  toPhone: string;
  orderNumber: string;
  productTitle: string;
  quantity: number;
  totalPriceLabel: string;
  acceptPayload: string;
  rejectPayload: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = normalizeWhatsAppTo(input.toPhone);
  if (!to) return { ok: false, error: "Invalid distributor phone number." };

  const { name, language } = getWhatsAppOfferTemplate();

  return postWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name,
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: String(input.orderNumber).slice(0, 100) },
            { type: "text", text: String(input.productTitle).slice(0, 100) },
            { type: "text", text: String(input.quantity) },
            { type: "text", text: String(input.totalPriceLabel).slice(0, 60) },
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [
            {
              type: "payload",
              payload: input.acceptPayload.slice(0, 256),
            },
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "1",
          parameters: [
            {
              type: "payload",
              payload: input.rejectPayload.slice(0, 256),
            },
          ],
        },
        // Visit website is a static URL button on the template — no send-time param
      ],
    },
  });
}
