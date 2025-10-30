import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  checkApiRateLimit,
  checkAuthRateLimit,
  getClientIdentifier,
} from "@/src/lib/security/rate-limit";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("payload-token")?.value;
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const identifier = getClientIdentifier(request);

    // Check if this is an auth endpoint
    const isAuthEndpoint =
      pathname.startsWith("/api/auth/login") ||
      (pathname.startsWith("/api/users") && request.method === "POST");

    if (isAuthEndpoint) {
      // Apply strict rate limiting for auth endpoints
      const rateLimitResult = await checkAuthRateLimit(identifier);

      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            error: "Too many authentication attempts. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
            resetAt: rateLimitResult.reset.toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": "5",
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
              "Retry-After": Math.ceil(
                (rateLimitResult.reset.getTime() - Date.now()) / 1000,
              ).toString(),
            },
          },
        );
      }

      // Add rate limit headers to successful auth requests
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", "5");
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimitResult.remaining.toString(),
      );
      response.headers.set(
        "X-RateLimit-Reset",
        rateLimitResult.reset.toISOString(),
      );

      // Continue with other checks
      return continueMiddleware(request, token, pathname, response);
    }

    // Apply global rate limiting for other API endpoints
    const rateLimitResult = await checkApiRateLimit(identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          resetAt: rateLimitResult.reset.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset.getTime() - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString(),
    );
    response.headers.set(
      "X-RateLimit-Reset",
      rateLimitResult.reset.toISOString(),
    );

    // Continue with other checks
    return continueMiddleware(request, token, pathname, response);
  }

  return continueMiddleware(request, token, pathname);
}

function continueMiddleware(
  request: NextRequest,
  token: string | undefined,
  pathname: string,
  response?: NextResponse,
) {
  // CSRF protection for state-changing operations
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Allow requests from the same origin or if no origin header (same-origin requests)
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { error: "Invalid origin", code: "CSRF_ERROR" },
        { status: 403 },
      );
    }
  }

  // Protected routes
  const protectedRoutes = ["/dashboard", "/api/tools/save"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Auth routes (redirect if already authenticated)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response || NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
