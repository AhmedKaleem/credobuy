import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/config";
import type { Coupon, OrderStatus, PaymentMethod, PaymentStatus } from "@/types";
import { mapCoupon } from "@/lib/supabase/mappers";

function sb() {
  return createServiceClient();
}

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  city: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  placedAt: string;
  trackingNumber?: string;
  carrier?: string;
};

export type SupportTicket = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  body: string;
  status: "open" | "replied" | "closed";
  adminReply?: string;
  createdAt: string;
};

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
  if (!isSupabaseConfigured()) return [];
  const client = sb();
  if (!client) return [];

  const { data: orders, error } = await client
    .from("orders")
    .select(
      "id, order_number, address_snapshot, total, status, payment_method, payment_status, placed_at"
    )
    .order("placed_at", { ascending: false })
    .limit(80);
  if (error || !orders) return [];

  const ids = orders.map((o) => String(o.id));
  const [{ data: items }, { data: ships }] = await Promise.all([
    client.from("order_items").select("order_id, quantity").in("order_id", ids),
    client
      .from("shipments")
      .select("order_id, tracking_number, carrier")
      .in("order_id", ids),
  ]);

  const itemCount = new Map<string, number>();
  for (const row of items ?? []) {
    const id = String(row.order_id);
    itemCount.set(id, (itemCount.get(id) ?? 0) + Number(row.quantity ?? 1));
  }
  const shipMap = new Map(
    (ships ?? []).map((s) => [
      String(s.order_id),
      {
        trackingNumber: s.tracking_number ? String(s.tracking_number) : undefined,
        carrier: s.carrier ? String(s.carrier) : undefined,
      },
    ])
  );

  return orders.map((o) => {
    const snap = (o.address_snapshot ?? {}) as Record<string, unknown>;
    const ship = shipMap.get(String(o.id));
    return {
      id: String(o.id),
      orderNumber: String(o.order_number),
      customer: String(snap.fullName ?? "Customer"),
      city: String(snap.city ?? "—"),
      itemCount: itemCount.get(String(o.id)) ?? 0,
      total: Number(o.total),
      status: o.status as OrderStatus,
      paymentMethod: o.payment_method as PaymentMethod,
      paymentStatus: o.payment_status as PaymentStatus,
      placedAt: String(o.placed_at),
      trackingNumber: ship?.trackingNumber,
      carrier: ship?.carrier,
    };
  });
}

export async function listSupportTickets(): Promise<SupportTicket[]> {
  if (!isSupabaseConfigured()) return [];
  const client = sb();
  if (!client) return [];
  const { data, error } = await client
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error || !data) return [];
  return data.map((t) => ({
    id: String(t.id),
    name: String(t.name),
    email: String(t.email),
    phone: t.phone ? String(t.phone) : undefined,
    subject: String(t.subject ?? "Contact"),
    body: String(t.body),
    status: (t.status as SupportTicket["status"]) ?? "open",
    adminReply: t.admin_reply ? String(t.admin_reply) : undefined,
    createdAt: String(t.created_at),
  }));
}

export async function listAdminCustomers(): Promise<
  {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    totalSpent: number;
    joined: string;
  }[]
> {
  if (!isSupabaseConfigured()) return [];
  const client = sb();
  if (!client) return [];
  const { data: users } = await client
    .from("users")
    .select("id, email, full_name, phone, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(80);
  if (!users) return [];
  const ids = users.map((u) => String(u.id));
  const { data: orders } = ids.length
    ? await client
        .from("orders")
        .select("user_id, total")
        .in("user_id", ids)
    : { data: [] as { user_id: string; total: number }[] };

  const stats = new Map<string, { orders: number; spent: number }>();
  for (const o of orders ?? []) {
    const id = String(o.user_id);
    const cur = stats.get(id) ?? { orders: 0, spent: 0 };
    cur.orders += 1;
    cur.spent += Number(o.total);
    stats.set(id, cur);
  }

  return users.map((u) => {
    const s = stats.get(String(u.id));
    return {
      id: String(u.id),
      name: String(u.full_name || u.email),
      email: String(u.email),
      phone: String(u.phone ?? "—"),
      orders: s?.orders ?? 0,
      totalSpent: s?.spent ?? 0,
      joined: String(u.created_at),
    };
  });
}

export async function getAdminDashboardStats() {
  const orders = await listAdminOrders();
  const paid = orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "refunded");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  return {
    orderCount: orders.length,
    revenue,
    recent: orders.slice(0, 5),
  };
}

export async function listAdminCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured()) return [];
  const client = sb();
  if (!client) return [];
  const { data, error } = await client.from("coupons").select("*").order("code");
  if (error || !data) return [];
  return data.map((row) => mapCoupon(row as Record<string, unknown>));
}
