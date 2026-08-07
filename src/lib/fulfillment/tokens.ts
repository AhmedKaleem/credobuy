import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { getAppBaseUrl } from "@/lib/config";

const CODE_BYTES = 9; // ~12 url-safe chars

export type ActionKind = "accept" | "reject";

export function magicLinkUrl(code: string, action: ActionKind): string {
  const base = getAppBaseUrl();
  return `${base}/distributor/act?code=${encodeURIComponent(code)}&action=${action}`;
}

/** Create a one-time action code for an offered fulfillment (4h SLA default). */
export async function createFulfillmentActionToken(input: {
  fulfillmentId: string;
  distributorId: string;
  expiresAt?: Date;
}): Promise<{ code: string; acceptUrl: string; rejectUrl: string } | null> {
  const sb = createServiceClient();
  if (!sb) return null;

  const code = randomBytes(CODE_BYTES).toString("base64url");
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + 4 * 60 * 60 * 1000);

  const { error } = await sb.from("fulfillment_action_tokens").insert({
    code,
    fulfillment_id: input.fulfillmentId,
    distributor_id: input.distributorId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) {
    console.error("createFulfillmentActionToken:", error.message);
    return null;
  }

  return {
    code,
    acceptUrl: magicLinkUrl(code, "accept"),
    rejectUrl: magicLinkUrl(code, "reject"),
  };
}

export type TokenRow = {
  id: string;
  code: string;
  fulfillment_id: string;
  distributor_id: string;
  expires_at: string;
  used_at: string | null;
};

export async function loadActionToken(code: string): Promise<TokenRow | null> {
  const sb = createServiceClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("fulfillment_action_tokens")
    .select("id, code, fulfillment_id, distributor_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return null;
  return data as TokenRow;
}

export async function markTokenUsed(
  code: string,
  action: ActionKind
): Promise<void> {
  const sb = createServiceClient();
  if (!sb) return;
  await sb
    .from("fulfillment_action_tokens")
    .update({ used_at: new Date().toISOString(), used_action: action })
    .eq("code", code)
    .is("used_at", null);
}
