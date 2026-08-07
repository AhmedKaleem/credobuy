import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { mapFulfillment } from "@/lib/fulfillment/mappers";
import type { FulfillmentStatus, OrderFulfillment } from "@/types";

async function enrich(
  rows: Record<string, unknown>[]
): Promise<OrderFulfillment[]> {
  const sb = await createClient();
  if (!sb || !rows.length) return rows.map(mapFulfillment);

  const orderIds = [...new Set(rows.map((r) => String(r.order_id)))];
  const productIds = [
    ...new Set(rows.map((r) => r.product_id).filter(Boolean).map(String)),
  ];
  const distIds = [
    ...new Set(rows.map((r) => r.distributor_id).filter(Boolean).map(String)),
  ];

  const [orders, products, dists] = await Promise.all([
    sb.from("orders").select("id, order_number").in("id", orderIds),
    productIds.length
      ? sb.from("products").select("id, title").in("id", productIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    distIds.length
      ? sb.from("distributors").select("id, name").in("id", distIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const orderMap = new Map(
    (orders.data ?? []).map((o) => [String(o.id), String(o.order_number)])
  );
  const productMap = new Map(
    (products.data ?? []).map((p) => [String(p.id), String(p.title)])
  );
  const distMap = new Map(
    (dists.data ?? []).map((d) => [String(d.id), String(d.name)])
  );

  return rows.map((r) =>
    mapFulfillment({
      ...r,
      order_number: orderMap.get(String(r.order_id)),
      product_title: r.product_id
        ? productMap.get(String(r.product_id))
        : undefined,
      distributor_name: r.distributor_id
        ? distMap.get(String(r.distributor_id))
        : undefined,
    })
  );
}

export async function listDistributorFulfillments(
  statuses?: FulfillmentStatus[]
): Promise<OrderFulfillment[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = await createClient();
  if (!sb) return [];

  let q = sb
    .from("order_fulfillments")
    .select("*")
    .order("created_at", { ascending: false });

  if (statuses?.length) q = q.in("status", statuses);

  const { data, error } = await q;
  if (error || !data) return [];
  return enrich(data as Record<string, unknown>[]);
}

export async function listAdminFulfillments(
  statuses?: FulfillmentStatus[]
): Promise<OrderFulfillment[]> {
  return listDistributorFulfillments(statuses);
}
