/** @type {import('next').NextConfig} */

/**
 * Content Security Policy – env-aware (dev allows unsafe-eval for Next.js).
 */
function generateCSP() {
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://js.stripe.com",
    "https://checkout.wipay.co.tt",
  ];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  const policies = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
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

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  { key: "Content-Security-Policy", value: generateCSP() },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
