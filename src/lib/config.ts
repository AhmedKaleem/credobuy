export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getDemoAdminCredentials() {
  return {
    email: process.env.DEMO_ADMIN_EMAIL ?? "admin@credobuy.com",
    password: process.env.DEMO_ADMIN_PASSWORD ?? "CredoBuy@Admin1",
  };
}

export function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "credobuy-dev-admin-secret";
}

/** WhatsApp support number (digits only, with country code). From .env.local */
export function getSupportWhatsAppNumber(): string {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "919000000000"
  );
}

export const ADMIN_COOKIE = "cb_admin_session";

/** Inbox for contact-form messages. */
export function getContactToEmail(): string {
  return (
    process.env.CONTACT_TO_EMAIL?.trim() || "ahamed.kaleemullah@gmail.com"
  );
}

/**
 * Resend "from" address.
 * Until you verify a domain in Resend, use their onboarding sender.
 */
export function getContactFromEmail(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "CredoBuy <onboarding@resend.dev>"
  );
}

export function isContactEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Public site URL for magic links (no trailing slash). */
export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

/** Verify token for Meta webhook handshake (does not require send credentials). */
export function getWhatsAppVerifyToken(): string {
  return process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "credobuy-wa-verify";
}

/** Meta WhatsApp Cloud API (optional — enables tap Accept/Reject in WhatsApp). */
export function getWhatsAppCloudConfig(): {
  token: string;
  phoneNumberId: string;
  verifyToken: string;
} | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const verifyToken = getWhatsAppVerifyToken();
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId, verifyToken };
}

export function isWhatsAppCloudConfigured(): boolean {
  return Boolean(getWhatsAppCloudConfig());
}
