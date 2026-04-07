import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { data: staffData } = await supabase
      .from("staff")
      .select("role, is_active")
      .eq("id", session.user.id)
      .single();

    if (!staffData || !staffData.is_active) {
      return NextResponse.redirect(new URL("/auth/login?error=inactive", req.url));
    }

    if (path.startsWith("/admin") && staffData.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
