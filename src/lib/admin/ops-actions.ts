"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getContactFromEmail,
  isContactEmailConfigured,
  isSupabaseConfigured,
} from "@/lib/config";
import type { OrderStatus } from "@/types";

type Result = { ok: true } | { ok: false; error: string };

async function adminClient() {
  await requireAdmin();
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");
  return (await createClient()) ?? createServiceClient();
}

export async function saveDistributorAction(input: {
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  priority: number;
  isActive: boolean;
}): Promise<Result> {
  try {
    const sb = await adminClient();
    if (!sb) return { ok: false, error: "Supabase is not available." };
    const row = {
      name: input.name.trim(),
      contact_person: input.contactPerson.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      priority: input.priority || 100,
      is_active: input.isActive,
    };
    if (!row.name) return { ok: false, error: "Name is required." };
    const { error } = input.id
      ? await sb.from("distributors").update(row).eq("id", input.id)
      : await sb.from("distributors").insert(row);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/distributors");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function saveCouponAction(input: {
  id?: string;
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  active: boolean;
}): Promise<Result> {
  try {
    const sb = await adminClient();
    if (!sb) return { ok: false, error: "Supabase is not available." };
    const code = input.code.trim().toUpperCase();
    if (!code) return { ok: false, error: "Code is required." };
    if (!input.value || input.value <= 0)
      return { ok: false, error: "Discount value must be greater than 0." };
    const row = {
      code,
      description: input.description.trim(),
      type: input.type,
      value: input.value,
      min_order: input.minOrder || 0,
      max_discount: input.maxDiscount ?? null,
      active: input.active,
    };
    const { error } = input.id
      ? await sb.from("coupons").update(row).eq("id", input.id)
      : await sb.from("coupons").insert(row);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function updateOrderLogisticsAction(input: {
  orderId: string;
  status: OrderStatus;
  carrier: string;
  trackingNumber: string;
}): Promise<Result> {
  try {
    const sb = await adminClient();
    if (!sb) return { ok: false, error: "Supabase is not available." };

    const { error: orderErr } = await sb
      .from("orders")
      .update({ status: input.status })
      .eq("id", input.orderId);
    if (orderErr) return { ok: false, error: orderErr.message };

    const { data: existing } = await sb
      .from("shipments")
      .select("id")
      .eq("order_id", input.orderId)
      .maybeSingle();

    const shipRow = {
      order_id: input.orderId,
      carrier: input.carrier.trim() || null,
      tracking_number: input.trackingNumber.trim() || null,
      status: input.status,
      shipped_at:
        input.status === "shipped" || input.status === "out_for_delivery"
          ? new Date().toISOString()
          : null,
      delivered_at:
        input.status === "delivered" ? new Date().toISOString() : null,
    };

    const { error: shipErr } = existing
      ? await sb.from("shipments").update(shipRow).eq("id", existing.id)
      : await sb.from("shipments").insert(shipRow);
    if (shipErr) return { ok: false, error: shipErr.message };

    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function replySupportTicketAction(input: {
  ticketId: string;
  reply: string;
  status: "replied" | "closed";
}): Promise<Result> {
  try {
    const sb = await adminClient();
    if (!sb) return { ok: false, error: "Supabase is not available." };
    const reply = input.reply.trim();
    if (!reply) return { ok: false, error: "Reply cannot be empty." };

    const { data: ticket, error: loadErr } = await sb
      .from("support_tickets")
      .select("email, name, subject")
      .eq("id", input.ticketId)
      .maybeSingle();
    if (loadErr || !ticket) return { ok: false, error: "Ticket not found." };

    const { error } = await sb
      .from("support_tickets")
      .update({
        admin_reply: reply,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.ticketId);
    if (error) return { ok: false, error: error.message };

    if (isContactEmailConfigured() && ticket.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: getContactFromEmail(),
        to: String(ticket.email),
        subject: `Re: ${ticket.subject}`,
        text: `Hi ${ticket.name},\n\n${reply}\n\n— CredoBuy support`,
      });
    }

    revalidatePath("/admin/tickets");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
