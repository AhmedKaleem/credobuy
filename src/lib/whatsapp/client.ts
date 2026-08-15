import { getWhatsAppCloudConfig } from "@/lib/config";

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

export async function sendWhatsAppText(
  toPhone: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getWhatsAppCloudConfig();
  if (!cfg) {
    return { ok: false, error: "WhatsApp Cloud API is not configured." };
  }
  const to = normalizeWhatsAppTo(toPhone);
  if (!to) return { ok: false, error: "Invalid distributor phone number." };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${cfg.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp text send failed:", err);
    if (err.includes("131030") || err.includes("not in allowed list")) {
      return {
        ok: false,
        error:
          "Recipient phone not on Meta WhatsApp allowlist (add the distributor number in Meta Developer → WhatsApp → API Setup → To).",
      };
    }
    return { ok: false, error: err.slice(0, 200) };
  }
  return { ok: true };
}

/**
 * Interactive buttons — distributor taps Accept/Reject inside WhatsApp
 * (no browser link required). Payload ids are returned on the webhook.
 */
export async function sendWhatsAppAssignmentButtons(input: {
  toPhone: string;
  body: string;
  acceptPayload: string;
  rejectPayload: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getWhatsAppCloudConfig();
  if (!cfg) {
    return { ok: false, error: "WhatsApp Cloud API is not configured." };
  }
  const to = normalizeWhatsAppTo(input.toPhone);
  if (!to) return { ok: false, error: "Invalid distributor phone number." };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${cfg.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp interactive send failed:", err);
    if (err.includes("131030") || err.includes("not in allowed list")) {
      return {
        ok: false,
        error:
          "Recipient phone not on Meta WhatsApp allowlist (add the distributor number in Meta Developer → WhatsApp → API Setup → To).",
      };
    }
    return { ok: false, error: err.slice(0, 200) };
  }
  return { ok: true };
}
