/**
 * Content Security Policy generator.
 * Development: allows 'unsafe-eval' for Next.js dev/hot reload.
 * Production: stricter CSP without 'unsafe-eval'.
 */
export function generateCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "https://js.stripe.com",
    "https://checkout.wipay.co.tt",
  ];
  if (isDev) {
    scriptSrc.push("'unsafe-eval'"); // Required for Next.js dev mode
  }

  const policies: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"], // Required for Tailwind
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://res.cloudinary.com",
      "https://encrypted-tbn0.gstatic.com",
    ],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://api.wipay.co.tt",
      "https://api.stripe.com",
      "https://api.resend.com",
    ],
    "frame-src": ["'self'", "https://js.stripe.com", "https://checkout.wipay.co.tt"],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}
