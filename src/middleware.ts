import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/config";
import {
  DIST_REMEMBER_COOKIE,
  DIST_REMEMBER_MAX_AGE,
} from "@/lib/auth/distributor-cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (!request.cookies.get(ADMIN_COOKIE)?.value) {
        return redirectTo(request, "/admin/login", pathname);
      }
    }
    if (pathname.startsWith("/account")) {
      return redirectTo(request, "/login", pathname);
    }
    return NextResponse.next();
  }

  const remember = request.cookies.get(DIST_REMEMBER_COOKIE)?.value === "1";
  const { response, supabase } = createMiddlewareClient(
    request,
    supabaseUrl,
    supabaseKey,
    remember
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return response;
    if (!user) return redirectTo(request, "/admin/login", pathname);
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      return redirectTo(request, "/admin/login", pathname);
    }
    return response;
  }

  if (pathname.startsWith("/distributor")) {
    if (pathname === "/distributor/login" || pathname === "/distributor/act") {
      return response;
    }
    if (!user) return redirectTo(request, "/distributor/login", pathname);
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "distributor") {
      await supabase.auth.signOut();
      return redirectTo(request, "/distributor/login", pathname);
    }
    const { data: dist } = await supabase
      .from("distributors")
      .select("id, is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!dist?.id || dist.is_active === false) {
      await supabase.auth.signOut();
      return redirectTo(request, "/distributor/login", pathname);
    }
    return response;
  }

  if (pathname.startsWith("/account") && !user) {
    return redirectTo(request, "/login", pathname);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

function createMiddlewareClient(
  request: NextRequest,
  supabaseUrl: string,
  supabaseKey: string,
  rememberDistributor: boolean
) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            ...(rememberDistributor ? { maxAge: DIST_REMEMBER_MAX_AGE } : {}),
          })
        );
      },
    },
  });

  return { response, supabase };
}

function redirectTo(request: NextRequest, loginPath: string, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = loginPath;
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/distributor/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/auth/:path*",
  ],
};
