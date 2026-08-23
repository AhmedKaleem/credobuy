"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export async function setDistributorAutoApprovalAction(
  distributorId: string,
  autoApproval: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
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

  const { error } = await sb
    .from("distributors")
    .update({ auto_approval: autoApproval })
    .eq("id", distributorId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/distributors");
  return { ok: true };
}
