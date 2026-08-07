import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  getAdminSessionSecret,
  getDemoAdminCredentials,
  isSupabaseConfigured,
} from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

function sign(payload: string): string {
  return createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("hex");
}

export function createDemoAdminToken(email: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const body = `${email}|${exp}`;
  return `${Buffer.from(body).toString("base64url")}.${sign(body)}`;
}

export function verifyDemoAdminToken(token: string | undefined): string | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  try {
    const body = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const [email, expStr] = body.split("|");
    if (!email || !expStr || Number(expStr) < Date.now()) return null;
    return email;
  } catch {
    return null;
  }
}

export async function setDemoAdminCookie(email: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createDemoAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDemoAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<{
  email: string;
  mode: "supabase" | "demo";
} | null> {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    if (!sb) return null;
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user?.email) return null;
    const { data: profile } = await sb
      .from("users")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") return null;
    return { email: user.email, mode: "supabase" };
  }

  const jar = await cookies();
  const email = verifyDemoAdminToken(jar.get(ADMIN_COOKIE)?.value);
  if (!email) return null;
  return { email, mode: "demo" };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function checkDemoAdminLogin(email: string, password: string): boolean {
  const creds = getDemoAdminCredentials();
  return (
    email.trim().toLowerCase() === creds.email.toLowerCase() &&
    password === creds.password
  );
}
