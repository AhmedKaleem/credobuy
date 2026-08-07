"use server";

import { redirect } from "next/navigation";
import {
  checkDemoAdminLogin,
  clearDemoAdminCookie,
  setDemoAdminCookie,
} from "@/lib/auth/admin-session";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function adminLoginAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || password.length < 6) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return { ok: false, error: "Supabase is not available." };

    const { data, error } = await sb.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }

    const { data: profile } = await sb
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      await sb.auth.signOut();
      return { ok: false, error: "This account is not an admin." };
    }

    return { ok: true };
  }

  if (!checkDemoAdminLogin(trimmed, password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  await setDemoAdminCookie(trimmed);
  return { ok: true };
}

export async function adminLogoutAction() {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    await sb?.auth.signOut();
  }
  await clearDemoAdminCookie();
  redirect("/admin/login");
}

export async function distributorLoginAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || password.length < 6) {
    return { ok: false, error: "Enter a valid email and password." };
  }
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Distributor login requires Supabase Auth.",
    };
  }

  const sb = await createClient();
  if (!sb) return { ok: false, error: "Supabase is not available." };

  const { data, error } = await sb.auth.signInWithPassword({
    email: trimmed,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Invalid email or password." };
  }

  const { data: profile } = await sb
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "distributor") {
    await sb.auth.signOut();
    return { ok: false, error: "This account is not a distributor." };
  }

  const { data: dist } = await sb
    .from("distributors")
    .select("id, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!dist?.id || dist.is_active === false) {
    await sb.auth.signOut();
    return {
      ok: false,
      error: "No active distributor profile linked to this account.",
    };
  }

  return { ok: true };
}

export async function distributorLogoutAction() {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    await sb?.auth.signOut();
  }
  redirect("/distributor/login");
}
