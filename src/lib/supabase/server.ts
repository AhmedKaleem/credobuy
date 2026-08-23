import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  DIST_REMEMBER_COOKIE,
  DIST_REMEMBER_MAX_AGE,
} from "@/lib/auth/distributor-cookies";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers
 * and Server Actions. Returns null when Supabase is not configured.
 * Extends session cookie lifetime when distributor “Stay signed in” is set.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  const remember = cookieStore.get(DIST_REMEMBER_COOKIE)?.value === "1";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              ...(remember ? { maxAge: DIST_REMEMBER_MAX_AGE } : {}),
            })
          );
        } catch {
          // Called from a Server Component — safe to ignore when middleware
          // is responsible for refreshing sessions.
        }
      },
    },
  });
}
