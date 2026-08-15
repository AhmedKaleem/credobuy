import { NextResponse } from "next/server";
import crypto from "crypto";
import { getWhatsAppVerifyToken, getWhatsAppCloudConfig } from "@/lib/config";
import {
  parseWhatsAppActionPayload,
  parseWhatsAppTextCommand,
  runFulfillmentActionByCode,
} from "@/lib/fulfillment/system-actions";
import { findLatestOpenTokenForPhone } from "@/lib/fulfillment/notify";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

export const runtime = "nodejs";

/**
 * Meta webhook verification (GET with hub.* query params).
 * Opening this URL in a browser without those params is expected to fail.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = getWhatsAppVerifyToken();

  // Plain browser visit — not a Meta verification request
  if (!mode && !token && !challenge) {
    return NextResponse.json(
      {
        ok: true,
        message:
          "WhatsApp webhook is live. Meta will call this URL with hub.mode / hub.verify_token / hub.challenge during setup.",
      },
      { status: 200 }
    );
  }

  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    {
      error: "Forbidden",
      hint:
        "hub.verify_token must match WHATSAPP_VERIFY_TOKEN in Vercel env (default: credobuy-wa-verify).",
    },
    { status: 403 }
  );
}

type WaMessage = {
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { payload?: string; text?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
  };
};

function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  // Optional: only enforce when secret is configured
  if (!appSecret) return true;
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const incoming = signatureHeader.slice("sha256=".length);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(incoming)
    );
  } catch {
    return false;
  }
}

/**
 * Inbound WhatsApp — button taps or text ACCEPT/REJECT.
 * Distributor never needs to open a browser.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    console.error("WhatsApp webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Always 200 quickly so Meta doesn't retry aggressively
  try {
    await handleWebhook(body);
  } catch (e) {
    console.error("WhatsApp webhook handler error:", e);
  }
  return NextResponse.json({ ok: true });
}

async function handleWebhook(body: unknown) {
  const root = body as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: WaMessage[];
          statuses?: unknown[];
        };
      }>;
    }>;
  };

  // Ignore delivery/read receipts — only process inbound messages
  const messages =
    root.entry?.flatMap(
      (e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []
    ) ?? [];

  if (!messages.length) return;

  // Cloud API is configured for replies
  if (!getWhatsAppCloudConfig()) {
    console.warn("WhatsApp webhook: message received but Cloud API not configured");
  }

  for (const msg of messages) {
    const from = msg.from;
    if (!from) continue;

    let action: "accept" | "reject" | null = null;
    let code: string | undefined;

    // Interactive reply buttons (preferred)
    if (msg.type === "interactive" && msg.interactive?.button_reply?.id) {
      const parsed = parseWhatsAppActionPayload(
        msg.interactive.button_reply.id
      );
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    }

    // Legacy quick-reply button payload
    if (!action && msg.type === "button" && msg.button?.payload) {
      const parsed = parseWhatsAppActionPayload(msg.button.payload);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    }

    // Plain text: ACCEPT / REJECT [code]
    if (!action && msg.type === "text" && msg.text?.body) {
      const parsed = parseWhatsAppTextCommand(msg.text.body);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
        if (!code) {
          code = (await findLatestOpenTokenForPhone(from)) ?? undefined;
        }
      }
    }

    // Ignore stickers, reactions, unrelated chat — no spam replies
    if (!action) continue;

    if (!code) {
      await sendWhatsAppText(
        from,
        "CredoBuy: no open assignment found for Accept/Reject. Wait for a new offer or open /distributor."
      );
      continue;
    }

    const result = await runFulfillmentActionByCode(
      code,
      action,
      action === "reject" ? "Rejected via WhatsApp" : undefined
    );

    if (!result.ok) {
      await sendWhatsAppText(from, `CredoBuy: ${result.error}`);
      continue;
    }

    if (result.action === "accept") {
      await sendWhatsAppText(
        from,
        "CredoBuy: Accepted. Stock committed — please pack and ship. Thank you!"
      );
    } else {
      await sendWhatsAppText(
        from,
        "CredoBuy: Rejected. Reserve released — we will route to another partner if available."
      );
    }
  }
}
