"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireDistributor } from "@/lib/auth/distributor-session";
import { requireAdmin } from "@/lib/auth/admin-session";
import { isSupabaseConfigured } from "@/lib/config";
import { mapFulfillment } from "@/lib/fulfillment/mappers";
import type { OrderFulfillment } from "@/types";

export type FulfillmentActionResult =
  | { ok: true; fulfillment: OrderFulfillment }
  | { ok: false; error: string };

function rpcError(error: { message?: string } | null): string {
  return error?.message ?? "Fulfillment action failed.";
}

export async function acceptFulfillmentAction(
  fulfillmentId: string
): Promise<FulfillmentActionResult> {
  try {
    await requireDistributor();
  } catch {
    return { ok: false, error: "Distributor login required." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Supabase is not available." };

  const { data, error } = await sb.rpc("accept_fulfillment", {
    p_fulfillment_id: fulfillmentId,
  });
  if (error) return { ok: false, error: rpcError(error) };

  revalidatePath("/distributor");
  revalidatePath("/admin/fulfillment");
  return {
    ok: true,
    fulfillment: mapFulfillment(
      (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
    ),
  };
}

export async function rejectFulfillmentAction(
  fulfillmentId: string,
  reason?: string
): Promise<FulfillmentActionResult> {
  try {
    await requireDistributor();
  } catch {
    return { ok: false, error: "Distributor login required." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Supabase is not available." };

  const { data, error } = await sb.rpc("reject_fulfillment", {
    p_fulfillment_id: fulfillmentId,
    p_reason: reason?.trim() || null,
  });
  if (error) return { ok: false, error: rpcError(error) };

  const fulfillment = mapFulfillment(
    (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
  );

  try {
    const { runPostAssignPipeline } = await import(
      "@/lib/fulfillment/pipeline"
    );
    await runPostAssignPipeline(fulfillment.orderId);
  } catch (e) {
    console.error("notify after portal reject failed:", e);
  }

  revalidatePath("/distributor");
  revalidatePath("/admin/fulfillment");
  return {
    ok: true,
    fulfillment,
  };
}

export async function adminRerouteFulfillmentAction(
  fulfillmentId: string,
  distributorId?: string | null,
  reason?: string
): Promise<FulfillmentActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin login required." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Supabase is not available." };

  const { data, error } = await sb.rpc("admin_reroute_fulfillment", {
    p_fulfillment_id: fulfillmentId,
    p_distributor_id: distributorId || null,
    p_reason: reason?.trim() || null,
  });
  if (error) return { ok: false, error: rpcError(error) };

  const fulfillment = mapFulfillment(
    (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
  );

  try {
    const { runPostAssignPipeline } = await import(
      "@/lib/fulfillment/pipeline"
    );
    await runPostAssignPipeline(fulfillment.orderId);
  } catch (e) {
    console.error("notify after admin reroute failed:", e);
  }

  revalidatePath("/admin/fulfillment");
  revalidatePath("/distributor");
  return {
    ok: true,
    fulfillment,
  };
}

/** Call after payment succeeds to create assignments + auto-offer. */
export async function createFulfillmentsForOrderAction(
  orderId: string
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  // Prefer service role so guest orders (null user_id) can still assign.
  const { createServiceClient } = await import("@/lib/supabase/service");
  const sb = createServiceClient() ?? (await createClient());
  if (!sb) return { ok: false, error: "Supabase is not available." };

  const { data, error } = await sb.rpc("create_fulfillments_for_order", {
    p_order_id: orderId,
  });
  if (error) return { ok: false, error: rpcError(error) };

  const count = Array.isArray(data) ? data.length : 0;
  try {
    const { runPostAssignPipeline } = await import(
      "@/lib/fulfillment/pipeline"
    );
    await runPostAssignPipeline(orderId);
  } catch (e) {
    console.error("post-assign fulfillment pipeline:", e);
  }

  revalidatePath("/admin/fulfillment");
  revalidatePath("/distributor");
  return { ok: true, count };
}

export async function adminRefundFulfillmentAction(
  fulfillmentId: string
): Promise<FulfillmentActionResult | { ok: true; message: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin login required." };
  }
  const { refundFulfillmentLine } = await import(
    "@/lib/fulfillment/admin-resolution"
  );
  const res = await refundFulfillmentLine(fulfillmentId);
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  return {
    ok: true,
    message: res.cancelledOrder
      ? "Order cancelled and refund attempted."
      : "Line refunded. Remaining items stay in fulfillment.",
  };
}

export async function adminSubstituteFulfillmentAction(
  fulfillmentId: string,
  productId: string
): Promise<FulfillmentActionResult | { ok: true; message: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin login required." };
  }
  if (!productId) return { ok: false, error: "Pick a substitute product." };
  const { substituteFulfillmentProduct } = await import(
    "@/lib/fulfillment/admin-resolution"
  );
  const res = await substituteFulfillmentProduct(fulfillmentId, productId);
  if (!res.ok) return { ok: false, error: res.error };
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const svc = createServiceClient();
    if (svc) {
      const { data } = await svc
        .from("order_fulfillments")
        .select("order_id")
        .eq("id", fulfillmentId)
        .maybeSingle();
      if (data?.order_id) {
        const { runPostAssignPipeline } = await import(
          "@/lib/fulfillment/pipeline"
        );
        await runPostAssignPipeline(String(data.order_id));
      }
    }
  } catch (e) {
    console.error("pipeline after substitute:", e);
  }
  revalidatePath("/admin/fulfillment");
  revalidatePath("/distributor");
  return { ok: true, message: "Substitute assigned and customer notified." };
}
