/**
 * CORS headers for API routes.
 * Use for OPTIONS preflight and for responses when allowing cross-origin.
 */
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowOrigin =
    origin && allowedOrigins.some((o) => origin === o || origin.endsWith(o))
      ? origin
      : allowedOrigins[0] ?? "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.some((o) => origin === o || origin.endsWith(o));
}
