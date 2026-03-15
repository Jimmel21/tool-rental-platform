/**
 * Client-safe auth helpers (no server-only deps like bcrypt/prisma).
 * Use for redirect paths after login.
 */
export function getRedirectPathForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PARTNER":
    case "CUSTOMER":
    default:
      return "/dashboard";
  }
}
