"use client";

import { createClient } from "@/lib/supabase/client";
import { profileFromAuth } from "@/lib/auth/customer";
import type { UserProfile } from "@/types";

export async function loadCustomerProfile(): Promise<UserProfile | null> {
  const sb = createClient();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: row } = await sb
    .from("users")
    .select("full_name, phone, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();
  return profileFromAuth(user, row);
}
