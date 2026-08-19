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
        field?: string;
        value?: {
          messages?: WaMessage[];
          statuses?: unknown[];
          metadata?: { phone_number_id?: string };
        };
      }>;
    }>;
  };

  // Ignore delivery/read receipts — only process inbound messages
  const messages =
    root.entry?.flatMap(
      (e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []
    ) ?? [];

  if (!messages.length) {
    // Useful when Meta only sends statuses — confirms webhook is reachable
    const statusCount =
      root.entry?.flatMap(
        (e) => e.changes?.flatMap((c) => c.value?.statuses ?? []) ?? []
      ).length ?? 0;
    if (statusCount > 0) {
      console.info("WhatsApp webhook: status update(s) only", { statusCount });
    }
    return;
  }

  console.info("WhatsApp webhook: inbound messages", {
    count: messages.length,
    types: messages.map((m) => m.type),
  });

  // Cloud API is configured for replies
  if (!getWhatsAppCloudConfig()) {
    console.warn(
      "WhatsApp webhook: message received but Cloud API not configured"
    );
  }

  for (const msg of messages) {
    const from = msg.from;
    if (!from) continue;

    let action: "accept" | "reject" | null = null;
    let code: string | undefined;

    // Interactive reply buttons (session + template quick replies)
    if (msg.type === "interactive" && msg.interactive?.button_reply) {
      const id = msg.interactive.button_reply.id ?? "";
      const title = msg.interactive.button_reply.title ?? "";
      const parsed =
        parseWhatsAppActionPayload(id) || parseWhatsAppActionPayload(title);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    }

    // Template / legacy quick-reply button payload
    if (!action && msg.type === "button" && msg.button) {
      const payload = msg.button.payload ?? msg.button.text ?? "";
      const parsed = parseWhatsAppActionPayload(payload);
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
      }
    }

    // Template Accept/Reject without embedded code → latest open token for this phone
    if (action && !code) {
      code = (await findLatestOpenTokenForPhone(from)) ?? undefined;
    }

    // Ignore stickers, reactions, unrelated chat — no spam replies
    if (!action) {
      console.info("WhatsApp webhook: ignored message", {
        from,
        type: msg.type,
        button: msg.button,
        interactive: msg.interactive,
        text: msg.text?.body?.slice(0, 80),
      });
      continue;
    }

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
      // Friendly copy when they tap Accept again on the same template message
      const already =
        /already|accepted|rejected|used|expired/i.test(result.error) &&
        action === "accept"
          ? "CredoBuy: this assignment is already accepted. Visit the distributor portal for details."
          : `CredoBuy: ${result.error}`;
      await sendWhatsAppText(from, already);
      continue;
    }

    if (result.action === "accept") {
      await sendWhatsAppText(
        from,
        "CredoBuy: Accepted. Stock committed — please pack and ship. Open Visit website /distributor for details. Thank you!"
      );
    } else {
      await sendWhatsAppText(
        from,
        "CredoBuy: Rejected. Reserve released — we will route to another partner if available."
      );
    }
  }
}
