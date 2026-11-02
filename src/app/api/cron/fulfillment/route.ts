import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runPostAssignPipeline } from "@/lib/fulfillment/pipeline";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  if (!sb) {
    return NextResponse.json({ ok: false, error: "No service client" }, { status: 500 });
  }

  const { error: expireErr } = await sb.rpc("expire_stale_fulfillment_offers");
  const { error: waitErr } = await sb.rpc("retry_waiting_fulfillments");

  const { data: rows } = await sb
    .from("order_fulfillments")
    .select("order_id")
    .or("status.eq.failed,status.eq.pending,status.eq.offered");

  const orderIds = [...new Set((rows ?? []).map((r) => String(r.order_id)))];
  const errors: string[] = [];
  if (expireErr) errors.push(expireErr.message);
  if (waitErr) errors.push(waitErr.message);

  for (const orderId of orderIds.slice(0, 40)) {
    try {
      const result = await runPostAssignPipeline(orderId);
      errors.push(...result.errors);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "pipeline failed");
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    scanned: orderIds.length,
    errors: errors.slice(0, 8),
  });
}
