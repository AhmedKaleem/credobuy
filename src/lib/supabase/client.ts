import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Reads public env vars. When they are not
 * configured (e.g. the demo running on dummy data) this returns null so
 * callers can gracefully fall back.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
