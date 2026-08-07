import { NextResponse } from "next/server";
import { getWhatsAppVerifyToken } from "@/lib/config";
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
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
  };
};

/**
 * Inbound WhatsApp — button taps or text ACCEPT/REJECT.
 * Distributor never needs to open a browser.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
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
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: WaMessage[];
        };
      }>;
    }>;
  };

  const messages =
    root.entry?.flatMap(
      (e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []
    ) ?? [];

  for (const msg of messages) {
    const from = msg.from;
    if (!from) continue;

    let action: "accept" | "reject" | null = null;
    let code: string | undefined;

    if (msg.type === "interactive" && msg.interactive?.button_reply?.id) {
      const parsed = parseWhatsAppActionPayload(
        msg.interactive.button_reply.id
      );
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    } else if (msg.type === "text" && msg.text?.body) {
      const parsed = parseWhatsAppTextCommand(msg.text.body);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
        if (!code) {
          code = (await findLatestOpenTokenForPhone(from)) ?? undefined;
        }
      }
    }

    if (!action) {
      await sendWhatsAppText(
        from,
        "CredoBuy: reply ACCEPT or REJECT, or tap the buttons on the assignment message."
      );
      continue;
    }

    if (!code) {
      await sendWhatsAppText(
        from,
        "No open assignment found. Open /distributor or wait for a new offer."
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
        "Accepted. Stock committed — please pack and ship. Thank you!"
      );
    } else {
      await sendWhatsAppText(
        from,
        "Rejected. We've released your reserve and will route to another partner."
      );
    }
  }
}
