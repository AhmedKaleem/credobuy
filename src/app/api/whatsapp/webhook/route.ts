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
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

/**
 * Meta webhook verification (GET with hub.* query params).
 * Debug: GET ?debug=1&token=<WHATSAPP_VERIFY_TOKEN> → recent inbound events.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = getWhatsAppVerifyToken();

  // Debug dump of recent webhook hits (verify token required)
  if (url.searchParams.get("debug") === "1") {
    const debugToken =
      url.searchParams.get("token") || url.searchParams.get("hub.verify_token");
    if (debugToken !== expected) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const sb = createServiceClient();
    if (!sb) {
      return NextResponse.json({
        ok: false,
        error: "No service client — set SUPABASE_SERVICE_ROLE_KEY on Vercel.",
      });
    }
    const { data, error } = await sb
      .from("whatsapp_webhook_events")
      .select(
        "id, received_at, signature_ok, phone_number_id, message_types, from_phone, parsed_action, parsed_code, handler_result, error"
      )
      .order("received_at", { ascending: false })
      .limit(20);
    return NextResponse.json({
      ok: true,
      webhookUrl: "https://credobuy.vercel.app/api/whatsapp/webhook",
      verifyTokenConfigured: Boolean(expected),
      cloudApiConfigured: Boolean(getWhatsAppCloudConfig()),
      events: error ? [] : data ?? [],
      eventsError: error?.message ?? null,
      hint:
        error?.message?.includes("whatsapp_webhook_events")
          ? "Run supabase/migrate_whatsapp_webhook_events.sql in Supabase SQL editor."
          : !data?.length
            ? "No webhook POSTs logged yet — Meta is not reaching this URL, or messages is not subscribed."
            : null,
    });
  }

  // Plain browser visit — not a Meta verification request
  if (!mode && !token && !challenge) {
    return NextResponse.json(
      {
        ok: true,
        message:
          "WhatsApp webhook is live. Meta will call this URL with hub.mode / hub.verify_token / hub.challenge during setup.",
        debug:
          "Add ?debug=1&token=YOUR_VERIFY_TOKEN to see recent inbound webhook events.",
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
    .update(rawBody, "utf8")
    .digest("hex");
  const incoming = signatureHeader.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(incoming, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function logWebhookEvent(row: {
  signature_ok: boolean | null;
  phone_number_id?: string | null;
  message_types?: string[] | null;
  from_phone?: string | null;
  parsed_action?: string | null;
  parsed_code?: string | null;
  handler_result?: string | null;
  payload?: unknown;
  error?: string | null;
}) {
  try {
    const sb = createServiceClient();
    if (!sb) return;
    await sb.from("whatsapp_webhook_events").insert({
      http_method: "POST",
      signature_ok: row.signature_ok,
      phone_number_id: row.phone_number_id ?? null,
      message_types: row.message_types ?? null,
      from_phone: row.from_phone ?? null,
      parsed_action: row.parsed_action ?? null,
      parsed_code: row.parsed_code ?? null,
      handler_result: row.handler_result ?? null,
      payload: row.payload ?? null,
      error: row.error ?? null,
    });
  } catch (e) {
    console.error("whatsapp_webhook_events insert failed:", e);
  }
}

/**
 * Inbound WhatsApp — button taps or text ACCEPT/REJECT.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const signatureOk = verifyMetaSignature(rawBody, signature);

  if (!signatureOk) {
    console.error("WhatsApp webhook: invalid signature");
    await logWebhookEvent({
      signature_ok: false,
      error:
        "Invalid X-Hub-Signature-256. If WHATSAPP_APP_SECRET is set on Vercel, it must match the Meta App Secret exactly — or remove it to skip verification.",
      payload: safeParse(rawBody),
    });
    // Still 200 so Meta does not disable the webhook for config mistakes during setup;
    // we do not process unsigned/invalid payloads when a secret is configured.
    return NextResponse.json({ ok: true, warning: "invalid_signature" });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    await logWebhookEvent({
      signature_ok: true,
      error: "Invalid JSON body",
    });
    return NextResponse.json({ ok: true });
  }

  try {
    await handleWebhook(body);
  } catch (e) {
    console.error("WhatsApp webhook handler error:", e);
    await logWebhookEvent({
      signature_ok: true,
      error: e instanceof Error ? e.message : "handler error",
      payload: body,
    });
  }
  return NextResponse.json({ ok: true });
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return { raw: raw.slice(0, 2000) };
  }
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

  const phoneNumberId =
    root.entry?.flatMap(
      (e) => e.changes?.map((c) => c.value?.metadata?.phone_number_id) ?? []
    )[0] ?? null;

  const messages =
    root.entry?.flatMap(
      (e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []
    ) ?? [];

  const statuses =
    root.entry?.flatMap(
      (e) => e.changes?.flatMap((c) => c.value?.statuses ?? []) ?? []
    ) ?? [];

  if (!messages.length) {
    await logWebhookEvent({
      signature_ok: true,
      phone_number_id: phoneNumberId,
      message_types: [],
      handler_result: statuses.length
        ? `status_only:${statuses.length}`
        : "no_messages",
      payload: body,
    });
    return;
  }

  console.info("WhatsApp webhook: inbound messages", {
    count: messages.length,
    types: messages.map((m) => m.type),
  });

  for (const msg of messages) {
    const from = msg.from;
    if (!from) {
      await logWebhookEvent({
        signature_ok: true,
        phone_number_id: phoneNumberId,
        message_types: [msg.type ?? "unknown"],
        handler_result: "missing_from",
        payload: msg,
      });
      continue;
    }

    let action: "accept" | "reject" | null = null;
    let code: string | undefined;

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

    if (!action && msg.type === "button" && msg.button) {
      const payload = msg.button.payload ?? msg.button.text ?? "";
      const parsed = parseWhatsAppActionPayload(payload);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    }

    if (!action && msg.type === "text" && msg.text?.body) {
      const parsed = parseWhatsAppTextCommand(msg.text.body);
      if (parsed) {
        action = parsed.action;
        code = parsed.code;
      }
    }

    if (action && !code) {
      code = (await findLatestOpenTokenForPhone(from)) ?? undefined;
    }

    if (!action) {
      await logWebhookEvent({
        signature_ok: true,
        phone_number_id: phoneNumberId,
        message_types: [msg.type ?? "unknown"],
        from_phone: from,
        handler_result: "ignored_unparsed",
        payload: msg,
      });
      continue;
    }

    if (!code) {
      await logWebhookEvent({
        signature_ok: true,
        phone_number_id: phoneNumberId,
        message_types: [msg.type ?? "unknown"],
        from_phone: from,
        parsed_action: action,
        handler_result: "no_open_token",
        payload: msg,
      });
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

    await logWebhookEvent({
      signature_ok: true,
      phone_number_id: phoneNumberId,
      message_types: [msg.type ?? "unknown"],
      from_phone: from,
      parsed_action: action,
      parsed_code: code,
      handler_result: result.ok
        ? `${result.action}_ok`
        : `error:${result.error}`,
      payload: msg,
    });

    if (!result.ok) {
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
