import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return protectAdmin(request, pathname);
  }

  if (pathname.startsWith("/distributor")) {
    return protectDistributor(request, pathname);
  }

  return NextResponse.next();
}

async function protectAdmin(request: NextRequest, pathname: string) {
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const { response, supabase } = createMiddlewareClient(
      request,
      supabaseUrl,
      supabaseKey
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirectTo(request, "/admin/login", pathname);
    }

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

  if (!request.cookies.get(ADMIN_COOKIE)?.value) {
    return redirectTo(request, "/admin/login", pathname);
  }

  return NextResponse.next();
}

async function protectDistributor(request: NextRequest, pathname: string) {
  // Public magic-link accept/reject (no login required)
  if (
    pathname === "/distributor/login" ||
    pathname === "/distributor/act"
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return redirectTo(request, "/distributor/login", pathname);
  }

  const { response, supabase } = createMiddlewareClient(
    request,
    supabaseUrl,
    supabaseKey
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/distributor/login", pathname);
  }

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

function createMiddlewareClient(
  request: NextRequest,
  supabaseUrl: string,
  supabaseKey: string
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
          response.cookies.set(name, value, options)
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
  matcher: ["/admin/:path*", "/distributor/:path*"],
};
