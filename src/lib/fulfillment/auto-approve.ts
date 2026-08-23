"use server";

import { createServiceClient } from "@/lib/supabase/service";

/**
 * Auto-accept offered lines for distributors with auto_approval = true.
 * Returns how many were auto-accepted (those skip WhatsApp notify).
 */
export async function applyAutoApprovalsForOrder(
  orderId: string
): Promise<{ autoAccepted: number; errors: string[] }> {
  const sb = createServiceClient();
  if (!sb) return { autoAccepted: 0, errors: ["No service client"] };

  const { data: rows, error } = await sb
    .from("order_fulfillments")
    .select("id, distributor_id, status")
    .eq("order_id", orderId)
    .eq("status", "offered");

  if (error || !rows?.length) {
    return {
      autoAccepted: 0,
      errors: error ? [error.message] : [],
    };
  }

  const distIds = [
    ...new Set(
      rows.map((r) => r.distributor_id).filter(Boolean).map(String)
    ),
  ];
  if (!distIds.length) return { autoAccepted: 0, errors: [] };

  const { data: dists } = await sb
    .from("distributors")
    .select("id, auto_approval")
    .in("id", distIds);

  const autoIds = new Set(
    (dists ?? [])
      .filter((d) => Boolean(d.auto_approval))
      .map((d) => String(d.id))
  );

  let autoAccepted = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const distId = row.distributor_id ? String(row.distributor_id) : "";
    if (!distId || !autoIds.has(distId)) continue;

    const { error: accErr } = await sb.rpc("accept_fulfillment", {
      p_fulfillment_id: row.id,
    });
    if (accErr) {
      errors.push(`${row.id}: ${accErr.message}`);
      continue;
    }
    autoAccepted += 1;
  }

  return { autoAccepted, errors };
}
