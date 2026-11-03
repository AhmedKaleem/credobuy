"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkDemoAdminLogin,
  clearDemoAdminCookie,
  setDemoAdminCookie,
} from "@/lib/auth/admin-session";
import {
  DIST_REMEMBER_COOKIE,
  DIST_REMEMBER_MAX_AGE,
  distributorCookieOptions,
} from "@/lib/auth/distributor-cookies";
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
  password: string,
  rememberMe = true
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

  const cookieStore = await cookies();
  const rememberOpts = distributorCookieOptions(rememberMe);
  if (rememberMe) {
    cookieStore.set(DIST_REMEMBER_COOKIE, "1", {
      ...rememberOpts,
      httpOnly: true,
    });
  } else {
    cookieStore.set(DIST_REMEMBER_COOKIE, "", {
      ...distributorCookieOptions(false),
      httpOnly: true,
      maxAge: 0,
    });
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

  // Re-assert remember flag after auth cookies were written
  if (rememberMe) {
    cookieStore.set(DIST_REMEMBER_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: DIST_REMEMBER_MAX_AGE,
    });
  }

  return { ok: true };
}

export async function distributorLogoutAction() {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    await sb?.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.set(DIST_REMEMBER_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  redirect("/distributor/login");
}

export type CustomerAuthResult =
  | { ok: true; needsEmailConfirm?: boolean }
  | { ok: false; error: string };

export async function customerLoginAction(
  email: string,
  password: string
): Promise<CustomerAuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || password.length < 6) {
    return { ok: false, error: "Enter a valid email and password." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Sign-in is not configured. Add Supabase keys." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Could not connect to sign-in." };

  const { error } = await sb.auth.signInWithPassword({
    email: trimmed,
    password,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed")) {
      return {
        ok: false,
        error: "Please confirm your email, then sign in.",
      };
    }
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true };
}

export async function customerRegisterAction(
  fullName: string,
  email: string,
  password: string
): Promise<CustomerAuthResult> {
  const name = fullName.trim();
  const trimmed = email.trim().toLowerCase();
  if (!name) return { ok: false, error: "Enter your name." };
  if (!trimmed || password.length < 6) {
    return { ok: false, error: "Enter a valid email and a password of 6+ characters." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Sign-up is not configured. Add Supabase keys." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Could not connect to sign-up." };

  const { getAppBaseUrl } = await import("@/lib/config");
  const { error, data } = await sb.auth.signUp({
    email: trimmed,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${getAppBaseUrl()}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };

  if (data.user) {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const svc = createServiceClient() ?? sb;
    await svc.from("users").upsert(
      {
        id: data.user.id,
        email: trimmed,
        full_name: name,
        role: "customer",
      },
      { onConflict: "id" }
    );
  }

  if (!data.session) {
    return { ok: true, needsEmailConfirm: true };
  }
  return { ok: true };
}

export async function customerLogoutAction() {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    await sb?.auth.signOut();
  }
  redirect("/");
}

export async function updateCustomerProfileAction(input: {
  fullName: string;
  phone?: string;
}): Promise<CustomerAuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Profile updates require Supabase." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "Could not save profile." };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const { error } = await sb
    .from("users")
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  await sb.auth.updateUser({
    data: { full_name: input.fullName.trim() },
  });
  return { ok: true };
}
