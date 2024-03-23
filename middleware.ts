import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { match } from "path-to-regexp";

const protectedRoutes = ["/app/:path*"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  for (const route of protectedRoutes) {
    const urlMatch = match(route, { decode: decodeURIComponent });
    const pathname = req.nextUrl.pathname;
    const search = req.nextUrl.search;

    if (urlMatch(pathname)) {
      const supabase = createMiddlewareClient({ req, res });
      const { data, error } = await supabase.auth.getSession();

      if (!data.session || error) {
        return NextResponse.redirect(
          new URL(
            `/login?return_path=${encodeURIComponent(`${pathname}${search}`)}`,
            req.url,
          ),
        );
      }
      return res;
    }
  }
}
