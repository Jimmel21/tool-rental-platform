import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import {
  runSecurityChecks,
  securityResponseHeaders,
} from "@/lib/security/middleware";

function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityResponseHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default withAuth(
  function middleware(req) {
    const securityBlock = runSecurityChecks(req);
    if (securityBlock) return securityBlock;

    if (req.nextUrl.pathname.startsWith("/api") && req.method === "OPTIONS") {
      const origin = req.headers.get("origin");
      return applySecurityHeaders(
        new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
      );
    }

    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return applySecurityHeaders(
          NextResponse.redirect(new URL("/dashboard", req.url))
        );
      }
      return applySecurityHeaders(NextResponse.next());
    }

    if (pathname.startsWith("/dashboard")) {
      const allowed = ["CUSTOMER", "PARTNER", "ADMIN"];
      if (token?.role && allowed.includes(token.role)) {
        return applySecurityHeaders(NextResponse.next());
      }
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/login", req.url))
      );
    }

    return applySecurityHeaders(NextResponse.next());
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg)).*)",
  ],
};
