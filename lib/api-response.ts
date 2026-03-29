import { NextResponse } from "next/server";

/**
 * Standard JSON response headers for API routes.
 * Ensures consistent security and content-type headers.
 */
const JSON_API_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
} as const;

/**
 * Return a NextResponse.json with security headers applied.
 * Use for API route handlers that return JSON.
 */
export function jsonResponse<T>(
  data: T,
  init?: ResponseInit | { status?: number; headers?: HeadersInit }
): NextResponse<T> {
  const res = NextResponse.json(data, init);
  Object.entries(JSON_API_HEADERS).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}
