import { NextRequest, NextResponse } from "next/server";

/** User agents often used by bots/scanners to probe or attack. */
const SUSPICIOUS_USER_AGENTS = [
  /^$/i, // Empty
  /^curl\//i,
  /^wget\//i,
  /^python-requests/i,
  /^Go-http-client/i,
  /^scanner/i,
  /^nikto/i,
  /^sqlmap/i,
  /^masscan/i,
  /^nmap/i,
  /^zgrab/i,
  /^libwww/i,
  /^java\//i,
  /^PHP\//i,
  /bot(crawler|scan|spider)/i,
  /malicious/i,
];

/** Paths that should only be accessed from same host (e.g. admin APIs from server). */
const SENSITIVE_PATH_PREFIXES = ["/api/admin/"];

function getClientHost(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isLocalhost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("127.") ||
    host.startsWith("::ffff:127.")
  );
}

/**
 * Security checks for the edge middleware.
 * Returns a response to short-circuit the request, or null to continue.
 */
export function runSecurityChecks(request: NextRequest): NextResponse | null {
  const ua = request.headers.get("user-agent") ?? "";
  const pathname = request.nextUrl.pathname;

  // Block suspicious user agents
  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(ua)) {
      if (process.env.NODE_ENV === "development") {
        // Log only in dev; still allow to avoid blocking legitimate tools
        console.warn("[security] Suspicious user agent:", ua.slice(0, 80));
      } else {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // Optional: restrict sensitive API paths to same-origin or localhost
  const restrictSensitiveFromRemote =
    process.env.SECURITY_RESTRICT_ADMIN_API === "true";
  if (restrictSensitiveFromRemote) {
    for (const prefix of SENSITIVE_PATH_PREFIXES) {
      if (pathname.startsWith(prefix)) {
        const host = getClientHost(request);
        const origin = request.headers.get("origin");
        const isSameOrigin =
          origin &&
          (request.nextUrl.origin === origin || origin.includes("localhost"));
        if (!isLocalhost(host) && !isSameOrigin) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      }
    }
  }

  return null;
}

/**
 * Headers to add to responses (rate limiting info, etc.).
 * Apply in middleware after NextResponse.next().
 */
export function securityResponseHeaders(): Record<string, string> {
  return {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": "99",
    "Cache-Control": "no-store",
  };
}

/** Log security-relevant events (can be wired to your logging/monitoring). */
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production" && process.env.SECURITY_LOG_EVENTS === "true") {
    const payload = {
      event,
      path: request.nextUrl.pathname,
      method: request.method,
      host: getClientHost(request),
      ua: request.headers.get("user-agent")?.slice(0, 100),
      ...details,
    };
    console.info("[security]", JSON.stringify(payload));
  }
}
