/** Cookie / session helpers for distributor “stay signed in”. */

export const DIST_REMEMBER_COOKIE = "cb_dist_remember";

/** 90 days when “Stay signed in” is checked. */
export const DIST_REMEMBER_MAX_AGE = 60 * 60 * 24 * 90;

export function distributorCookieOptions(remember: boolean): {
  path: string;
  sameSite: "lax";
  secure: boolean;
  maxAge?: number;
} {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(remember ? { maxAge: DIST_REMEMBER_MAX_AGE } : {}),
  };
}
