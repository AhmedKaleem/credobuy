import { createServiceClient } from "@/lib/supabase/service";
import { mapFulfillment } from "@/lib/fulfillment/mappers";
import {
  loadActionToken,
  markTokenUsed,
  type ActionKind,
} from "@/lib/fulfillment/tokens";
import type { OrderFulfillment } from "@/types";

export type SystemActionResult =
  | { ok: true; fulfillment: OrderFulfillment; action: ActionKind }
  | { ok: false; error: string };

/**
 * Accept/reject via magic-link code or WhatsApp button payload.
 * Uses service role — token already proved distributor intent.
 */
export async function runFulfillmentActionByCode(
  code: string,
  action: ActionKind,
  reason?: string
): Promise<SystemActionResult> {
  const token = await loadActionToken(code.trim());
  if (!token) {
    return { ok: false, error: "Invalid or unknown action link." };
  }
  if (token.used_at) {
    return { ok: false, error: "This link was already used." };
  }
  if (new Date(token.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This link has expired." };
  }

  const sb = createServiceClient();
  if (!sb) return { ok: false, error: "Server is not configured." };

  const { data: ff, error: ffErr } = await sb
    .from("order_fulfillments")
    .select("id, status, distributor_id")
    .eq("id", token.fulfillment_id)
    .maybeSingle();

  if (ffErr || !ff) {
    return { ok: false, error: "Assignment not found." };
  }
  if (ff.distributor_id !== token.distributor_id) {
    return { ok: false, error: "Assignment no longer belongs to this partner." };
  }
  if (ff.status !== "offered") {
    return {
      ok: false,
      error: `Assignment is already ${ff.status} — no action needed.`,
    };
  }

  if (action === "accept") {
    const { data, error } = await sb.rpc("accept_fulfillment", {
      p_fulfillment_id: token.fulfillment_id,
    });
    if (error) return { ok: false, error: error.message };
    await markTokenUsed(token.code, "accept");
    return {
      ok: true,
      action: "accept",
      fulfillment: mapFulfillment(
        (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
      ),
    };
  }

  const { data, error } = await sb.rpc("reject_fulfillment", {
    p_fulfillment_id: token.fulfillment_id,
    p_reason: reason?.trim() || "Rejected via magic link / WhatsApp",
  });
  if (error) return { ok: false, error: error.message };
  await markTokenUsed(token.code, "reject");

  const fulfillment = mapFulfillment(
    (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
  );

  // Auto-reroute may create a new "offered" row — notify the next partner
  try {
    const { notifyDistributorsForOrder } = await import(
      "@/lib/fulfillment/notify"
    );
    await notifyDistributorsForOrder(fulfillment.orderId);
  } catch (e) {
    console.error("notify after reject failed:", e);
  }

  return {
    ok: true,
    action: "reject",
    fulfillment,
  };
}

/** Parse WhatsApp interactive button id: ff:accept:CODE or ff:reject:CODE */
export function parseWhatsAppActionPayload(
  payload: string
): { action: ActionKind; code: string } | null {
  const m = payload.trim().match(/^ff:(accept|reject):([A-Za-z0-9_-]+)$/i);
  if (!m) return null;
  return { action: m[1].toLowerCase() as ActionKind, code: m[2] };
}

/**
 * Plain-text fallback: ACCEPT <code> / REJECT <code>
 * or ACCEPT/REJECT alone when we can resolve the latest open token for the phone.
 */
export function parseWhatsAppTextCommand(
  text: string
): { action: ActionKind; code?: string } | null {
  const t = text.trim();
  const withCode = t.match(/^(accept|reject|yes|no)\s+([A-Za-z0-9_-]{6,})$/i);
  if (withCode) {
    const raw = withCode[1].toLowerCase();
    const action: ActionKind =
      raw === "accept" || raw === "yes" ? "accept" : "reject";
    return { action, code: withCode[2] };
  }
  if (/^(accept|yes)$/i.test(t)) return { action: "accept" };
  if (/^(reject|no)$/i.test(t)) return { action: "reject" };
  return null;
}
